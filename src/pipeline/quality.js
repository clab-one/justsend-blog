const LONG_FORM_TYPES = new Set([
  "engineering-story",
  "architecture-decision",
  "incident-review",
  "product-narrative",
]);

const HIGH_VALUE_EVIDENCE = new Set(["decision", "failure", "result", "measurement", "tradeoff"]);
const VISUAL_SIGNAL = /아키텍처|architecture|시퀀스|sequence|데이터\s*(이동|흐름)|data\s*flow|상태\s*전이|state\s*(machine|transition)|전후\s*비교|before\s*\/\s*after|배포\s*(경로|위치|구조)|deployment|신뢰\s*경계|trust\s*boundary|컴포넌트|component|의존성|dependency|파이프라인|pipeline|동기화\s*흐름|권한\s*요청\s*흐름|감사\s*(절차|과정)|처분\s*흐름/i;

function body(markdown) {
  const value = String(markdown ?? "");
  if (!value.startsWith("---")) return value;
  const end = value.indexOf("\n---", 3);
  return end >= 0 ? value.slice(end + 4) : value;
}

function evidenceComments(markdown) {
  return new Set(
    [...String(markdown ?? "").matchAll(/<!--\s*evidence:\s*([^>]+?)\s*-->/gi)]
      .flatMap(match => match[1].split(/[\s,]+/).filter(Boolean)),
  );
}

