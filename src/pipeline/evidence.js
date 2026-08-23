import { createHash } from "node:crypto";
import { redactText } from "../mcp/redaction.js";

export const EVIDENCE_TYPES = new Set([
  "fact", "decision", "reason", "result", "failure", "tradeoff",
  "measurement", "timeline-event", "quote", "open-question",
]);
export const CONFIDENCE = new Set(["direct", "corroborated", "inferred", "uncertain"]);
export const SOURCE_PROVIDERS = new Set(["justsend", "repository", "official-docs", "web", "runtime", "corpus", "user"]);

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

export function buildEvidencePack(records, { topic, generatedAt, dateFrom, dateTo, queryTerms = [], researchPack } = {}) {
  if (!researchPack?.sources?.length) throw new TypeError("researchPack with selected sources is required");
  const researchById = new Map(researchPack.sources.filter(source => source.selected === true).map(source => [source.id, source]));
  const justsendSourceByRecord = new Map(
    researchPack.sources
      .filter(source => source.selected === true && source.provider === "justsend")
      .map(source => [source.source_id, source]),
  );
  const { unique, duplicates } = deduplicateRecords(records);
  const conflicts = detectConflicts(unique);
  const evidence = [];
  const inferences = [];
  const unknowns = [];

  for (const record of unique) {
    const type = EVIDENCE_TYPES.has(record.type) ? record.type : "fact";
    const redacted = redactText(normalizeText(record.content));
    const claimKeys = Array.isArray(record.claim_keys)
      ? record.claim_keys.map(String)
      : [String(record.claim_key ?? `record:${record.id}`)];
    const item = {
      id: evidenceId(evidence.length),
      type,
      statement: redacted.text,
      occurred_at: String(record.occurred_at ?? ""),
      claim_keys: claimKeys,
      sources: (() => {
        const requested = Array.isArray(record.research_source_ids)
          ? record.research_source_ids.map(id => researchById.get(String(id))).filter(Boolean)
          : [
              justsendSourceByRecord.get(String(record.id)),
              ...researchPack.sources.filter(source =>
                source.selected === true
                && source.provider !== "justsend"
                && (source.claim_keys ?? []).some(key => claimKeys.includes(String(key)))),
            ].filter(Boolean);
        if (requested.length === 0) throw new TypeError(`record ${record.id} has no selected research source`);
        return requested.map(source => ({
          research_source_id: source.id,
          provider: source.provider,
          source_id: source.source_id,
          locator: source.locator,
          attachment_ids: source.provider === "justsend" && Array.isArray(record.attachments)
            ? record.attachments.map(String)
            : [],
        }));
      })(),
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
    if (!Array.isArray(item.claim_keys) || item.claim_keys.length === 0 || item.claim_keys.some(key => !normalizeText(key))) errors.push(`${prefix}.claim_keys is invalid`);
    if (!CONFIDENCE.has(item.confidence)) errors.push(`${prefix}.confidence is invalid`);
    if (!Array.isArray(item.sources) || item.sources.length === 0) errors.push(`${prefix}.sources is required`);
    for (const [sourceIndex, source] of (item.sources ?? []).entries()) {
      const sourcePrefix = `${prefix}.sources[${sourceIndex}]`;
      if (!/^RS-\d{3,}$/.test(source.research_source_id ?? "")) errors.push(`${sourcePrefix}.research_source_id is invalid`);
      if (!SOURCE_PROVIDERS.has(source.provider)) errors.push(`${sourcePrefix}.provider is invalid`);
      if (!normalizeText(source.source_id)) errors.push(`${sourcePrefix}.source_id is required`);
      if (!normalizeText(source.locator)) errors.push(`${sourcePrefix}.locator is required`);
      if (!Array.isArray(source.attachment_ids)) errors.push(`${sourcePrefix}.attachment_ids must be an array`);
    }
    if (item.confidence === "corroborated" && new Set((item.sources ?? []).map(source => `${source.provider}:${source.source_id}`)).size < 2) errors.push(`${prefix}.corroborated requires two independent sources`);
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
