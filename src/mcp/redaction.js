const PATTERNS = [
  ["authorization", /\b(?:authorization\s*[:=]\s*|bearer\s+)[A-Za-z0-9._~+/=-]+/gi],
  ["jwt", /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g],
  ["credential", /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|password|passwd|secret|cookie|private[_-]?key)\s*[:=]\s*["']?[^\s,"'};]+/gi],
  ["aws-key", /\bAKIA[0-9A-Z]{16}\b/g],
  ["email", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
  ["phone", /(?<!\d)(?:\+?82[- .]?)?0?1[016789][- .]?\d{3,4}[- .]?\d{4}(?!\d)/g],
  ["private-ip", /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|127(?:\.\d{1,3}){3})\b/g],
  ["credential-url", /https?:\/\/[^\s/@:]+:[^\s/@]+@[^\s/]+/gi],
  ["private-endpoint", /https?:\/\/(?:localhost|[^\s/:]+\.(?:internal|local))(?:[:/]\S*)?/gi],
];

export function redactText(input) {
  let text = String(input ?? "");
  const counts = {};
  for (const [kind, pattern] of PATTERNS) {
    text = text.replace(pattern, () => {
      counts[kind] = (counts[kind] ?? 0) + 1;
      return `[REDACTED:${kind}]`;
    });
  }
  return { text, counts, redacted: Object.values(counts).reduce((sum, value) => sum + value, 0) };
}

export function redactValue(value) {
  const counts = {};
  function visit(current) {
    if (typeof current === "string") {
      const result = redactText(current);
      for (const [kind, count] of Object.entries(result.counts)) counts[kind] = (counts[kind] ?? 0) + count;
      return result.text;
    }
    if (Array.isArray(current)) return current.map(visit);
    if (current && typeof current === "object") {
      return Object.fromEntries(Object.entries(current).map(([key, item]) => [key, visit(item)]));
    }
    return current;
  }
  const valueRedacted = visit(value);
  return { value: valueRedacted, counts, redacted: Object.values(counts).reduce((sum, count) => sum + count, 0) };
}

export function redactionTrace(counts) {
  return { redacted: Object.values(counts).reduce((sum, count) => sum + count, 0), categories: { ...counts } };
}