function repeatedParagraphRatio(markdown) {
  const paragraphs = body(markdown).split(/\n\s*\n/)
    .map(value => value.replace(/<!--[^>]+-->/g, "").replace(/\s+/g, " ").trim().toLowerCase())
    .filter(value => value.length >= 40 && !/^(#|\||```|>|!\[|- )/.test(value));
  if (paragraphs.length < 2) return 0;
  return 1 - new Set(paragraphs).size / paragraphs.length;
}

function directPublicEvidence(pack) {
  return (pack?.evidence ?? []).filter(item =>
    item.sensitivity === "public-safe" && ["direct", "corroborated"].includes(item.confidence));
}

export function defaultQualityContract({ documentType = "engineering-story", profile = "production", corpusMedianCharacters = null } = {}) {
  const fixture = profile === "fixture-and-test-only";
  const longForm = LONG_FORM_TYPES.has(documentType);
  return {
    version: 1,
    profile,
    document_type: documentType,
    corpus: corpusMedianCharacters ? { median_characters: corpusMedianCharacters } : null,
    thresholds: fixture
      ? {
          min_characters: 400,
          min_h2_sections: 3,
          min_h3_sections: 0,
          min_artifact_blocks: 0,
          min_code_blocks: 0,
          min_direct_evidence: 1,
          min_evidence_coverage: 0.5,
          min_corpus_depth_ratio: 0,
          max_repeated_paragraph_ratio: 1,
        }
      : {
          min_characters: longForm ? 4_500 : 3_000,
          min_h2_sections: longForm ? 5 : 4,
          min_h3_sections: longForm ? 2 : 0,
          min_artifact_blocks: longForm ? 3 : 2,
          min_code_blocks: longForm ? 1 : 0,
          min_direct_evidence: longForm ? 3 : 2,
          min_evidence_coverage: 0.65,
          min_corpus_depth_ratio: 0.6,
          max_repeated_paragraph_ratio: 0.2,
        },
    exemptions: [],
  };
}

export function contentMetrics(markdown, pack) {
  const value = body(markdown);
  const used = evidenceComments(value);
  const available = directPublicEvidence(pack);
  const availableIds = new Set(available.map(item => item.id));
  const usedDirect = [...used].filter(id => availableIds.has(id));
  const highValue = available.filter(item => HIGH_VALUE_EVIDENCE.has(item.type)).map(item => item.id);
  const fences = (value.match(/^```/gm) ?? []).length;
  const metrics = {
    characters: value.trim().length,
    h2_sections: (value.match(/^##\s+/gm) ?? []).length,
    h3_sections: (value.match(/^###\s+/gm) ?? []).length,
    tables: (value.match(/^\|\s*:?-{3,}/gm) ?? []).length,
    code_blocks: Math.floor(fences / 2),
    blockquotes: (value.match(/^>\s+/gm) ?? []).length,
    images: (value.match(/!\[[^\]]*\]\([^\)]+\)/g) ?? []).length,
    direct_evidence_used: usedDirect.length,
    evidence_coverage: available.length ? usedDirect.length / available.length : 0,
    unused_high_value_evidence: highValue.filter(id => !used.has(id)),
    repeated_paragraph_ratio: repeatedParagraphRatio(value),
  };
  metrics.artifact_blocks = metrics.tables + metrics.code_blocks + metrics.blockquotes + metrics.images;
  return metrics;
}

export function inferVisualNeed(section) {
  return VISUAL_SIGNAL.test(`${section?.title ?? ""} ${section?.purpose ?? ""}`);
}

function visualAudit(outline, visualPlan) {
  const sections = outline?.sections ?? [];
  const diagrams = visualPlan?.visuals ?? [];
  const decisions = visualPlan?.decisions ?? [];
  const candidateIds = new Set(sections.filter(section => section.visual_candidate === true).map(section => section.section_id));
  const inferredIds = new Set(sections.filter(inferVisualNeed).map(section => section.section_id));
  const misclassified_visual_candidates = [...inferredIds].filter(id => !candidateIds.has(id));
  const diagramIds = new Set(diagrams.map(diagram => diagram.diagram_id));
  const covered = new Set();
  for (const diagram of diagrams) {
    for (const id of diagram.covers_section_ids ?? [diagram.section_id]) covered.add(id);
  }
  const unjustified_omissions = [];
  for (const decision of decisions) {
    if (decision.decision === "render" && decision.diagram_id && diagramIds.has(decision.diagram_id)) covered.add(decision.section_id);
    if (decision.decision === "omit" && candidateIds.has(decision.section_id)) unjustified_omissions.push(decision.section_id);
  }
  const missing_required_visuals = [...candidateIds].filter(id => !covered.has(id));
  return { misclassified_visual_candidates, missing_required_visuals, unjustified_omissions };
}

function exemption(contract, code) {
  return (contract?.exemptions ?? []).find(item =>
    item.code === code && item.approved_by === "user" && String(item.reason ?? "").trim().length >= 20);
}

export function buildQualityAudit({ markdown, evidencePack, outline, visualPlan, contract }) {
  const active = contract ?? defaultQualityContract();
  const metrics = contentMetrics(markdown, evidencePack);
  const thresholds = active.thresholds;
  const corpusMedian = active.corpus?.median_characters ?? null;
  metrics.corpus_depth_ratio = corpusMedian ? metrics.characters / corpusMedian : null;
  const visual = visualAudit(outline, visualPlan);
  const candidates = [
    ["content_depth", metrics.characters < thresholds.min_characters, { actual: metrics.characters, minimum: thresholds.min_characters }],
    ["section_depth", metrics.h2_sections < thresholds.min_h2_sections, { actual: metrics.h2_sections, minimum: thresholds.min_h2_sections }],
    ["subsection_depth", metrics.h3_sections < thresholds.min_h3_sections, { actual: metrics.h3_sections, minimum: thresholds.min_h3_sections }],
    ["source_artifacts", metrics.artifact_blocks < thresholds.min_artifact_blocks, { actual: metrics.artifact_blocks, minimum: thresholds.min_artifact_blocks }],
    ["code_or_log_evidence", metrics.code_blocks < thresholds.min_code_blocks, { actual: metrics.code_blocks, minimum: thresholds.min_code_blocks }],
    ["direct_evidence_depth", metrics.direct_evidence_used < thresholds.min_direct_evidence, { actual: metrics.direct_evidence_used, minimum: thresholds.min_direct_evidence }],
    ["evidence_coverage", metrics.evidence_coverage < thresholds.min_evidence_coverage, { actual: metrics.evidence_coverage, minimum: thresholds.min_evidence_coverage }],
    ["corpus_depth_ratio", metrics.corpus_depth_ratio !== null && metrics.corpus_depth_ratio < thresholds.min_corpus_depth_ratio, { actual: metrics.corpus_depth_ratio, minimum: thresholds.min_corpus_depth_ratio }],
    ["repetitive_padding", metrics.repeated_paragraph_ratio > thresholds.max_repeated_paragraph_ratio, { actual: metrics.repeated_paragraph_ratio, maximum: thresholds.max_repeated_paragraph_ratio }],
    ["unused_high_value_evidence", metrics.unused_high_value_evidence.length > 0, { evidence_ids: metrics.unused_high_value_evidence }],
    ["missing_required_visuals", visual.missing_required_visuals.length > 0, { section_ids: visual.missing_required_visuals }],
    ["misclassified_visual_candidates", visual.misclassified_visual_candidates.length > 0, { section_ids: visual.misclassified_visual_candidates }],
    ["unjustified_visual_omissions", visual.unjustified_omissions.length > 0, { section_ids: visual.unjustified_omissions }],
  ];
  const blockers = [];
  const exemptions = [];
  for (const [code, failed, details] of candidates) {
    if (!failed) continue;
    const approved = exemption(active, code);
    if (approved) exemptions.push({ code, reason: approved.reason, approved_by: approved.approved_by, details });
    else blockers.push({ code, ...details });
  }
  return { profile: active.profile, metrics, visual, blockers, exemptions, result: blockers.length ? "FAIL" : "PASS" };
}
