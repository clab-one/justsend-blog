#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { discoverCapabilities } from "../src/mcp/capability-discovery.js";

const path = process.argv[2];
if (!path) {
  console.error("사용법: node scripts/discover-capabilities.js <mcp-tools.json>");
  process.exit(2);
}
try {
  const input = JSON.parse(await readFile(path, "utf8"));
  const tools = Array.isArray(input) ? input : input.tools;
  const result = discoverCapabilities(tools);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ambiguous.length ? 1 : 0);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
