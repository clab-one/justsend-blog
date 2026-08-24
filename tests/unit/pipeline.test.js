import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { discoverCapabilities } from "../../src/mcp/capability-discovery.js";
import { redactText } from "../../src/mcp/redaction.js";
import { buildEvidencePack, deduplicateRecords, validateEvidencePack } from "../../src/pipeline/evidence.js";
import { buildJustSendResearchPack, enrichResearchPack, researchCoverage, validateResearchPack } from "../../src/pipeline/research.js";
import { resolveWithin } from "../../src/pipeline/run-context.js";
import { auditVisual, buildVisualPlan, renderSvg } from "../../src/pipeline/visual.js";
import { rendererForType, selectDiagramType } from "../../src/pipeline/visual-contract.js";
import { auditProtected, applyDeterministicFallback, runImNotAiChangeGate } from "../../src/pipeline/humanize.js";
import { buildAuditReport, deterministicTextAudit } from "../../src/pipeline/audit.js";
import { buildQualityAudit, defaultQualityContract } from "../../src/pipeline/quality.js";

const fixture = JSON.parse(readFileSync(resolve("tests/fixtures/justsend-records.json"), "utf8"));

function packFor(records, options = {}) {
  const generatedAt = options.generatedAt ?? "2026-08-23T00:00:00Z";
  const researchPack = buildJustSendResearchPack(records, [], { topic: options.topic ?? "웹 파싱", generatedAt });
  return buildEvidencePack(records, { ...options, researchPack });
}

function webParsingVisualSpec(pack, covers = ["S02", "S03"]) {
  const decision = pack.evidence.find(item => item.type === "decision");
  const implementation = pack.evidence.find(item => item.type === "fact");
  return {
    diagram_id: "D001",
    covers_section_ids: covers,
    purpose: "서버 파싱에서 iOS WebKit 온디바이스 처리로 바뀐 데이터 흐름을 비교한다.",
    semantic_pattern: "unstructured-to-structured",
    evidence_ids: [decision.id, implementation.id],
    nodes: [
      { id: "web-document-before", label: "Web document · before", role: "source", evidence_ids: [decision.id] },
      { id: "server-parser", label: "Server parser", role: "transform", evidence_ids: [decision.id] },
      { id: "web-document-after", label: "Web document · after", role: "source", evidence_ids: [implementation.id] },
      { id: "webkit", label: "WebKit", role: "transform", evidence_ids: [decision.id, implementation.id] },
      { id: "ios-app", label: "iOS App", role: "sink", evidence_ids: [decision.id, implementation.id] },
    ],
    edges: [
      { from: "web-document-before", to: "server-parser", label: "before: parsing", kind: "flow", evidence_ids: [decision.id] },
      { from: "web-document-after", to: "webkit", label: "reads document", kind: "flow", evidence_ids: [implementation.id] },
      { from: "webkit", to: "ios-app", label: "local normalization", kind: "flow", evidence_ids: [implementation.id] },
    ],
    excluded: ["Evidence에 없는 서버 컴포넌트"],
    formats: ["html", "svg", "png"],
  };
}

test("capability discovery maps read descriptions and rejects write tool", () => {
  const result = discoverCapabilities(fixture.tools);
  assert.deepEqual(Object.keys(result.capabilities).sort(), ["get_attachments", "get_record", "get_related_records", "list_records_by_range", "search_records"]);
  assert.ok(!Object.values(result.capabilities).some(item => item.tool === "memo_mutation_v3"));
});

test("Evidence schema validation accepts normalized pack", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00.000Z", dateFrom: "2026-07-01", dateTo: "2026-07-31", queryTerms: ["WebKit"] });
  assert.deepEqual(validateEvidencePack(pack), { valid: true, errors: [] });
  assert.equal(pack.evidence[0].confidence, "direct");
});

