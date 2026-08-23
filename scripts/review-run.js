#!/usr/bin/env node
import { resolve } from "node:path";
import { recordReviewDecision } from "../src/pipeline/run-context.js";

const [runDirArg, decisionArg] = process.argv.slice(2);
if (!runDirArg || !decisionArg || !["accept", "reject"].includes(decisionArg)) {
  console.error("사용법: node scripts/review-run.js <run-dir> <accept|reject>");
  process.exit(2);
}

try {
  const decision = decisionArg === "accept" ? "ACCEPTED" : "REJECTED";
  const manifest = recordReviewDecision(resolve(runDirArg), decision);
  console.log(`${manifest.run_id}: ${manifest.status}`);
  console.log("branch merge, 삭제, 외부 publish는 수행하지 않았습니다.");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
