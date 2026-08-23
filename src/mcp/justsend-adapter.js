import { requireCapabilities } from "./capability-discovery.js";
import { redactValue, redactionTrace } from "./redaction.js";

const READ_OPERATIONS = new Set([
  "search_records",
  "get_record",
  "list_records_by_range",
  "get_related_records",
  "get_attachments",
]);

export class JustSendAdapter {
  constructor({ discovery, invoke, trace = () => {} }) {
    if (typeof invoke !== "function") throw new TypeError("invoke must be a function");
    this.capabilities = discovery?.capabilities ?? {};
    this.invoke = invoke;
    this.trace = trace;
  }

  async call(logical, args = {}) {
    if (!READ_OPERATIONS.has(logical)) throw new Error(`Write or unknown logical capability is blocked: ${logical}`);
    const map = requireCapabilities({ capabilities: this.capabilities }, [logical]);
    const target = map[logical];
    const safeArgs = redactValue(args);
    this.trace("mcp_call_started", {
      logical_capability: logical,
      server: target.server,
      redaction: redactionTrace(safeArgs.counts),
    });
    try {
      const raw = await this.invoke(target.tool, args);
      const safe = redactValue(raw);
      this.trace("mcp_call_completed", {
        logical_capability: logical,
        server: target.server,
        ok: true,
        redaction: redactionTrace(safe.counts),
      });
      return safe.value;
    } catch (error) {
      this.trace("mcp_call_completed", {
        logical_capability: logical,
        server: target.server,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  searchRecords(args) { return this.call("search_records", args); }
  getRecord(args) { return this.call("get_record", args); }
  listRecordsByRange(args) { return this.call("list_records_by_range", args); }
  getRelatedRecords(args) { return this.call("get_related_records", args); }
  getAttachments(args) { return this.call("get_attachments", args); }
}

export function assertReadOnlyDiscovery(discovery) {
  for (const [logical, entry] of Object.entries(discovery?.capabilities ?? {})) {
    if (!READ_OPERATIONS.has(logical) || entry.read_only !== true) {
      throw new Error(`Non-read capability in map: ${logical}`);
    }
  }
  return true;
}