test("research pack requires selected excerpts and claim mapping", () => {
  const records = fixture.records.slice(0, 2).map(record => ({ ...record }));
  let research = buildJustSendResearchPack(records, [], { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  research = enrichResearchPack(research, [
    { kind: "repository-source", provider: "repository", source_id: "reader.swift", locator: "Sources/Reader.swift:10-80", title: "Reader source", artifact_kind: "code", excerpt: "WebKit 문서를 읽고 로컬에서 정규화하는 실제 구현 source입니다.", claim_keys: ["implementation"], reason: "실제 구현 근거를 확인하기 위해 선택했다." },
  ], { retrievedAt: "2026-08-23T00:00:00Z" });
  assert.deepEqual(validateResearchPack(research), { valid: true, errors: [] });
  assert.equal(researchCoverage(research).repository_sources, 1);
  const invalid = structuredClone(research);
  invalid.sources.at(-1).excerpt = null;
  assert.ok(validateResearchPack(invalid).errors.some(error => error.includes("excerpt")));
});

test("research reason and claim keys are redacted before artifact creation", () => {
  const records = fixture.records.slice(0, 1).map(record => ({ ...record }));
  let research = buildJustSendResearchPack(records, [], { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  research = enrichResearchPack(research, [
    { kind: "repository-source", provider: "repository", source_id: "reader.swift", locator: "Sources/Reader.swift:10-80", title: "Reader source", artifact_kind: "code", excerpt: "WebKit 문서를 읽고 로컬에서 정규화하는 실제 구현 source입니다.", claim_keys: ["api_key=sk_live_SUPERSECRET", "owner:dev.private@example.com"], reason: "담당자 dev.private@example.com의 비밀 sk_live_SUPERSECRET를 확인했다." },
  ], { retrievedAt: "2026-08-23T00:00:00Z" });
  const serialized = JSON.stringify(research);
  assert.doesNotMatch(serialized, /sk_live_SUPERSECRET|dev\.private@example\.com/);
  assert.equal(research.sources.at(-1).sensitivity, "redacted");
  assert.match(serialized, /REDACTED/);
});

test("corroborated Evidence requires two independent research sources", () => {
  const records = fixture.records.slice(0, 1).map(record => ({ ...record, confidence: "corroborated" }));
  let research = buildJustSendResearchPack(records, [], { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  records[0].research_source_ids = [research.sources[0].id];
  const oneSource = buildEvidencePack(records, { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z", researchPack: research });
  assert.ok(validateEvidencePack(oneSource).errors.some(error => error.includes("two independent sources")));
  research = enrichResearchPack(research, [
    { kind: "official-doc", provider: "official-docs", source_id: "webkit-doc", locator: "https://developer.apple.com/documentation/webkit", title: "WebKit docs", artifact_kind: "standard", excerpt: "Apple WebKit 공식 문서가 같은 실행 위치 계약을 설명합니다.", claim_keys: ["parsing-location"], reason: "독립된 공식 1차 문서로 같은 계약을 확인했다." },
  ], { retrievedAt: "2026-08-23T00:00:00Z" });
  records[0].research_source_ids = research.sources.map(source => source.id);
  const corroborated = buildEvidencePack(records, { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z", researchPack: research });
  assert.equal(validateEvidencePack(corroborated).valid, true);
});

test("duplicate records are removed by normalized content", () => {
  const result = deduplicateRecords([fixture.records[0], fixture.records[3]]);
  assert.equal(result.unique.length, 1);
  assert.deepEqual(result.duplicates[0], { record_id: "rec-web-004", duplicate_of: "rec-web-001", reason: "normalized-content" });
});

test("direct evidence and inferred items stay separate", () => {
  const records = [fixture.records[0], { id: "rec-inf-1", occurred_at: "2026-07-09", content: "설계 방향과 일치한다.", type: "inference", confidence: "inferred", supported_by: ["JS-E001"] }];
  const pack = packFor(records, { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  assert.equal(pack.evidence.length, 1);
  assert.equal(pack.inferences.length, 1);
  assert.deepEqual(pack.inferences[0].supported_by, ["JS-E001"]);
});

test("secret redaction removes credentials, private endpoint, email, and private IP", () => {
  const input = "api_key=secret123 http://parser.internal/v1 dev@example.com 10.0.0.4";
  const result = redactText(input);
  assert.equal(result.redacted, 4);
  assert.doesNotMatch(result.text, /secret123|parser\.internal|dev@example|10\.0\.0\.4/);
});

test("path traversal and symlink escape are blocked", () => {
  const root = mkdtempSync(join(tmpdir(), "jsb-path-"));
  mkdirSync(join(root, "safe"));
  const outside = mkdtempSync(join(tmpdir(), "jsb-outside-"));
  symlinkSync(outside, join(root, "escape"));
  assert.throws(() => resolveWithin(root, "../outside"), /traversal/);
  assert.throws(() => resolveWithin(root, "escape/file.md"), /escapes workspace/);
  assert.equal(resolveWithin(root, "safe/file.md"), join(realpathSync(root), "safe/file.md"));
});

test("visual node and edge provenance passes only for known Evidence IDs", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const outline = { sections: [
    { section_id: "S02", title: "기존 데이터 흐름", purpose: "서버 파싱 흐름", visual_candidate: true },
    { section_id: "S03", title: "새 데이터 흐름", purpose: "온디바이스 WebKit 흐름", visual_candidate: true },
    { section_id: "S04", title: "권한 요청 sequence", purpose: "시스템 프롬프트 순서", visual_candidate: true },
  ] };
  const plan = buildVisualPlan(pack, outline, { specs: [webParsingVisualSpec(pack)] });
  assert.deepEqual(plan.visuals[0].covers_section_ids, ["S02", "S03"]);
  assert.deepEqual(plan.decisions.map(item => item.section_id), ["S02", "S03", "S04"]);
  assert.deepEqual(plan.decisions.map(item => item.decision), ["render", "render", "omit"]);
  const diagram = plan.visuals[0];
  assert.equal(diagram.type, "data-flow");
  assert.deepEqual(diagram.renderer, rendererForType("data-flow"));
  const report = auditVisual(diagram, pack, renderSvg(diagram), { outline });
  for (const key of ["unsupported_nodes", "unsupported_edges", "incorrect_labels", "missing_provenance", "incorrect_type_selection", "renderer_contract_mismatch", "type_invariant_violations", "edge_node_intersections", "branch_endpoint_violations"]) {
    assert.deepEqual(report[key], [], `${key}: ${JSON.stringify(report[key])}`);
  }
  diagram.nodes[0].evidence_ids = ["JS-E999"];
  diagram.edges[0].evidence_ids = [];
  const failed = auditVisual(diagram, pack, renderSvg(diagram), { outline });
  assert.deepEqual(failed.unsupported_nodes, ["web-document-before"]);
  assert.deepEqual(failed.unsupported_edges, ["web-document-before->server-parser"]);
});

test("diagram type router selects the primary semantic axis and allows a genuinely repeated optimum", () => {
  const cases = [
    ["권한 상태 전이: notDetermined, granted, blocked 생명주기", "state-machine"],
    ["공증 DMG와 helper ZIP의 배포 위치, runtime과 설치 경로", "deployment"],
    ["API를 유지, 보류, 재확인으로 분류하는 조건 분기와 판정", "flowchart"],
    ["MCP trust boundary와 SSRF 위협 모델의 컴포넌트 연결", "architecture"],
    ["image_path가 staging, attachment, 목록, 상세로 이동하는 데이터 흐름", "data-flow"],
    ["App Store 재제출 감사 절차를 단계별로 수행하는 process", "process"],
    ["Research Pack에서 Evidence로 source expansion과 claim mapping을 수행한다", "data-flow"],
  ];
  for (const [purpose, expected] of cases) assert.equal(selectDiagramType({ purpose }).type, expected, purpose);
  const first = selectDiagramType({ purpose: "입력이 transform과 store를 지나 output으로 이동하는 데이터 흐름" });
  const second = selectDiagramType({ purpose: "source 문서가 정규화되어 sink로 이동하는 data flow" });
  assert.equal(first.type, "data-flow");
  assert.equal(second.type, "data-flow");
});

test("eight production topics build and audit with their meaning-selected diagram type", () => {
  const cases = [
    ["permission", "권한 상태 전이: notDetermined에서 granted 또는 blocked로 이동하고 설정 복구한다.", "state-machine", [
      ["unknown", "notDetermined", "state"], ["granted", "granted", "state"], ["blocked", "blocked", "state"],
    ], [["unknown", "granted", "허용", "transition"], ["unknown", "blocked", "거부", "transition"]], null],
    ["release", "App Store 재제출 감사 절차를 build, metadata, server, gate 단계로 수행한다.", "process", [
      ["build", "Build", "stage"], ["metadata", "Metadata", "stage"], ["server", "Server contract", "stage"], ["gate", "Submit gate", "stage"],
    ], [["build", "metadata", "대조", "next"], ["metadata", "server", "확인", "next"], ["server", "gate", "통과", "next"]], null],
    ["mcp", "MCP anchor의 provisional, live, dead 상태 전이와 lifecycle을 설명한다.", "state-machine", [
      ["provisional", "provisional", "state"], ["live", "live", "state"], ["dead", "dead", "state"],
    ], [["provisional", "live", "materialize", "transition"], ["live", "dead", "delete", "transition"]], null],
    ["mac", "공증 App과 helper ZIP이 release zone에서 runtime으로 배포되는 위치 구조를 보여 준다.", "deployment", [
      ["build-zone", "Build", "zone"], ["user-zone", "User Mac", "zone"], ["dmg", "DMG", "artifact", "build-zone"], ["app", "App runtime", "runtime", "user-zone"],
    ], [["dmg", "app", "deploy", "deploys"]], null],
    ["security", "MCP trust boundary와 SSRF 위협 모델에서 component 연결과 차단 경계를 보여 준다.", "architecture", [
      ["input", "Untrusted input", "component"], ["boundary", "Trust boundary", "boundary"], ["store", "User records", "component"],
    ], [["input", "store", "authorized write", "connects"]], "secure-paved-road"],
    ["hero", "image_path가 staging transform과 attachment store를 지나 목록 sink로 이동하는 데이터 흐름이다.", "data-flow", [
      ["input", "image_path", "source"], ["stage", "Staging", "transform"], ["attachment", "Attachment", "store"], ["list", "List", "sink"],
    ], [["input", "stage", "copy", "flow"], ["stage", "attachment", "import", "flow"], ["attachment", "list", "render", "flow"]], null],
    ["api", "API를 유지, 보류, 재확인 outcome으로 분류하는 조건 분기와 판정이다.", "flowchart", [
      ["routes", "Routes", "source"], ["decision", "Evidence complete?", "decision"], ["keep", "유지", "outcome"], ["hold", "보류", "outcome"], ["recheck", "재확인", "outcome"],
    ], [["routes", "decision", "audit", "next"], ["decision", "keep", "yes", "branch"], ["decision", "hold", "planned", "branch"], ["decision", "recheck", "unknown", "branch"]], null],
    ["research", "Research Pack source가 claim mapping transform을 지나 Evidence sink로 이동하는 data flow다.", "data-flow", [
      ["seed", "JustSend seed", "source"], ["research", "Research Pack", "transform"], ["evidence", "Evidence Pack", "sink"],
    ], [["seed", "research", "expand", "flow"], ["research", "evidence", "map claims", "flow"]], "unstructured-to-structured"],
  ];
  for (const [name, purpose, expected, nodeRows, edgeRows, semanticPattern] of cases) {
    const evidencePack = { evidence: [{ id: "JS-E001", statement: purpose, confidence: "direct", evidence_ids: [] }] };
    const outline = { sections: [{ section_id: "S01", title: purpose, purpose, visual_candidate: true }] };
    const spec = {
      diagram_id: "D001", covers_section_ids: ["S01"], purpose, semantic_pattern: semanticPattern,
      evidence_ids: ["JS-E001"],
      nodes: nodeRows.map(([id, label, role, container_id]) => ({ id, label, role, ...(container_id ? { container_id } : {}), evidence_ids: ["JS-E001"] })),
      edges: edgeRows.map(([from, to, label, kind]) => ({ from, to, label, kind, evidence_ids: ["JS-E001"] })),
      excluded: [], formats: ["html", "svg", "png"],
    };
    const plan = buildVisualPlan(evidencePack, outline, { specs: [spec] });
    assert.equal(plan.visuals[0].type, expected, name);
    const diagram = plan.visuals[0];
    const report = auditVisual(diagram, evidencePack, renderSvg(diagram), { outline });
    for (const key of ["incorrect_type_selection", "renderer_contract_mismatch", "type_invariant_violations", "edge_node_intersections", "branch_endpoint_violations"]) assert.deepEqual(report[key], [], `${name}:${key}:${JSON.stringify(report[key])}`);
  }
});

test("state-machine branch routes use distinct attach points and never cross sibling states", () => {
  const purpose = "권한 notDetermined 상태가 granted 또는 blocked로 분기하고 Settings로 전이한다.";
  const evidencePack = { evidence: [{ id: "JS-E001", statement: purpose, confidence: "direct" }] };
  const outline = { sections: [{ section_id: "S01", title: "권한 상태 전이", purpose, visual_candidate: true }] };
  const spec = {
    diagram_id: "D001", covers_section_ids: ["S01"], purpose, evidence_ids: ["JS-E001"],
    nodes: [
      { id: "unknown", label: "notDetermined", role: "state", evidence_ids: ["JS-E001"] },
      { id: "granted", label: "granted", role: "state", evidence_ids: ["JS-E001"] },
      { id: "blocked", label: "blocked", role: "state", evidence_ids: ["JS-E001"] },
      { id: "settings", label: "Settings", role: "state", evidence_ids: ["JS-E001"] },
    ],
    edges: [
      { from: "unknown", to: "granted", label: "allow", kind: "transition", evidence_ids: ["JS-E001"] },
      { from: "unknown", to: "blocked", label: "deny", kind: "transition", evidence_ids: ["JS-E001"] },
      { from: "blocked", to: "settings", label: "recover", kind: "transition", evidence_ids: ["JS-E001"] },
    ], excluded: [], formats: ["html", "svg", "png"],
  };
  const diagram = buildVisualPlan(evidencePack, outline, { specs: [spec] }).visuals[0];
  const svg = renderSvg(diagram);
  const report = auditVisual(diagram, evidencePack, svg, { outline });
  assert.deepEqual(report.edge_node_intersections, []);
  assert.deepEqual(report.branch_endpoint_violations, []);
  const starts = [...svg.matchAll(/data-from="unknown"[^>]*data-route-points="([^;"]+)/g)].map(match => match[1]);
  assert.equal(starts.length, 2);
  assert.equal(new Set(starts).size, 2);

  const oldGeneric = `<svg data-diagram-type="state-machine" data-primary-axis="states" data-renderer-id="justsend-state-machine-v1" data-renderer-version="1">
    <g data-node-id="unknown" data-node-role="state" data-shape="state" data-evidence-ids="JS-E001" data-bounds="80,244,152,72"><text>notDetermined</text></g>
    <g data-node-id="granted" data-node-role="state" data-shape="state" data-evidence-ids="JS-E001" data-bounds="296,244,152,72"><text>granted</text></g>
    <g data-node-id="blocked" data-node-role="state" data-shape="state" data-evidence-ids="JS-E001" data-bounds="512,244,152,72"><text>blocked</text></g>
    <g data-node-id="settings" data-node-role="state" data-shape="state" data-evidence-ids="JS-E001" data-bounds="728,244,152,72"><text>Settings</text></g>
    <g data-edge-id="E001" data-from="unknown" data-to="granted" data-edge-kind="transition" data-evidence-ids="JS-E001" data-route-points="232,268;296,268"></g>
    <g data-edge-id="E002" data-from="unknown" data-to="blocked" data-edge-kind="transition" data-evidence-ids="JS-E001" data-route-points="232,292;512,292"></g>
    <g data-edge-id="E003" data-from="blocked" data-to="settings" data-edge-kind="transition" data-evidence-ids="JS-E001" data-route-points="664,280;728,280"></g>
  </svg>`;
  const failed = auditVisual(diagram, evidencePack, oldGeneric, { outline });
  assert.ok(failed.edge_node_intersections.some(item => item.includes("E002:unknown->blocked crosses granted")));
});

test("visual audit rejects a generic custom SVG that bypasses the selected renderer contract", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const outline = { sections: [
    { section_id: "S02", title: "기존 데이터 흐름", purpose: "서버 파싱 데이터 흐름", visual_candidate: true },
    { section_id: "S03", title: "새 데이터 흐름", purpose: "온디바이스 WebKit 데이터 흐름", visual_candidate: true },
  ] };
  const diagram = buildVisualPlan(pack, outline, { specs: [webParsingVisualSpec(pack)] }).visuals[0];
  const genericSvg = `<svg>${diagram.nodes.map(node => `<g data-node-id="${node.id}"><text>${node.label}</text></g>`).join("")}${diagram.edges.map(edge => `<g data-from="${edge.from}" data-to="${edge.to}"></g>`).join("")}</svg>`;
  const report = auditVisual(diagram, pack, genericSvg, { outline });
  assert.ok(report.renderer_contract_mismatch.length > 0);
  assert.ok(report.type_invariant_violations.some(item => item.includes("rendered-role")));
});

test("visual audit rejects a declared type that is not optimal for the section meaning", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const sourceOutline = { sections: [
    { section_id: "S02", title: "기존 데이터 흐름", purpose: "서버 파싱 흐름", visual_candidate: true },
  ] };
  const diagram = buildVisualPlan(pack, sourceOutline, { specs: [webParsingVisualSpec(pack, ["S02"])] }).visuals[0];
  diagram.type = "process";
  diagram.selection.primary_axis = "stages";
  diagram.renderer = rendererForType("process");
  const report = auditVisual(diagram, pack, renderSvg(diagram), { outline: { sections: [
    { section_id: "S02", title: "데이터 흐름", purpose: "source가 transform을 지나 sink로 이동한다", visual_candidate: true },
  ] } });
  assert.ok(report.incorrect_type_selection.some(item => item.expected === "data-flow"));
  assert.ok(report.type_invariant_violations.some(item => item.includes("role:stage")));
});

test("humanization preserves protected date, number, URL, product, and Evidence ID", () => {
  const before = "검토를 진행했다. 2026-07-21에 WebKit 3건을 https://example.com 에서 확인했다. <!-- evidence: JS-E001 -->";
  const after = applyDeterministicFallback(before, { route: "standard" });
  assert.match(after, /검토했다/);
  assert.deepEqual(auditProtected(before, after), { meaning_preserved: true, differences: {} });
  assert.deepEqual(deterministicTextAudit(before, after).numbers_changed, []);
  assert.deepEqual(deterministicTextAudit(before, after).dates_changed, []);
  assert.deepEqual(deterministicTextAudit(before, after).urls_changed, []);
  assert.deepEqual(deterministicTextAudit(before, after).evidence_ids_changed, []);
  assert.deepEqual(deterministicTextAudit(before, after).proper_nouns_changed, []);
});

test("im-not-ai change-rate gate enforces 30 and 50 percent thresholds", () => {
  const stable = "검토를 진행했다. ".repeat(30);
  const light = applyDeterministicFallback(stable, { route: "standard" });
  const pass = runImNotAiChangeGate(stable, light);
  assert.ok(pass.change_rate < 0.3);
  assert.equal(pass.verdict, "PASS");
  const fail = runImNotAiChangeGate("가".repeat(200), "나".repeat(200));
  assert.ok(fail.change_rate >= 0.5);
  assert.equal(fail.verdict, "FAIL");
});

test("unsupported factual claim blocks integrated audit", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const text = "서버 처리 성능이 90% 개선됐다.";
  const report = buildAuditReport({ technicalDraft: text, finalMarkdown: text, evidencePack: pack, outline: { sections: [] }, visualPlan: { visuals: [], decisions: [] }, qualityContract: defaultQualityContract({ profile: "fixture-and-test-only" }), humanization: { mode: "deterministic-fallback", route: "standard", change_rate: 0, meaning_preserved: true, verdict: "PASS" } });
  assert.equal(report.result, "FAIL");
  assert.equal(report.text.unsupported_claims.length, 1);
});

test("thin work-card summary fails production depth and coverage gates", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const thin = `# 작업 요약\n\n${[1, 2, 3, 4, 5, 6].map(index => `## 항목 ${index}\n\n서버와 앱의 변경을 짧게 정리했다.\n<!-- evidence: JS-E001 -->`).join("\n\n")}\n\n| 문제 | 결과 |\n|---|---|\n| 서버 | 앱 |`;
  const outline = { sections: [1, 2, 3, 4, 5, 6].map(index => ({ section_id: `S0${index}`, title: `항목 ${index}`, purpose: "짧은 요약", visual_candidate: false })) };
  const contract = defaultQualityContract({ documentType: "engineering-story", corpusMedianCharacters: 8_203 });
  const report = buildQualityAudit({ markdown: thin, evidencePack: pack, outline, visualPlan: { visuals: [], decisions: [] }, contract });
  const codes = new Set(report.blockers.map(item => item.code));
  assert.equal(report.result, "FAIL");
  for (const code of ["content_depth", "subsection_depth", "source_artifacts", "code_or_log_evidence", "direct_evidence_depth", "evidence_coverage", "corpus_depth_ratio", "research_source_depth", "research_source_diversity", "repository_research", "external_primary_research", "runtime_research", "research_claim_coverage"]) assert.ok(codes.has(code), code);
});

test("repeated padding cannot satisfy the depth gate", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const repeated = `${("같은 근거 없는 문단을 길이만 채우려고 반복한다. ".repeat(8) + "\n\n").repeat(12)}<!-- evidence: JS-E001 -->`;
  const contract = defaultQualityContract({ documentType: "engineering-story" });
  Object.assign(contract.thresholds, { min_characters: 0, min_h2_sections: 0, min_h3_sections: 0, min_artifact_blocks: 0, min_code_blocks: 0, min_direct_evidence: 0, min_evidence_coverage: 0 });
  const report = buildQualityAudit({ markdown: repeated, evidencePack: pack, outline: { sections: [] }, visualPlan: { visuals: [], decisions: [] }, contract });
  assert.ok(report.blockers.some(item => item.code === "repetitive_padding"));
});

test("quality exemption requires an explicit user approval", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const contract = defaultQualityContract({ profile: "fixture-and-test-only" });
  Object.assign(contract.thresholds, { min_characters: 5_000, min_h2_sections: 0, min_direct_evidence: 0, min_evidence_coverage: 0 });
  contract.exemptions = [{ code: "content_depth", reason: "API reference 표 자체가 완결된 계약이라 장문 산문이 불필요하다고 사용자가 승인했다.", approved_by: "user" }];
  const report = buildQualityAudit({ markdown: "설명\n<!-- evidence: JS-E001 -->", evidencePack: pack, outline: { sections: [] }, visualPlan: { visuals: [], decisions: [] }, contract });
  assert.equal(report.result, "PASS");
  assert.deepEqual(report.exemptions.map(item => item.code), ["content_depth"]);
  contract.exemptions[0].approved_by = "agent";
  const refused = buildQualityAudit({ markdown: "설명\n<!-- evidence: JS-E001 -->", evidencePack: pack, outline: { sections: [] }, visualPlan: { visuals: [], decisions: [] }, contract });
  assert.ok(refused.blockers.some(item => item.code === "content_depth"));
});

test("SoloMD-style enriched source dossier passes production quality", () => {
  const records = fixture.records.slice(0, 3).map(record => ({ ...record }));
  records[0].claim_keys = ["parsing-location", "privacy-reason"];
  records[1].claim_keys = ["privacy-reason", "server-scope"];
  records[2].claim_keys = ["rollout-date", "implementation", "runtime-result"];
  let researchPack = buildJustSendResearchPack(records, [], { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  researchPack = enrichResearchPack(researchPack, [
    { kind: "repository-source", provider: "repository", source_id: "reader.swift", locator: "Sources/Reader.swift:10-80", title: "Reader implementation", artifact_kind: "code", excerpt: "WebKit 문서를 읽고 로컬에서 정규화하는 구현 source입니다.", claim_keys: ["parsing-location", "rollout-date"], reason: "실제 구현 경로와 호출 관계를 확인하기 위해 선택했다." },
    { kind: "repository-source", provider: "repository", source_id: "reader-tests.swift", locator: "Tests/ReaderTests.swift:20-90", title: "Reader tests", artifact_kind: "test", excerpt: "서버 호출 없이 WebKit 결과가 남는 회귀 테스트 source입니다.", claim_keys: ["rollout-date"], reason: "회귀 테스트의 입력과 관찰 결과를 확인하기 위해 선택했다." },
    { kind: "official-doc", provider: "official-docs", source_id: "webkit-doc", locator: "https://developer.apple.com/documentation/webkit", title: "Apple WebKit documentation", artifact_kind: "standard", excerpt: "Apple의 WebKit 공식 API와 실행 모델을 설명하는 1차 문서입니다.", claim_keys: ["parsing-location"], reason: "외부 플랫폼의 공식 API 계약을 확인하기 위해 선택했다." },
    { kind: "runtime-observation", provider: "runtime", source_id: "offline-smoke", locator: "artifact://offline-smoke", title: "Offline smoke", artifact_kind: "runtime", excerpt: "네트워크를 끈 실행에서 로컬 파싱 결과가 생성된 관측입니다.", claim_keys: ["rollout-date"], reason: "실제 실행 조건과 결과를 확인하기 위해 선택했다." },
  ], { retrievedAt: "2026-08-23T00:00:00Z" });
  const pack = buildEvidencePack(records, { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z", researchPack });
  const ids = pack.evidence.filter(item => item.sensitivity === "public-safe").map(item => item.id);
  const paragraph = index => `섹션 ${index}에서 서버 경로와 온디바이스 경로를 실제 source와 실패 기록으로 대조했고, 변경 조건과 검증 결과를 같은 기준에서 설명한다. `.repeat(12);
  const sections = [1, 2, 3, 4, 5].map(index => `## 상세 ${index}\n\n${paragraph(index)}\n<!-- evidence: ${ids[index % ids.length]} -->`);
  const rich = `# 전체 기술 기록\n\n${sections.join("\n\n")}\n\n### 실패한 접근\n\n${paragraph(6)}\n<!-- evidence: ${ids[0]} -->\n\n### 남은 제약\n\n${paragraph(7)}\n<!-- evidence: ${ids[1]} -->\n\n| 전 | 후 |\n|---|---|\n| 서버 | WebKit |\n\n> 실제 실패 로그를 기준으로 결정했다.\n\n\`\`\`swift\nlet parser = WebKitParser()\n\`\`\``;
  const outline = { sections: [
    { section_id: "S02", title: "기존 데이터 흐름", purpose: "서버 파싱 architecture", visual_candidate: true },
    { section_id: "S03", title: "새 데이터 흐름", purpose: "온디바이스 WebKit architecture", visual_candidate: true },
  ] };
  const plan = buildVisualPlan(pack, outline, { specs: [webParsingVisualSpec(pack)] });
  const contract = defaultQualityContract({ documentType: "engineering-story", corpusMedianCharacters: 6_000 });
  const report = buildQualityAudit({ markdown: rich, evidencePack: pack, researchPack, outline, visualPlan: plan, contract });
  assert.equal(report.result, "PASS", JSON.stringify(report.blockers));
});

test("empty visual plan passes only when outline has no visual candidate", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const contract = defaultQualityContract({ profile: "fixture-and-test-only" });
  Object.assign(contract.thresholds, { min_characters: 0, min_h2_sections: 0, min_direct_evidence: 0, min_evidence_coverage: 0 });
  const outline = { sections: [{ section_id: "S01", title: "남은 질문", purpose: "확인하지 못한 항목 목록", visual_candidate: false }] };
  const report = buildQualityAudit({ markdown: "설명\n<!-- evidence: JS-E001 -->", evidencePack: pack, outline, visualPlan: { visuals: [], decisions: [] }, contract });
  assert.deepEqual(report.visual, { misclassified_visual_candidates: [], missing_required_visuals: [], unjustified_omissions: [] });
  assert.equal(report.result, "PASS");
});

test("semantic visual signal cannot be downgraded to false", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const contract = defaultQualityContract({ profile: "fixture-and-test-only" });
  Object.assign(contract.thresholds, { min_characters: 0, min_h2_sections: 0, min_direct_evidence: 0, min_evidence_coverage: 0 });
  const outline = { sections: [{ section_id: "S01", title: "MCP 아키텍처와 상태 전이", purpose: "도구 호출 흐름", visual_candidate: false }] };
  const report = buildQualityAudit({ markdown: "설명", evidencePack: pack, outline, visualPlan: { visuals: [], decisions: [] }, contract });
  assert.deepEqual(report.visual.misclassified_visual_candidates, ["S01"]);
  assert.ok(report.blockers.some(item => item.code === "misclassified_visual_candidates"));
});

test("visual candidate omission blocks publication", () => {
  const pack = packFor(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const contract = defaultQualityContract({ profile: "fixture-and-test-only" });
  Object.assign(contract.thresholds, { min_characters: 0, min_h2_sections: 0, min_direct_evidence: 0, min_evidence_coverage: 0 });
  const outline = { sections: [{ section_id: "S01", title: "데이터 흐름", purpose: "서버에서 앱으로 이동", visual_candidate: true }] };
  const plan = { visuals: [], decisions: [{ section_id: "S01", decision: "omit", diagram_id: null, reason: "근거를 찾지 못해 그림을 생략했지만 publish 전에는 보강해야 한다." }] };
  const report = buildQualityAudit({ markdown: "설명", evidencePack: pack, outline, visualPlan: plan, contract });
  assert.deepEqual(report.visual.missing_required_visuals, ["S01"]);
  assert.deepEqual(report.visual.unjustified_omissions, ["S01"]);
  assert.equal(report.result, "FAIL");
});
