#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildAuditReport } from "../src/pipeline/audit.js";
import { defaultQualityContract } from "../src/pipeline/quality.js";

const [runDir] = process.argv.slice(2);
if (!runDir) {
  console.error("사용법: node scripts/verify-fidelity.js <run-dir>");
  process.exit(2);
}
try {
  const read = name => readFile(join(runDir, name), "utf8");
  const optional = async name => {
    try { return await read(name); }
    catch (error) { if (error?.code === "ENOENT") return null; throw error; }
  };
  const [draft, final, evidenceText, planText, humanizationText, outlineText, qualityText] = await Promise.all([
    read("draft.md"), read("humanized.md"), read("evidence.yml"), read("visual-plan.yml"), read("humanization.json"),
    optional("outline.json"), optional("quality-contract.json")
  ]);
  const plan = JSON.parse(planText);
  const outline = outlineText ? JSON.parse(outlineText) : { sections: [] };
  const qualityContract = qualityText ? JSON.parse(qualityText) : defaultQualityContract();
  const renderedSvgs = {};
  for (const diagram of plan.visuals) renderedSvgs[diagram.diagram_id] = await readFile(join(runDir, "diagrams", `${diagram.diagram_id.toLowerCase()}.svg`), "utf8");
  const report = buildAuditReport({ technicalDraft: draft, finalMarkdown: final, evidencePack: JSON.parse(evidenceText), outline, visualPlan: plan, qualityContract, renderedSvgs, humanization: JSON.parse(humanizationText) });
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.result === "PASS" ? 0 : 1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
