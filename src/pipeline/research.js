import { createHash } from "node:crypto";
import { redactText } from "../mcp/redaction.js";

export const RESEARCH_KINDS = new Set([
  "work-record", "repository-source", "official-doc", "web-source",
  "runtime-observation", "existing-corpus", "user-provided",
]);
export const RESEARCH_PROVIDERS = new Set([
  "justsend", "repository", "official-docs", "web", "runtime", "corpus", "user",
]);
const KIND_PROVIDER = new Map([
  ["work-record", "justsend"],
  ["repository-source", "repository"],
  ["official-doc", "official-docs"],
  ["web-source", "web"],
  ["runtime-observation", "runtime"],
  ["existing-corpus", "corpus"],
  ["user-provided", "user"],
]);

function hash(value) {
  return createHash("sha256").update(String(value ?? "").normalize("NFC")).digest("hex");
}

export function buildJustSendResearchPack(selected, rejected = [], { topic, generatedAt } = {}) {
  const rows = [
    ...selected.map(record => ({ record, selected: true, reason: "topic-and-date-match" })),
    ...rejected.map(record => ({ record, selected: false, reason: "outside-topic-or-date-scope" })),
  ];
  return {
    topic: String(topic ?? "").trim(),
    generated_at: generatedAt ?? new Date().toISOString(),
    sources: rows.map(({ record, selected: isSelected, reason }, index) => {
      const title = redactText(String(record.title ?? record.id));
      const excerpt = redactText(String(record.content ?? "").trim());
      const redacted = title.redacted + excerpt.redacted;
      return {
        id: `RS-${String(index + 1).padStart(3, "0")}`,
        kind: "work-record",
        provider: "justsend",
        source_id: String(record.id),
        locator: `justsend:${String(record.id)}`,
        title: title.text,
        retrieved_at: generatedAt ?? new Date().toISOString(),
        selected: isSelected,
        reason,
        artifact_kind: "record",
        excerpt: excerpt.text || null,
        claim_keys: isSelected
          ? (Array.isArray(record.claim_keys) ? record.claim_keys.map(String) : [String(record.claim_key ?? `record:${record.id}`)])
          : [],
        content_hash: hash(record.content),
        sensitivity: redacted > 0 || /\[REDACTED:[a-z-]+\]/i.test(`${title.text} ${excerpt.text}`) ? "redacted" : "public-safe",
      };
    }),
  };
}

export function enrichResearchPack(pack, sources = [], { retrievedAt } = {}) {
  const start = pack.sources.length;
  const additions = sources.map((source, index) => {
    const sourceID = redactText(String(source.source_id));
    const locator = redactText(String(source.locator));
    const title = redactText(String(source.title));
    const excerpt = source.excerpt == null ? { text: "", redacted: 0 } : redactText(String(source.excerpt));
    const redacted = sourceID.redacted + locator.redacted + title.redacted + excerpt.redacted;
    return {
      id: source.id ?? `RS-${String(start + index + 1).padStart(3, "0")}`,
      kind: source.kind,
      provider: source.provider,
      source_id: sourceID.text,
      locator: locator.text,
      title: title.text,
      retrieved_at: source.retrieved_at ?? retrievedAt ?? new Date().toISOString(),
      selected: source.selected !== false,
      reason: String(source.reason ?? "selected for source expansion"),
      artifact_kind: source.artifact_kind,
      excerpt: excerpt.text || null,
      claim_keys: Array.isArray(source.claim_keys) ? source.claim_keys.map(String) : [],
      content_hash: source.content_hash ?? (source.excerpt == null ? null : hash(source.excerpt)),
      sensitivity: redacted > 0 || /\[REDACTED:[a-z-]+\]/i.test(`${sourceID.text} ${locator.text} ${title.text} ${excerpt.text}`)
        ? "redacted"
        : (source.sensitivity ?? "public-safe"),
    };
  });
  return { ...pack, sources: [...pack.sources, ...additions] };
}

export function researchCoverage(pack) {
  const selected = selectedResearchSources(pack);
  const count = provider => new Set(selected.filter(source => source.provider === provider).map(source => source.source_id)).size;
  return {
    total_sources: selected.length,
    justsend_sources: count("justsend"),
    repository_sources: count("repository"),
    official_sources: count("official-docs"),
    web_sources: count("web"),
    runtime_sources: count("runtime"),
    corpus_sources: count("corpus"),
    source_kinds: [...new Set(selected.map(source => source.kind))],
    claim_keys: [...new Set(selected.flatMap(source => source.claim_keys ?? []))],
  };
}

export function validateResearchPack(pack) {
  const errors = [];
  if (!pack || typeof pack !== "object") return { valid: false, errors: ["research pack must be an object"] };
  if (!String(pack.topic ?? "").trim()) errors.push("topic is required");
  if (!Number.isFinite(Date.parse(pack.generated_at))) errors.push("generated_at must be ISO-8601");
  if (!Array.isArray(pack.sources) || pack.sources.length === 0) errors.push("sources must be a non-empty array");
  const ids = new Set();
  for (const [index, source] of (pack.sources ?? []).entries()) {
    const prefix = `sources[${index}]`;
    if (!/^RS-\d{3,}$/.test(source.id ?? "")) errors.push(`${prefix}.id is invalid`);
    if (ids.has(source.id)) errors.push(`${prefix}.id is duplicated`);
    ids.add(source.id);
    if (!RESEARCH_KINDS.has(source.kind)) errors.push(`${prefix}.kind is invalid`);
    if (!RESEARCH_PROVIDERS.has(source.provider)) errors.push(`${prefix}.provider is invalid`);
    if (KIND_PROVIDER.get(source.kind) !== source.provider) errors.push(`${prefix}.kind/provider mismatch`);
    for (const key of ["source_id", "locator", "title"]) if (!String(source[key] ?? "").trim()) errors.push(`${prefix}.${key} is required`);
    if (String(source.reason ?? "").trim().length < 10) errors.push(`${prefix}.reason must be at least 10 characters`);
    if (!Number.isFinite(Date.parse(source.retrieved_at))) errors.push(`${prefix}.retrieved_at is invalid`);
    if (typeof source.selected !== "boolean") errors.push(`${prefix}.selected must be boolean`);
    if (!["record", "code", "config", "log", "test", "document", "api-contract", "standard", "runtime", "corpus"].includes(source.artifact_kind)) errors.push(`${prefix}.artifact_kind is invalid`);
    if (source.selected === true && String(source.excerpt ?? "").trim().length < 20) errors.push(`${prefix}.selected source excerpt must be at least 20 characters`);
    if (!Array.isArray(source.claim_keys) || (source.selected === true && source.claim_keys.length === 0)) errors.push(`${prefix}.selected source claim_keys are required`);
    if (source.content_hash != null && !/^[a-f0-9]{64}$/.test(source.content_hash)) errors.push(`${prefix}.content_hash is invalid`);
    if (!["public-safe", "redacted", "internal-review"].includes(source.sensitivity)) errors.push(`${prefix}.sensitivity is invalid`);
  }
  return { valid: errors.length === 0, errors };
}

export function selectedResearchSources(pack) {
  return (pack?.sources ?? []).filter(source => source.selected === true);
}
