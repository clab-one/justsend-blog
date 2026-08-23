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
  console.error("사용법: node scripts/run-pipeline.js --workspace <git-root> --fixture <mock-records.json> [--research-sources <sources.json>] [--visual-specs <visual-specs.json>] [--request <request.json>] [--date <ISO-8601>]");
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

const defaultVisualSpecs = [{
  diagram_id: "D001",
  covers_section_ids: ["S02", "S03"],
  purpose: "서버 파싱에서 iOS WebKit 온디바이스 처리로 바뀐 데이터 흐름을 비교한다.",
  semantic_pattern: "unstructured-to-structured",
  evidence_ids: ["JS-E001", "JS-E003"],
  nodes: [
    { id: "web-document-before", label: "Web document · before", role: "source", evidence_ids: ["JS-E001"] },
    { id: "server-parser", label: "Server parser", role: "transform", evidence_ids: ["JS-E001"] },
    { id: "web-document-after", label: "Web document · after", role: "source", evidence_ids: ["JS-E003"] },
    { id: "webkit", label: "WebKit", role: "transform", evidence_ids: ["JS-E001", "JS-E003"] },
    { id: "ios-app", label: "iOS App", role: "sink", evidence_ids: ["JS-E001", "JS-E003"] },
  ],
  edges: [
    { from: "web-document-before", to: "server-parser", label: "before", kind: "flow", evidence_ids: ["JS-E001"] },
    { from: "web-document-after", to: "webkit", label: "reads", kind: "flow", evidence_ids: ["JS-E003"] },
    { from: "webkit", to: "ios-app", label: "normalizes", kind: "flow", evidence_ids: ["JS-E003"] },
  ],
  excluded: ["Evidence에 없는 서버 컴포넌트"],
  formats: ["html", "svg", "png"],
}];

try {
  const request = options.request ? JSON.parse(await readFile(resolve(options.request), "utf8")) : defaultRequest;
  const researchSources = options["research-sources"]
    ? JSON.parse(await readFile(resolve(options["research-sources"]), "utf8"))
    : [];
  if (!Array.isArray(researchSources)) throw new TypeError("research-sources must be a JSON array");
  const visualSpecs = options["visual-specs"]
    ? JSON.parse(await readFile(resolve(options["visual-specs"]), "utf8"))
    : (options.request ? [] : defaultVisualSpecs);
  if (!Array.isArray(visualSpecs)) throw new TypeError("visual-specs must be a JSON array");
  const result = await runBlogPipeline({ workspace: resolve(options.workspace), fixturePath: resolve(options.fixture), request, researchSources, visualSpecs, date: options.date ? new Date(options.date) : new Date() });
  console.log(JSON.stringify({ run_dir: result.runDir, branch: result.branch, commit: result.commit, audit: result.audit.result, status: "READY_FOR_REVIEW" }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
}
