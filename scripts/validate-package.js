#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const required = [
  "package.json", "plugin.json", ".omp-plugin/plugin.json", "skills/justsend-blog/SKILL.md",
  "docs/architecture/SOLOMD_TRACEABILITY.md", "docs/adr/0001-solomd-authoring-core.md",
  "schemas/evidence-pack.schema.json", "schemas/visual-plan.schema.json", "schemas/audit-report.schema.json",
  "policies/writing-policy.yml", "THIRD_PARTY_NOTICES.md", "upstreams.lock.yml"
];
const errors = required.filter(path => !existsSync(join(root, path))).map(path => `missing: ${path}`);
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const plugin = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8"));
const ompPlugin = JSON.parse(readFileSync(join(root, ".omp-plugin/plugin.json"), "utf8"));
if (pkg.name !== "justsend-blog") errors.push("package name must be justsend-blog");
if (pkg.version !== plugin.version || pkg.version !== ompPlugin.version || pkg.omp?.version !== pkg.version) errors.push("manifest versions must match");
const skillsDir = join(root, "skills");
for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const path = join(skillsDir, entry.name, "SKILL.md");
  if (!existsSync(path)) { errors.push(`skill missing SKILL.md: ${entry.name}`); continue; }
  const text = readFileSync(path, "utf8");
  if (!/^---\n[\s\S]*?description:\s*.+\n[\s\S]*?---\n/.test(text)) errors.push(`skill description frontmatter missing: ${entry.name}`);
}
const traceability = readFileSync(join(root, "docs/architecture/SOLOMD_TRACEABILITY.md"), "utf8");
for (const source of ["agent_run.rs", "recipe_runner.rs", "git_history.rs", "safety.rs", "trace.rs"]) if (!traceability.includes(source)) errors.push(`SoloMD traceability missing source: ${source}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`PASS package=${pkg.name}@${pkg.version} skills=${readdirSync(skillsDir, { withFileTypes: true }).filter(entry => entry.isDirectory()).length}`);
