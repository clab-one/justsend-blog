import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const read = path => readFileSync(resolve(path), "utf8");

test("agent policy audit contains Scout only and no Scout mutation", () => {
  const audit = JSON.parse(read("docs/research/scout-audit.json"));
  assert.deepEqual([...new Set(audit.agents.map(agent => agent.agent_type))], ["scout"]);
  assert.ok(audit.agents.every(agent => agent.mode === "read-only" && agent.state_changes === false && agent.recursive_spawns === false));
});

test("only justsend-blog is exposed while workflows and vendors stay internal", () => {
  const exposed = readdirSync(resolve("skills"), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
  assert.deepEqual(exposed, ["justsend-blog"]);
  for (const workflow of ["research", "evidence", "writing", "visual", "humanize", "audit"]) {
    assert.ok(existsSync(resolve(`skills/justsend-blog/references/workflows/${workflow}.md`)), workflow);
  }
  assert.ok(existsSync(resolve("skills/justsend-blog/vendor/diagram-design/SKILL.md")));
  assert.ok(existsSync(resolve("skills/justsend-blog/vendor/im-not-ai/scripts/prepare_monolith_input.py")));
  assert.ok(existsSync(resolve("schemas/quality-contract.schema.json")));
  const master = read("skills/justsend-blog/SKILL.md");
  for (const token of ["quality-contract.json", "corpus", "visual_candidate", "첨부 부재"]) assert.ok(master.includes(token), token);
});

test("quality and visual schemas require the new publication gates", () => {
  const visual = JSON.parse(read("schemas/visual-plan.schema.json"));
  const audit = JSON.parse(read("schemas/audit-report.schema.json"));
  const quality = JSON.parse(read("schemas/quality-contract.schema.json"));
  assert.deepEqual(visual.required, ["visuals", "decisions"]);
  assert.ok(visual.properties.decisions);
  assert.ok(visual.properties.visuals.items.required.includes("covers_section_ids"));
  assert.ok(audit.required.includes("quality"));
  assert.ok(audit.properties.diagrams.required.includes("missing_required_visuals"));
  assert.equal(quality.properties.exemptions.items.properties.approved_by.const, "user");
});

test("SoloMD traceability names real upstream implementation and adopted contracts", () => {
  const traceability = read("docs/architecture/SOLOMD_TRACEABILITY.md");
  for (const path of ["workspace_index.rs", "agent_run.rs", "recipes.rs", "recipe_runner.rs", "git_history.rs", "trace.rs", "safety.rs"]) assert.match(traceability, new RegExp(path.replace(".", "\\.")));
  for (const concept of ["Plain Markdown", "worktree", "trace.jsonl", "Accept/Reject", "Path traversal", "Write cap", "READY_FOR_REVIEW"]) assert.ok(traceability.includes(concept), concept);
  for (const path of ["src/pipeline/run-context.js", "src/tracing/trace-writer.js", "schemas/run-manifest.schema.json", "tests/integration/pipeline.test.js"]) assert.ok(existsSync(resolve(path)), path);
});
