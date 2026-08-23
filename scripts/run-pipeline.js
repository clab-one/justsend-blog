#!/usr/bin/env node
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { runBlogPipeline } from "../src/pipeline/runner.js";
import { mintRunId, prepareIsolatedRun } from "../src/pipeline/run-context.js";

function args(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index++) {
    const key = argv[index];
    if (!key.startsWith("--")) continue;
    result[key.slice(2)] = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : true;
  }
  return result;
}

const options = args(process.argv.slice(2));
if (options["prepare-only"]) {
  if (!options.workspace) {
    console.error("사용법: node scripts/run-pipeline.js --workspace <git-root> --prepare-only [--slug <slug>] [--date <ISO-8601>]");
    process.exit(2);
  }
  const date = options.date ? new Date(options.date) : new Date();
  const slug = options.slug || "blog-run";
  const runId = mintRunId({ date, slug });
  const context = prepareIsolatedRun({ workspace: resolve(options.workspace), runId, slug });
  console.log(JSON.stringify({ run_id: runId, run_dir: context.runDir, worktree: context.worktree, branch: context.branch, base_commit: context.baseCommit }, null, 2));
  process.exit(0);
}
if (!options.workspace || !options.fixture) {
  console.error("사용법: node scripts/run-pipeline.js --workspace <git-root> --fixture <mock-records.json> [--request <request.json>] [--date <ISO-8601>]");
  console.error("실제 JustSend MCP 실행은 /skill:justsend-blog가 현재 OMP tool description을 발견해 직접 수행합니다.");
  process.exit(2);
}

const defaultRequest = {
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
  assumptions: ["지난 한 달은 2026-07-01부터 2026-07-31까지로 해석했다."],
};

try {
  const request = options.request ? JSON.parse(await readFile(resolve(options.request), "utf8")) : defaultRequest;
  const result = await runBlogPipeline({ workspace: resolve(options.workspace), fixturePath: resolve(options.fixture), request, date: options.date ? new Date(options.date) : new Date() });
  console.log(JSON.stringify({ run_dir: result.runDir, branch: result.branch, commit: result.commit, audit: result.audit.result, status: "READY_FOR_REVIEW" }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
}
