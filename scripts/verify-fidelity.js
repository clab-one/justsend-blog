#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { buildAuditReport } from "../src/pipeline/audit.js";

const [runDir] = process.argv.slice(2);
if (!runDir) {
  console.error("사용법: node scripts/verify-fidelity.js <run-dir>");
  process.exit(2);
}
try {
  const read = name => readFile(join(runDir, name), "utf8");
  const [draft, final, evidenceText, planText, humanizationText] = await Promise.all([
    read("draft.md"), read("humanized.md"), read("evidence.yml"), read("visual-plan.yml"), read("humanization.json")
  ]);
  const plan = JSON.parse(planText);
  const renderedSvgs = {};
  for (const diagram of plan.visuals) renderedSvgs[diagram.diagram_id] = await readFile(join(runDir, "diagrams", `${diagram.diagram_id.toLowerCase()}.svg`), "utf8");
  const report = buildAuditReport({ technicalDraft: draft, finalMarkdown: final, evidencePack: JSON.parse(evidenceText), visualPlan: plan, renderedSvgs, humanization: JSON.parse(humanizationText) });
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.result === "PASS" ? 0 : 1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
