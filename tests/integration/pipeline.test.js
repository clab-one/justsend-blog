import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { discoverCapabilities } from "../../src/mcp/capability-discovery.js";
import { JustSendAdapter } from "../../src/mcp/justsend-adapter.js";
import { buildEvidencePack, selectRelevantRecords, validateEvidencePack } from "../../src/pipeline/evidence.js";
import { prepareIsolatedRun } from "../../src/pipeline/run-context.js";

const fixture = JSON.parse(readFileSync(resolve("tests/fixtures/justsend-records.json"), "utf8"));

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test("mock JustSend MCP creates redacted deduplicated conflict-aware Evidence Pack", async () => {
  const discovery = discoverCapabilities(fixture.tools);
  const trace = [];
  const invoke = async (name, args) => {
    const description = fixture.tools.find(tool => tool.name === name).description.toLowerCase();
    if (description.includes("date range")) return selectRelevantRecords(fixture.records, { dateFrom: args.date_from, dateTo: args.date_to });
    if (description.includes("search")) return selectRelevantRecords(fixture.records, { queryTerms: ["웹 파싱", "WebKit", "온디바이스"] });
    if (description.includes("one record")) return fixture.records.find(record => record.id === args.record_id);
    return [];
  };
  const adapter = new JustSendAdapter({ discovery, invoke, trace: (event, details) => trace.push({ event, details }) });
  const candidates = await adapter.searchRecords({ query: "웹 파싱 WebKit 온디바이스" });
  const full = await Promise.all(candidates.map(record => adapter.getRecord({ record_id: record.id })));
  const pack = buildEvidencePack(full, { topic: "웹 파싱 이전", generatedAt: "2026-08-23T00:00:00Z", dateFrom: "2026-07-01", dateTo: "2026-07-31", queryTerms: ["웹 파싱", "WebKit", "온디바이스"] });
  assert.equal(validateEvidencePack(pack).valid, true);
  assert.equal(pack.duplicates.length, 1);
  assert.equal(pack.conflicts.length, 1);
  assert.equal(pack.evidence.filter(item => item.sensitivity === "redacted").length, 1);
  assert.doesNotMatch(JSON.stringify(pack), /sk_live_SUPERSECRET|parser\.internal|dev\.private@example/);
  assert.ok(trace.some(row => row.event === "mcp_call_started"));
  assert.ok(trace.every(row => !JSON.stringify(row).includes("sk_live_SUPERSECRET")));
});

test("worktree isolation preserves dirty tracked and untracked user files", () => {
  const workspace = mkdtempSync(join(tmpdir(), "jsb-workspace-"));
  git(workspace, "init", "-b", "main");
  writeFileSync(join(workspace, "article.md"), "committed\n");
  git(workspace, "add", "article.md");
  git(workspace, "commit", "-m", "initial fixture");
  assert.equal(git(workspace, "log", "-1", "--format=%an <%ae>"), "steve-8000 <stv.z8k@gmail.com>");
  writeFileSync(join(workspace, "article.md"), "user dirty change\n");
  writeFileSync(join(workspace, "notes.tmp"), "untracked user file\n");
  const context = prepareIsolatedRun({ workspace, runId: "20260823-120000-isolation-test", slug: "isolation-test" });
  assert.equal(readFileSync(join(workspace, "article.md"), "utf8"), "user dirty change\n");
  assert.equal(readFileSync(join(workspace, "notes.tmp"), "utf8"), "untracked user file\n");
  assert.equal(readFileSync(join(context.worktree, "article.md"), "utf8"), "committed\n");
  assert.match(context.branch, /^justsend-blog\/20260823\/isolation-test$/);
  assert.match(git(workspace, "status", "--short"), /article\.md|notes\.tmp/);
});
