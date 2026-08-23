#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const required = [
  "package.json", "plugin.json", ".omp-plugin/plugin.json", "skills/justsend-blog/SKILL.md",
  "docs/architecture/SOLOMD_TRACEABILITY.md", "docs/adr/0001-solomd-authoring-core.md",
  "schemas/evidence-pack.schema.json", "schemas/visual-plan.schema.json", "schemas/quality-contract.schema.json", "schemas/audit-report.schema.json",
  "policies/writing-policy.yml", "THIRD_PARTY_NOTICES.md", "upstreams.lock.yml",
  "skills/justsend-blog/references/workflows/research.md",
  "skills/justsend-blog/references/workflows/evidence.md",
  "skills/justsend-blog/references/workflows/writing.md",
  "skills/justsend-blog/references/workflows/visual.md",
  "skills/justsend-blog/references/workflows/humanize.md",
  "skills/justsend-blog/references/workflows/audit.md",
  "skills/justsend-blog/vendor/diagram-design/SKILL.md",
  "skills/justsend-blog/vendor/im-not-ai/scripts/prepare_monolith_input.py"
];
const errors = required.filter(path => !existsSync(join(root, path))).map(path => `missing: ${path}`);
for (const name of ["evidence-pack", "visual-plan", "quality-contract", "audit-report", "run-manifest"]) {
  const path = join(root, "schemas", `${name}.schema.json`);
  try { JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { errors.push(`invalid schema JSON: ${name}: ${error.message}`); }
}
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const plugin = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8"));
const ompPlugin = JSON.parse(readFileSync(join(root, ".omp-plugin/plugin.json"), "utf8"));
if (pkg.name !== "justsend-blog") errors.push("package name must be justsend-blog");
if (pkg.version !== plugin.version || pkg.version !== ompPlugin.version || pkg.omp?.version !== pkg.version) errors.push("manifest versions must match");
const skillsDir = join(root, "skills");
const skillEntries = readdirSync(skillsDir, { withFileTypes: true }).filter(entry => entry.isDirectory());
if (skillEntries.length !== 1 || skillEntries[0].name !== "justsend-blog") errors.push(`only justsend-blog may be exposed; found: ${skillEntries.map(entry => entry.name).join(", ")}`);
for (const entry of skillEntries) {
  if (!entry.isDirectory()) continue;
  const path = join(skillsDir, entry.name, "SKILL.md");
  if (!existsSync(path)) { errors.push(`skill missing SKILL.md: ${entry.name}`); continue; }
  const text = readFileSync(path, "utf8");
  if (!/^---\n[\s\S]*?description:\s*.+\n[\s\S]*?---\n/.test(text)) errors.push(`skill description frontmatter missing: ${entry.name}`);
}
const traceability = readFileSync(join(root, "docs/architecture/SOLOMD_TRACEABILITY.md"), "utf8");
for (const source of ["agent_run.rs", "recipe_runner.rs", "git_history.rs", "safety.rs", "trace.rs"]) if (!traceability.includes(source)) errors.push(`SoloMD traceability missing source: ${source}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`PASS package=${pkg.name}@${pkg.version} exposed-skills=${skillEntries.length} internal-workflows=6`);
