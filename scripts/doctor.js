#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

function command(name, args) {
  const result = spawnSync(name, args, { encoding: "utf8" });
  return { ok: result.status === 0, output: (result.stdout || result.stderr).trim() };
}
const checks = [
  ["OMP", command("omp", ["--version"])],
  ["Node", command("node", ["--version"])],
  ["Python", command("python3", ["--version"])],
  ["Git", command("git", ["--version"])],
  ["Master Skill", { ok: existsSync(resolve("skills/justsend-blog/SKILL.md")), output: "skills/justsend-blog/SKILL.md" }],
  ["diagram-design vendor", { ok: existsSync(resolve("skills/justsend-blog/vendor/diagram-design/SKILL.md")), output: "skills/justsend-blog/vendor/diagram-design/SKILL.md" }],
  ["im-not-ai metrics", { ok: existsSync(resolve("skills/justsend-blog/vendor/im-not-ai/scripts/prepare_monolith_input.py")), output: "vendored Python" }],
  ["JustSend MCP config", { ok: existsSync(resolve(".omp/mcp.json")), output: existsSync(resolve(".omp/mcp.json")) ? ".omp/mcp.json" : "미설정: .omp/mcp.json.example을 복사하고 placeholder를 실제 값으로 교체" }],
];
for (const [name, result] of checks) console.log(`${result.ok ? "PASS" : "WARN"} ${name}: ${result.output}`);
const hardFailures = checks.filter(([name, result]) => name !== "JustSend MCP config" && !result.ok);
process.exit(hardFailures.length ? 1 : 0);
