import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { discoverCapabilities } from "../../src/mcp/capability-discovery.js";
import { redactText } from "../../src/mcp/redaction.js";
import { buildEvidencePack, deduplicateRecords, validateEvidencePack } from "../../src/pipeline/evidence.js";
import { resolveWithin } from "../../src/pipeline/run-context.js";
import { auditVisual, buildVisualPlan, renderSvg } from "../../src/pipeline/visual.js";
import { auditProtected, humanizeMarkdown, runImNotAiChangeGate } from "../../src/pipeline/humanize.js";
import { buildAuditReport, deterministicTextAudit } from "../../src/pipeline/audit.js";

const fixture = JSON.parse(readFileSync(resolve("tests/fixtures/justsend-records.json"), "utf8"));

test("capability discovery maps read descriptions and rejects write tool", () => {
  const result = discoverCapabilities(fixture.tools);
  assert.deepEqual(Object.keys(result.capabilities).sort(), ["get_attachments", "get_record", "get_related_records", "list_records_by_range", "search_records"]);
  assert.ok(!Object.values(result.capabilities).some(item => item.tool === "memo_mutation_v3"));
});

test("Evidence schema validation accepts normalized pack", () => {
  const pack = buildEvidencePack(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00.000Z", dateFrom: "2026-07-01", dateTo: "2026-07-31", queryTerms: ["WebKit"] });
  assert.deepEqual(validateEvidencePack(pack), { valid: true, errors: [] });
  assert.equal(pack.evidence[0].confidence, "direct");
});

test("duplicate records are removed by normalized content", () => {
  const result = deduplicateRecords([fixture.records[0], fixture.records[3]]);
  assert.equal(result.unique.length, 1);
  assert.deepEqual(result.duplicates[0], { record_id: "rec-web-004", duplicate_of: "rec-web-001", reason: "normalized-content" });
});

test("direct evidence and inferred items stay separate", () => {
  const records = [fixture.records[0], { id: "rec-inf-1", occurred_at: "2026-07-09", content: "설계 방향과 일치한다.", type: "inference", confidence: "inferred", supported_by: ["JS-E001"] }];
  const pack = buildEvidencePack(records, { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
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
  const pack = buildEvidencePack(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const plan = buildVisualPlan(pack);
  const diagram = plan.visuals[0];
  const report = auditVisual(diagram, pack, renderSvg(diagram));
  assert.deepEqual(report, { unsupported_nodes: [], unsupported_edges: [], incorrect_labels: [], missing_provenance: [] });
  diagram.nodes[0].evidence_ids = ["JS-E999"];
  diagram.edges[0].evidence_ids = [];
  const failed = auditVisual(diagram, pack, renderSvg(diagram));
  assert.deepEqual(failed.unsupported_nodes, ["web-document-before"]);
  assert.deepEqual(failed.unsupported_edges, ["web-document-before->server-parser"]);
});

test("humanization preserves protected date, number, URL, product, and Evidence ID", () => {
  const before = "검토를 진행했다. 2026-07-21에 WebKit 3건을 https://example.com 에서 확인했다. <!-- evidence: JS-E001 -->";
  const after = humanizeMarkdown(before, { route: "standard" });
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
  const light = humanizeMarkdown(stable, { route: "standard" });
  const pass = runImNotAiChangeGate(stable, light);
  assert.ok(pass.change_rate < 0.3);
  assert.equal(pass.verdict, "PASS");
  const fail = runImNotAiChangeGate("가".repeat(200), "나".repeat(200));
  assert.ok(fail.change_rate >= 0.5);
  assert.equal(fail.verdict, "FAIL");
});

test("unsupported factual claim blocks integrated audit", () => {
  const pack = buildEvidencePack(fixture.records.slice(0, 3), { topic: "웹 파싱", generatedAt: "2026-08-23T00:00:00Z" });
  const text = "서버 처리 성능이 90% 개선됐다.";
  const report = buildAuditReport({ technicalDraft: text, finalMarkdown: text, evidencePack: pack, visualPlan: { visuals: [] }, humanization: { route: "standard", change_rate: 0, meaning_preserved: true, verdict: "PASS" } });
  assert.equal(report.result, "FAIL");
  assert.equal(report.text.unsupported_claims.length, 1);
});
