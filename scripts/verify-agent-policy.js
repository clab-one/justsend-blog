#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.argv[2] ?? "docs/research/scout-audit.json");
try {
  const audit = JSON.parse(readFileSync(path, "utf8"));
  const types = [...new Set(audit.agents.map(agent => agent.agent_type))].sort();
  const violations = audit.agents.filter(agent => agent.agent_type !== "scout" || agent.mode !== "read-only" || agent.state_changes !== false || agent.recursive_spawns !== false);
  if (types.length !== 1 || types[0] !== "scout" || violations.length) {
    console.error(JSON.stringify({ types, violations }, null, 2));
    process.exit(1);
  }
  console.log(`PASS spawned agent types == ["scout"]; agents=${audit.agents.length}; state_changes=0; recursive_spawns=0`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
