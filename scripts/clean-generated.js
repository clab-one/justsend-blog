#!/usr/bin/env node
import { readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

function clean(root) {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory() && entry.name === "__pycache__") {
      rmSync(path, { recursive: true, force: true });
      continue;
    }
    if (entry.isDirectory()) clean(path);
    else if (/\.py[co]$/.test(entry.name)) rmSync(path, { force: true });
  }
}

clean(resolve("skills/justsend-blog/vendor"));
