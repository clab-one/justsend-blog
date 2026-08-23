#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { validateResearchPack } from "../src/pipeline/research.js";

const path = process.argv[2];
if (!path) {
  console.error("사용법: node scripts/validate-research.js <research-pack.yml>");
  process.exit(2);
}

try {
  const pack = JSON.parse(await readFile(path, "utf8"));
  const result = validateResearchPack(pack);
  if (!result.valid) {
    console.error(result.errors.join("\n"));
    process.exit(1);
  }
  const selected = pack.sources.filter(source => source.selected);
  console.log(`PASS sources=${pack.sources.length} selected=${selected.length} providers=${new Set(selected.map(source => source.provider)).size}`);
} catch (error) {
  console.error(`Research Pack을 읽을 수 없습니다: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(2);
}
