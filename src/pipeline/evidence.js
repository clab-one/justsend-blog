import { createHash } from "node:crypto";
import { redactText } from "../mcp/redaction.js";

export const EVIDENCE_TYPES = new Set([
  "fact", "decision", "reason", "result", "failure", "tradeoff",
  "measurement", "timeline-event", "quote", "open-question",
]);
export const CONFIDENCE = new Set(["direct", "corroborated", "inferred", "uncertain"]);

function normalizeText(value) {
  return String(value ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
}

function contentKey(record) {
  return createHash("sha256").update(normalizeText(record.content).toLocaleLowerCase("ko-KR")).digest("hex");
}

export function selectRelevantRecords(records, { queryTerms = [], dateFrom, dateTo } = {}) {
  const terms = queryTerms.map(term => normalizeText(term).toLocaleLowerCase("ko-KR")).filter(Boolean);
  return records.filter(record => {
    const date = String(record.occurred_at ?? "");
    if (dateFrom && date < dateFrom) return false;
    if (dateTo && date > dateTo) return false;
    if (terms.length === 0) return true;
    const haystack = normalizeText([record.title, record.content, ...(record.tags ?? [])].join(" ")).toLocaleLowerCase("ko-KR");
    return terms.some(term => haystack.includes(term));
  });
}

export function deduplicateRecords(records) {
  const seenIds = new Set();
  const seenContent = new Map();
  const unique = [];
  const duplicates = [];
  for (const record of records) {
    if (!record?.id || seenIds.has(record.id)) {
      duplicates.push({ record_id: record?.id ?? null, duplicate_of: record?.id ?? null, reason: "source-id" });
      continue;
    }
    seenIds.add(record.id);
    const hash = contentKey(record);
    const prior = seenContent.get(hash);
    if (prior) {
      duplicates.push({ record_id: record.id, duplicate_of: prior.id, reason: "normalized-content" });
      continue;
    }
    seenContent.set(hash, record);
    unique.push(record);
  }
  return { unique, duplicates };
}

export function detectConflicts(records) {
  const groups = new Map();
  for (const record of records) {
    if (!record.claim_key || record.claim_value == null) continue;
    const list = groups.get(record.claim_key) ?? [];
    list.push(record);
    groups.set(record.claim_key, list);
  }
  const conflicts = [];
  for (const [claim, candidates] of groups) {
    const values = new Map();
    for (const record of candidates) {
      const key = normalizeText(record.claim_value);
      const list = values.get(key) ?? [];
      list.push(record.id);
      values.set(key, list);
    }
    if (values.size > 1) {
      conflicts.push({
        claim,
        variants: [...values.entries()].map(([value, record_ids]) => ({ value, record_ids })),
        resolution: "unresolved",
      });
    }
  }
  return conflicts;
}

function evidenceId(index) {
  return `JS-E${String(index + 1).padStart(3, "0")}`;
}

export function buildEvidencePack(records, { topic, generatedAt, dateFrom, dateTo, queryTerms = [] } = {}) {
  const { unique, duplicates } = deduplicateRecords(records);
  const conflicts = detectConflicts(unique);
  const evidence = [];
  const inferences = [];
  const unknowns = [];

  for (const record of unique) {
    const type = EVIDENCE_TYPES.has(record.type) ? record.type : "fact";
    const redacted = redactText(normalizeText(record.content));
    const item = {
      id: evidenceId(evidence.length),
      type,
      statement: redacted.text,
      occurred_at: String(record.occurred_at ?? ""),
      source: {
        provider: "justsend",
        record_id: String(record.id),
        attachment_ids: Array.isArray(record.attachments) ? record.attachments.map(String) : [],
      },
      confidence: record.confidence && CONFIDENCE.has(record.confidence) ? record.confidence : "direct",
      sensitivity: redacted.redacted > 0 || /\[REDACTED:[a-z-]+\]/i.test(redacted.text) ? "redacted" : "public-safe",
    };
    if (record.type === "inference") {
      inferences.push({
        id: `JS-I${String(inferences.length + 1).padStart(3, "0")}`,
        statement: item.statement,
        supported_by: Array.isArray(record.supported_by) ? record.supported_by : [],
        confidence: record.confidence === "uncertain" ? "uncertain" : "inferred",
      });
    } else {
      evidence.push(item);
    }
  }

  return {
    topic: normalizeText(topic),
    generated_at: generatedAt ?? new Date().toISOString(),
    scope: { date_from: dateFrom ?? "", date_to: dateTo ?? "", query_terms: queryTerms.map(String) },
    evidence,
    inferences,
    conflicts,
    unknowns,
    duplicates,
  };
}

export function validateEvidencePack(pack) {
  const errors = [];
  if (!pack || typeof pack !== "object") return { valid: false, errors: ["pack must be an object"] };
  if (!normalizeText(pack.topic)) errors.push("topic is required");
  if (!Number.isFinite(Date.parse(pack.generated_at))) errors.push("generated_at must be ISO-8601");
  if (!pack.scope || typeof pack.scope !== "object") errors.push("scope is required");
  for (const key of ["evidence", "inferences", "conflicts", "unknowns"]) {
    if (!Array.isArray(pack[key])) errors.push(`${key} must be an array`);
  }
  const ids = new Set();
  for (const [index, item] of (pack.evidence ?? []).entries()) {
    const prefix = `evidence[${index}]`;
    if (!/^JS-E\d{3,}$/.test(item.id ?? "")) errors.push(`${prefix}.id is invalid`);
    if (ids.has(item.id)) errors.push(`${prefix}.id is duplicated`);
    ids.add(item.id);
    if (!EVIDENCE_TYPES.has(item.type)) errors.push(`${prefix}.type is invalid`);
    if (!normalizeText(item.statement)) errors.push(`${prefix}.statement is required`);
    if (!/^\d{4}-\d{2}-\d{2}/.test(item.occurred_at ?? "")) errors.push(`${prefix}.occurred_at is invalid`);
    if (!CONFIDENCE.has(item.confidence)) errors.push(`${prefix}.confidence is invalid`);
    if (!item.source || item.source.provider !== "justsend" || !item.source.record_id) errors.push(`${prefix}.source is invalid`);
    if (!Array.isArray(item.source?.attachment_ids)) errors.push(`${prefix}.source.attachment_ids must be an array`);
    if (!["public-safe", "redacted", "internal-review"].includes(item.sensitivity)) errors.push(`${prefix}.sensitivity is invalid`);
  }
  for (const [index, item] of (pack.inferences ?? []).entries()) {
    if (!/^JS-I\d{3,}$/.test(item.id ?? "")) errors.push(`inferences[${index}].id is invalid`);
    if (!Array.isArray(item.supported_by) || item.supported_by.length === 0) errors.push(`inferences[${index}].supported_by is required`);
    if (!["inferred", "uncertain"].includes(item.confidence)) errors.push(`inferences[${index}].confidence is invalid`);
  }
  return { valid: errors.length === 0, errors };
}

export function serializeEvidenceYaml(pack) {
  return `${JSON.stringify(pack, null, 2)}\n`;
}
