const WRITE_LANGUAGE = /\b(create|write|update|edit|delete|remove|append|publish|share|complete|cancel)\b/i;

const CAPABILITY_RULES = Object.freeze({
  search_records: {
    signals: [/\b(search|query|find)\b/i, /\b(record|note|item|memo|work)\b/i],
    schema: [/query|search|text|term/i],
  },
  get_record: {
    signals: [/\b(get|read|fetch|retrieve|open)\b/i, /\b(record|note|item|memo)\b/i, /\b(id|identifier)\b/i],
    schema: [/record.*id|item.*id|note.*id|\bid\b/i],
  },
  list_records_by_range: {
    signals: [/\b(list|browse|enumerate)\b/i, /\b(record|note|item|memo|work)\b/i, /\b(date|range|from|to|since|until|period)\b/i],
    schema: [/date|from|to|since|until|start|end/i],
  },
  get_related_records: {
    signals: [/\b(related|linked|relation|backlink|neighbor|associated)\b/i, /\b(record|note|item|memo)\b/i],
    schema: [/record.*id|item.*id|note.*id|\bid\b/i],
  },
  get_attachments: {
    signals: [/\b(attachments?|media|assets?|files?|documents?)\b/i, /\b(get|read|fetch|list|retrieve)\b/i],
    schema: [/attachment|record.*id|item.*id|note.*id|\bid\b/i],
  },
});

function schemaText(schema) {
  if (!schema) return "";
  try {
    return JSON.stringify(schema);
  } catch {
    return "";
  }
}

function isReadOnlyTool(tool) {
  if (tool?.annotations?.readOnlyHint === false) return false;
  if (tool?.annotations?.destructiveHint === true) return false;
  return !WRITE_LANGUAGE.test(tool?.description ?? "");
}

function scoreTool(tool, rule) {
  if (!tool || typeof tool.name !== "string" || !isReadOnlyTool(tool)) return -Infinity;
  const prose = `${tool.description ?? ""} ${tool.title ?? ""}`;
  const schema = schemaText(tool.inputSchema);
  const signalHits = rule.signals.reduce((score, pattern) => score + (pattern.test(prose) ? 3 : 0), 0);
  const schemaHits = rule.schema.reduce((score, pattern) => score + (pattern.test(schema) ? 2 : 0), 0);
  return signalHits + schemaHits;
}

export function discoverCapabilities(tools, { minimumScore = 6 } = {}) {
  if (!Array.isArray(tools)) throw new TypeError("tools must be an array");
  const capabilities = {};
  const missing = [];
  const ambiguous = [];

  for (const [logical, rule] of Object.entries(CAPABILITY_RULES)) {
    const ranked = tools
      .map(tool => ({ tool, score: scoreTool(tool, rule) }))
      .filter(candidate => Number.isFinite(candidate.score) && candidate.score >= minimumScore)
      .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));

    if (ranked.length === 0) {
      missing.push(logical);
      continue;
    }
    if (ranked.length > 1 && ranked[0].score === ranked[1].score) {
      ambiguous.push({ logical, candidates: ranked.filter(item => item.score === ranked[0].score).map(item => item.tool.name) });
      continue;
    }
    capabilities[logical] = {
      tool: ranked[0].tool.name,
      server: ranked[0].tool.server ?? null,
      score: ranked[0].score,
      read_only: true,
    };
  }

  return { capabilities, missing, ambiguous, read_only: true };
}

export function requireCapabilities(discovery, required) {
  const unavailable = required.filter(name => !discovery?.capabilities?.[name]);
  if (unavailable.length > 0) {
    throw new Error(`Missing unambiguous read capabilities: ${unavailable.join(", ")}`);
  }
  return discovery.capabilities;
}

export const logicalCapabilities = Object.freeze(Object.keys(CAPABILITY_RULES));
