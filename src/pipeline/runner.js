import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { discoverCapabilities, requireCapabilities } from "../mcp/capability-discovery.js";
import { JustSendAdapter } from "../mcp/justsend-adapter.js";
import { buildEvidencePack, selectRelevantRecords, serializeEvidenceYaml, validateEvidencePack } from "./evidence.js";
import { buildOutline, chooseDocumentType, renderOutlineMarkdown, renderTechnicalDraft, transitionManifest } from "./authoring.js";
import { commitRunPaths, mintRunId, prepareIsolatedRun, runDiff } from "./run-context.js";
import { TraceWriter } from "../tracing/trace-writer.js";
import { buildVisualPlan, renderDiagram } from "./visual.js";
import { applyDeterministicFallback, runImNotAiChangeGate, selectImNotAiRoute } from "./humanize.js";
import { buildAuditReport } from "./audit.js";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function ompVersion() {
  const result = spawnSync("omp", ["--version"], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "unavailable";
}

function upstreamCommits() {
  const text = readFileSync(join(PROJECT_ROOT, "upstreams.lock.yml"), "utf8");
  const result = {};
  let current = null;
  for (const line of text.split("\n")) {
    const key = line.match(/^  ([a-z0-9-]+):$/)?.[1];
    if (key) { current = key; continue; }
    const commit = line.match(/^    commit: "([0-9a-f]{40})"$/)?.[1];
    if (current && commit) result[current] = commit;
  }
  return result;
}

function requestMarkdown(request) {
  return `# 요청\n\n- goal: ${request.goal}\n- audience: ${request.audience}\n- language: ${request.language}\n- document_type: ${request.document_type}\n- date_range: ${request.date_range.date_from} ~ ${request.date_range.date_to}\n- visuals: ${request.visuals}\n- tone: ${request.tone}\n- publication_target: ${request.publication_target}\n\n## 원문 요청\n\n${request.original}\n`;
}

function evidenceMarkdown(pack) {
  const lines = ["# Evidence Pack", ""];
  for (const item of pack.evidence) lines.push(`## ${item.id} · ${item.type}`, "", item.statement, "", `- occurred_at: ${item.occurred_at}`, `- record_id: ${item.source.record_id}`, `- confidence: ${item.confidence}`, `- sensitivity: ${item.sensitivity}`, "");
  if (pack.conflicts.length) lines.push("## Conflicts", "", ...pack.conflicts.map(conflict => `- ${conflict.claim}: ${conflict.variants.map(item => item.value).join(" / ")} (${conflict.resolution})`), "");
  return `${lines.join("\n")}\n`;
}

function mockInvoker(fixture) {
  return async (toolName, args) => {
    const tool = fixture.tools.find(candidate => candidate.name === toolName);
    if (!tool) throw new Error(`mock tool not found: ${toolName}`);
    const description = tool.description.toLowerCase();
    if (description.includes("search")) return selectRelevantRecords(fixture.records, { queryTerms: String(args.query ?? "").split(/\s+/).filter(Boolean) });
    if (description.includes("date range")) return selectRelevantRecords(fixture.records, { dateFrom: args.date_from, dateTo: args.date_to });
    if (description.includes("one record")) return fixture.records.find(record => record.id === args.record_id) ?? null;
    if (description.includes("related")) return [];
    if (description.includes("attachments")) return fixture.records.find(record => record.id === args.record_id)?.attachments ?? [];
    throw new Error("mock write tools are disabled");
  };
}

function integrateDiagram(markdown, visualPlan) {
  if (!visualPlan.visuals.length) return markdown;
  const figures = visualPlan.visuals.map(diagram => `![${diagram.purpose}](diagrams/${diagram.diagram_id.toLowerCase()}.svg)\n\n<!-- diagram: ${diagram.diagram_id}; evidence: ${diagram.evidence_ids.join(", ")} -->`).join("\n\n");
  return `${markdown.trim()}\n\n## 구조 비교 그림\n\n${figures}\n`;
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}

export async function runBlogPipeline({ workspace, fixturePath, request, date = new Date() }) {
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  const runId = mintRunId({ date, slug: "web-parsing-on-device" });
  const context = prepareIsolatedRun({ workspace, runId, slug: "web-parsing-on-device" });
  const plugin = JSON.parse(readFileSync(join(PROJECT_ROOT, "package.json"), "utf8"));
  const manifestPath = join(context.runDir, "manifest.json");
  const tracePath = join(context.runDir, "trace.jsonl");
  context.budget.charge(tracePath);
  const trace = new TraceWriter({ path: tracePath, runId });
  const manifest = {
    run_id: runId,
    request,
    created_at: date.toISOString(),
    omp_version: ompVersion(),
    plugin_version: plugin.version,
    upstreams: upstreamCommits(),
    justsend_server: fixture.server,
    logical_capabilities: [],
    document_type: "auto",
    document_type_reason: "",
    language: "ko",
    humanization_route: null,
    humanization_mode: null,
    diagrams: [],
    evidence_count: 0,
    audit_result: null,
    git_branch: context.branch,
    git_commit: null,
    status: "REQUESTED",
    assumptions: request.assumptions ?? [],
    missing_capabilities: [],
  };
  context.write("request.md", requestMarkdown(request));
  context.write("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
  trace.append("run_started", { branch: context.branch, base_commit: context.baseCommit });
  for (const assumption of manifest.assumptions) trace.append("assumption_recorded", { assumption });
  trace.append("scout_requested", { status: "not-required", reason: "Mock MCP fixture provides source records; no codebase location lookup." });
  trace.append("scout_completed", { status: "skipped", spawned_agent_types: [] });
  transitionManifest(manifestPath, "RESEARCHING");

  const discovery = discoverCapabilities(fixture.tools);
  requireCapabilities(discovery, ["search_records", "get_record", "list_records_by_range"]);
  trace.append("mcp_discovered", { server: fixture.server, logical_capabilities: Object.keys(discovery.capabilities), missing: discovery.missing, ambiguous: discovery.ambiguous });
  const adapter = new JustSendAdapter({ discovery, invoke: mockInvoker(fixture), trace: (event, details) => trace.append(event, details) });
  const ranged = await adapter.listRecordsByRange({ date_from: request.date_range.date_from, date_to: request.date_range.date_to });
  const queried = await adapter.searchRecords({ query: request.query_terms.join(" ") });
  const rangedIds = new Set(ranged.map(record => record.id));
  const selected = queried.filter(record => rangedIds.has(record.id));
  const rejected = fixture.records.filter(record => !selected.some(candidate => candidate.id === record.id));
  selected.forEach(record => trace.append("record_selected", { record_id: record.id }));
  rejected.forEach(record => trace.append("record_rejected", { record_id: record.id, reason: "outside topic or date scope" }));
  const records = [];
  for (const record of selected) records.push(await adapter.getRecord({ record_id: record.id }));

  const pack = buildEvidencePack(records, { topic: request.topic, generatedAt: date.toISOString(), dateFrom: request.date_range.date_from, dateTo: request.date_range.date_to, queryTerms: request.query_terms });
  const validation = validateEvidencePack(pack);
  if (!validation.valid) throw new Error(validation.errors.join("; "));
  const research = `# 조사 요약\n\n- server: ${fixture.server}\n- selected: ${selected.map(record => record.id).join(", ")}\n- rejected: ${rejected.map(record => record.id).join(", ")}\n- duplicates: ${pack.duplicates.map(item => `${item.record_id}->${item.duplicate_of}`).join(", ") || "없음"}\n- conflicts: ${pack.conflicts.map(item => item.claim).join(", ") || "없음"}\n- redacted evidence: ${pack.evidence.filter(item => item.sensitivity === "redacted").length}\n`;
  context.write("research-summary.md", research);
  context.write("evidence.yml", serializeEvidenceYaml(pack));
  context.write("evidence.md", evidenceMarkdown(pack));
  trace.append("evidence_created", { evidence_count: pack.evidence.length, inference_count: pack.inferences.length, conflict_count: pack.conflicts.length, duplicate_count: pack.duplicates.length });
  transitionManifest(manifestPath, "EVIDENCE_READY", { evidence_count: pack.evidence.length, logical_capabilities: Object.keys(discovery.capabilities), missing_capabilities: [...discovery.missing, ...discovery.ambiguous.map(item => item.logical)] });
  let commit = commitRunPaths(context, [context.runRelative], "blog(run): capture request and evidence");
  trace.append("git_commit", { commit, stage: "evidence" });

  const document = chooseDocumentType(request, pack);
  const outline = buildOutline(request, pack);
  context.write("outline.md", renderOutlineMarkdown(outline));
  trace.append("outline_created", { document_type: document.type, section_count: outline.sections.length });
  transitionManifest(manifestPath, "OUTLINED", { document_type: document.type, document_type_reason: document.reason });
  let draft = renderTechnicalDraft({ request, pack, outline });
  context.write("draft.md", draft);
  trace.append("draft_created", { evidence_comments: (draft.match(/<!-- evidence:/g) ?? []).length });
  transitionManifest(manifestPath, "DRAFTED");
  commit = commitRunPaths(context, [context.runRelative], "blog(run): add outline and technical draft");
  trace.append("git_commit", { commit, stage: "draft" });

  const visualPlan = buildVisualPlan(pack);
  context.write("visual-plan.yml", `${JSON.stringify(visualPlan, null, 2)}\n`);
  trace.append("visual_planned", { count: visualPlan.visuals.length, reason: visualPlan.decision ?? null });
  transitionManifest(manifestPath, "VISUAL_PLANNED", { diagrams: visualPlan.visuals.map(item => item.diagram_id) });
  const renderedSvgs = {};
  for (const diagram of visualPlan.visuals) {
    const outputs = renderDiagram(diagram, join(context.runDir, "diagrams"));
    for (const path of [outputs.html, outputs.svg, outputs.png]) context.budget.charge(path);
    renderedSvgs[diagram.diagram_id] = readFileSync(outputs.svg, "utf8");
    trace.append("diagram_rendered", { diagram_id: diagram.diagram_id, formats: diagram.formats, evidence_ids: diagram.evidence_ids });
  }
  draft = integrateDiagram(draft, visualPlan);
  writeFileSync(join(context.runDir, "draft.md"), draft, { encoding: "utf8", mode: 0o600 });
  transitionManifest(manifestPath, "VISUAL_RENDERED");
  commit = commitRunPaths(context, [context.runRelative], "blog(run): add evidence-backed diagrams");
  trace.append("git_commit", { commit, stage: "visual" });

  trace.append("humanize_started", { route_engine: "im-not-ai", prose_mode: "deterministic-fallback", order: "after-visual-integration" });
  const route = selectImNotAiRoute(draft, { vendorRoot: join(PROJECT_ROOT, "skills/justsend-blog/vendor/im-not-ai"), override: request.humanization_route });
  const humanized = applyDeterministicFallback(draft, { route: route.route });
  const gate = runImNotAiChangeGate(draft, humanized, { vendorRoot: join(PROJECT_ROOT, "skills/justsend-blog/vendor/im-not-ai") });
  const humanization = {
    mode: "deterministic-fallback",
    route_engine: "im-not-ai",
    prose_engine: "protected-fixed-substitutions",
    scope: "fixture-and-test-only",
    route: route.route,
    route_hint: route.route_hint,
    route_reason: route.reason,
    ...gate,
  };
  context.write("humanized.md", humanized);
  context.write("humanization.json", `${JSON.stringify(humanization, null, 2)}\n`);
  trace.append("humanize_completed", { mode: humanization.mode, route: route.route, route_hint: route.route_hint, change_rate: gate.change_rate, meaning_preserved: gate.meaning_preserved, verdict: gate.verdict });
  transitionManifest(manifestPath, "HUMANIZED", { humanization_route: route.route, humanization_mode: humanization.mode });
  commit = commitRunPaths(context, [context.runRelative], "blog(run): apply deterministic fixture prose fallback");
  trace.append("git_commit", { commit, stage: "humanize" });

  trace.append("audit_started", { text: true, diagrams: visualPlan.visuals.length });
  const candidate = humanized.replace("status: technical-draft", "status: ready-for-review");
  const audit = buildAuditReport({ technicalDraft: draft, finalMarkdown: candidate, evidencePack: pack, visualPlan, renderedSvgs, humanization });
  context.write("audit.json", `${JSON.stringify(audit, null, 2)}\n`);
  if (audit.result !== "PASS") {
    trace.append("audit_failed", { text: audit.text, diagrams: audit.diagrams, humanization: audit.humanization });
    transitionManifest(manifestPath, "AUDITED", { audit_result: "FAIL" });
    throw new Error("Fidelity audit failed; final.md was not created");
  }
  trace.append("audit_passed", { unsupported_claims: 0, unsupported_nodes: 0, unsupported_edges: 0 });
  transitionManifest(manifestPath, "AUDITED", { audit_result: "PASS", git_commit: commit });
  context.write("final.md", candidate);
  transitionManifest(manifestPath, "READY_FOR_REVIEW");
  trace.append("run_completed", { status: "READY_FOR_REVIEW", auto_publish: false, auto_merge: false });
  const finalCommit = commitRunPaths(context, [context.runRelative], "blog(run): pass fidelity audit");
  return { context, runDir: context.runDir, branch: context.branch, commit: finalCommit, audit, diff: runDiff(context) };
}
