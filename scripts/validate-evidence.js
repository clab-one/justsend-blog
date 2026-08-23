#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { validateEvidencePack } from "../src/pipeline/evidence.js";

const path = process.argv[2];
if (!path) {
  console.error("사용법: node scripts/validate-evidence.js <evidence.yml>");
  process.exit(2);
}

try {
  const pack = JSON.parse(await readFile(path, "utf8"));
  const result = validateEvidencePack(pack);
  if (!result.valid) {
    console.error(result.errors.join("\n"));
    process.exit(1);
  }
  console.log(`PASS evidence=${pack.evidence.length} inferences=${pack.inferences.length} conflicts=${pack.conflicts.length}`);
} catch (error) {
  console.error(`Evidence Pack을 읽을 수 없습니다: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(2);
}
