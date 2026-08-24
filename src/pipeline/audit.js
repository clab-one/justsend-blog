import { extractProtected } from "./humanize.js";
import { auditVisual } from "./visual.js";
import { buildQualityAudit } from "./quality.js";

function difference(before = [], after = []) {
  const counts = new Map();
  for (const value of after) counts.set(value, (counts.get(value) ?? 0) + 1);
  const missing = [];
  for (const value of before) {
    const count = counts.get(value) ?? 0;
    if (count > 0) counts.set(value, count - 1);
    else missing.push(value);
  }
  const added = [];
  for (const [value, count] of counts) for (let index = 0; index < count; index++) added.push(value);
  return { missing, added };
}

function comments(markdown) {
  return [...String(markdown).matchAll(/<!--\s*evidence:\s*([^>]+?)\s*-->/gi)]
    .flatMap(match => match[1].split(/[\s,]+/).filter(Boolean));
}

function factualLine(line) {
  const value = line.trim();
  if (!value || value.startsWith("#") || value.startsWith("---") || value.startsWith("!") || value.startsWith("<!--") || value.startsWith("- ")) return false;
  if (/확인된 기록만으로|확정 사실로 사용하지 않았다|독자가 .*수 있도록|추가 검증이 필요하다/.test(value)) return false;
  return /(결정했다|이전했다|구현했다|적용했다|실패했다|발생했다|이유였다|결과였다|수행하던|기록했다|완료했다|줄였다|늘렸다|WebKit|서버|온디바이스)/.test(value);
}

function claimAudit(markdown, pack) {
  const evidence = new Map(pack.evidence.map(item => [item.id, item]));
  const lines = String(markdown).split("\n");
  const unsupported = [];
  let inFrontmatter = lines[0]?.trim() === "---";
  for (let index = 0; index < lines.length; index++) {
    if (inFrontmatter) {
      if (index > 0 && lines[index].trim() === "---") inFrontmatter = false;
      continue;
    }
    if (!factualLine(lines[index])) continue;
    let cursor = index + 1;
    while (cursor < lines.length && !lines[cursor].trim()) cursor++;
    const match = lines[cursor]?.match(/<!--\s*evidence:\s*([^>]+?)\s*-->/i);
    const ids = match ? match[1].split(/[\s,]+/).filter(Boolean) : [];
    const supported = ids.some(id => {
      const item = evidence.get(id);
      return item && ["direct", "corroborated"].includes(item.confidence);
    });
    if (!supported) unsupported.push({ line: index + 1, claim: lines[index].trim(), evidence_ids: ids });
  }
  return unsupported;
}

export function deterministicTextAudit(before, after) {
  const left = extractProtected(before);
  const right = extractProtected(after);
  const numberDiff = difference(left.number, right.number);
  const dateDiff = difference(left.date, right.date);
  const urlDiff = difference(left.url, right.url);
  const recordDiff = difference(left.record_id, right.record_id);
  const evidenceDiff = difference(left.evidence_id, right.evidence_id);
  const codeBlockDiff = difference(left.code_block, right.code_block);
  const inlineCodeDiff = difference(left.inline_code, right.inline_code);
  const pathDiff = difference(left.path, right.path);
  const properNounDiff = difference(left.technical_token, right.technical_token);
  const quoteDiff = difference(left.quoted, right.quoted);
  return {
    numbers_changed: [...numberDiff.missing, ...numberDiff.added],
    dates_changed: [...dateDiff.missing, ...dateDiff.added],
    urls_changed: [...urlDiff.missing, ...urlDiff.added],
    record_ids_changed: [...recordDiff.missing, ...recordDiff.added],
    evidence_ids_changed: [...evidenceDiff.missing, ...evidenceDiff.added],
    code_blocks_changed: [...codeBlockDiff.missing, ...codeBlockDiff.added],
    inline_code_changed: [...inlineCodeDiff.missing, ...inlineCodeDiff.added],
    file_paths_changed: [...pathDiff.missing, ...pathDiff.added],
    proper_nouns_changed: [...properNounDiff.missing, ...properNounDiff.added],
    quoted_strings_changed: [...quoteDiff.missing, ...quoteDiff.added],
  };
}

export function buildAuditReport({ technicalDraft, finalMarkdown, evidencePack, researchPack, outline, visualPlan, qualityContract, renderedSvgs = {}, humanization }) {
  const deterministic = deterministicTextAudit(technicalDraft, finalMarkdown);
  const unsupported_claims = claimAudit(finalMarkdown, evidencePack);
  const quality = buildQualityAudit({ markdown: finalMarkdown, evidencePack, researchPack, outline, visualPlan, contract: qualityContract });
  const beforeClaims = new Set(comments(technicalDraft));
  const afterClaims = new Set(comments(finalMarkdown));
  const claims_added = [...afterClaims].filter(id => !beforeClaims.has(id));
  const claims_removed = [...beforeClaims].filter(id => !afterClaims.has(id));
  const visualReports = (visualPlan?.visuals ?? []).map(diagram => auditVisual(diagram, evidencePack, renderedSvgs[diagram.diagram_id] ?? "", { outline }));
  const diagrams = {
    unsupported_nodes: visualReports.flatMap(report => report.unsupported_nodes),
    unsupported_edges: visualReports.flatMap(report => report.unsupported_edges),
    incorrect_labels: visualReports.flatMap(report => report.incorrect_labels),
    missing_provenance: visualReports.flatMap(report => report.missing_provenance),
    incorrect_type_selection: visualReports.flatMap(report => report.incorrect_type_selection),
    renderer_contract_mismatch: visualReports.flatMap(report => report.renderer_contract_mismatch),
    type_invariant_violations: visualReports.flatMap(report => report.type_invariant_violations),
    edge_node_intersections: visualReports.flatMap(report => report.edge_node_intersections),
    branch_endpoint_violations: visualReports.flatMap(report => report.branch_endpoint_violations),
    missing_required_visuals: quality.visual.missing_required_visuals,
    misclassified_visual_candidates: quality.visual.misclassified_visual_candidates,
    unjustified_omissions: quality.visual.unjustified_omissions,
  };
  const text = { unsupported_claims, ...deterministic, claims_added, claims_removed };
  const blockers = [
    text.unsupported_claims,
    text.numbers_changed,
    text.dates_changed,
    text.urls_changed,
    text.record_ids_changed,
    text.evidence_ids_changed,
    text.code_blocks_changed,
    text.inline_code_changed,
    text.file_paths_changed,
    text.proper_nouns_changed,
    text.quoted_strings_changed,
    text.claims_added,
    diagrams.unsupported_nodes,
    diagrams.unsupported_edges,
    diagrams.incorrect_labels,
    diagrams.missing_provenance,
    diagrams.incorrect_type_selection,
    diagrams.renderer_contract_mismatch,
    diagrams.type_invariant_violations,
    diagrams.edge_node_intersections,
    diagrams.branch_endpoint_violations,
    quality.blockers,
  ];
  const failed = blockers.some(items => items.length > 0)
    || humanization.meaning_preserved !== true
    || humanization.change_rate >= 0.5
    || humanization.verdict === "FAIL";
  return { text, diagrams, quality, humanization, result: failed ? "FAIL" : "PASS" };
}
