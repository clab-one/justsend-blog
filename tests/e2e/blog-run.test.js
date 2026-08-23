import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { runBlogPipeline } from "../../src/pipeline/runner.js";

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test("mock records produce an audited publish candidate without merge or publish", async () => {
  const workspace = mkdtempSync(join(tmpdir(), "jsb-e2e-"));
  git(workspace, "init", "-b", "main");
  writeFileSync(join(workspace, "README.md"), "# Fixture workspace\n");
  git(workspace, "add", "README.md");
  git(workspace, "commit", "-m", "initial fixture");
  assert.equal(git(workspace, "log", "-1", "--format=%an <%ae>"), "steve-8000 <stv.z8k@gmail.com>");
  const base = git(workspace, "rev-parse", "HEAD");
  const request = {
    original: "지난 한 달간 JustSend에서 웹 파싱을 서버에서 온디바이스로 이전한 작업을 조사해서 기술 블로그로 작성해. 독자가 기존 구조와 새 구조의 차이를 이해할 수 있는 아키텍처 그림도 포함해.",
    goal: "웹 파싱 실행 위치 변경의 이유와 구조를 설명한다.",
    audience: "iOS와 백엔드 구조를 이해하는 개발자",
    language: "ko",
    document_type: "auto",
    date_range: { date_from: "2026-07-01", date_to: "2026-07-31" },
    visuals: "auto",
    tone: "technical-and-natural",
    publication_target: "markdown",
    topic: "서버 웹 파싱을 온디바이스 WebKit으로 옮긴 이유",
    query_terms: ["웹 파싱", "WebKit", "온디바이스"],
    assumptions: ["지난 한 달은 2026년 7월로 해석했다."]
  };
  const result = await runBlogPipeline({ workspace, fixturePath: resolve("tests/fixtures/justsend-records.json"), request, date: new Date("2026-08-23T12:34:56Z") });
  const required = ["request.md", "manifest.json", "research-summary.md", "evidence.yml", "evidence.md", "outline.md", "draft.md", "visual-plan.yml", "humanized.md", "audit.json", "trace.jsonl", "final.md"];
  for (const name of required) assert.ok(existsSync(join(result.runDir, name)), `${name} must exist`);
  for (const ext of ["html", "svg", "png"]) assert.ok(existsSync(join(result.runDir, "diagrams", `d001.${ext}`)), `diagram ${ext} must exist`);
  const audit = JSON.parse(readFileSync(join(result.runDir, "audit.json"), "utf8"));
  assert.equal(audit.result, "PASS");
  assert.deepEqual(audit.text.unsupported_claims, []);
  assert.deepEqual(audit.diagrams.unsupported_nodes, []);
  assert.deepEqual(audit.diagrams.unsupported_edges, []);
  assert.deepEqual(audit.text.numbers_changed, []);
  assert.deepEqual(audit.text.dates_changed, []);
  const manifest = JSON.parse(readFileSync(join(result.runDir, "manifest.json"), "utf8"));
  assert.equal(manifest.status, "READY_FOR_REVIEW");
  assert.equal(manifest.audit_result, "PASS");
  assert.equal(manifest.git_branch, "justsend-blog/20260823/web-parsing-on-device");
  assert.equal(git(workspace, "rev-parse", "main"), base);
  assert.equal(git(workspace, "status", "--short"), "");
  assert.ok(result.diff.includes("final.md"));
  assert.doesNotMatch(readFileSync(join(result.runDir, "trace.jsonl"), "utf8"), /sk_live_SUPERSECRET|parser\.internal|dev\.private@example/);
});
