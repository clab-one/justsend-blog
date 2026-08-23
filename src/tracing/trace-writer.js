import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { redactValue } from "../mcp/redaction.js";

export const TRACE_EVENTS = new Set([
  "run_started", "assumption_recorded", "scout_requested", "scout_completed",
  "mcp_discovered", "mcp_call_started", "mcp_call_completed", "record_selected",
  "record_rejected", "evidence_created", "outline_created", "draft_created",
  "visual_planned", "diagram_rendered", "humanize_started", "humanize_completed",
  "audit_started", "audit_failed", "audit_passed", "git_commit", "run_completed",
  "state_transition", "redaction_applied", "run_blocked",
]);

function clip(value, maxChars = 2048) {
  const text = String(value);
  if ([...text].length <= maxChars) return { value: text, truncated: false };
  return { value: `${[...text].slice(0, maxChars).join("")}…(truncated)`, truncated: true };
}

export class TraceWriter {
  constructor({ path, runId, now = () => new Date().toISOString() }) {
    this.path = path;
    this.runId = runId;
    this.now = now;
    this.seq = 0;
    if (existsSync(path)) {
      for (const line of readFileSync(path, "utf8").split("\n")) {
        if (!line.trim()) continue;
        try { this.seq = Math.max(this.seq, Number(JSON.parse(line).seq) || 0); } catch { /* malformed historical lines do not block append */ }
      }
    }
  }

  append(event, details = {}) {
    if (!TRACE_EVENTS.has(event)) throw new Error(`Unknown trace event: ${event}`);
    const safe = redactValue(details);
    const serialized = JSON.stringify(safe.value);
    const clipped = clip(serialized, 8192);
    const row = {
      seq: ++this.seq,
      ts: this.now(),
      run_id: this.runId,
      event,
      details: clipped.truncated ? { summary: clipped.value } : safe.value,
    };
    if (clipped.truncated) row.details_truncated = true;
    if (safe.redacted > 0) row.redaction = { count: safe.redacted, categories: safe.counts };
    appendFileSync(this.path, `${JSON.stringify(row)}\n`, { encoding: "utf8", mode: 0o600 });
    return row;
  }
}

export function readTrace(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); } catch { return { malformed: true, line: index + 1 }; }
  });
}

export function replayPrefix(path, upToSeq) {
  if (!Number.isInteger(upToSeq) || upToSeq < 1) throw new Error("upToSeq must be a positive integer");
  return readTrace(path).filter(row => !row.malformed && row.seq < upToSeq);
}
