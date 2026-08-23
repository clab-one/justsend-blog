#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { deterministicTextAudit } from "../src/pipeline/audit.js";

const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error("사용법: node scripts/claim-diff.js <technical-draft.md> <humanized.md>");
  process.exit(2);
}
const report = deterministicTextAudit(await readFile(beforePath, "utf8"), await readFile(afterPath, "utf8"));
console.log(JSON.stringify(report, null, 2));
process.exit(Object.entries(report).some(([key, value]) => key !== "claims_removed" && value.length > 0) ? 1 : 0);
