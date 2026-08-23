import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const PROTECTED_PATTERNS = [
  ["frontmatter", /^---\n[\s\S]*?\n---\n?/],
  ["code_block", /```[\s\S]*?```/g],
  ["html_comment", /<!--[\s\S]*?-->/g],
  ["inline_code", /`[^`\n]+`/g],
  ["url", /https?:\/\/[^\s)>]+/g],
  ["evidence_id", /\bJS-[EI]\d{3,}\b/g],
  ["record_id", /\brec-[a-z0-9-]+\b/gi],
  ["date", /\b\d{4}-\d{2}-\d{2}(?:T[0-9:.+-]+Z?)?\b/g],
  ["number", /(?<![A-Za-z가-힣])[-+]?\d+(?:[.,]\d+)*(?:%|ms|s|MB|GB|배|건|개|명)?(?![A-Za-z가-힣])/g],
  ["quoted", /[“"][^”"\n]{1,300}[”"]/g],
  ["path", /(?:\.{0,2}\/)?(?:[A-Za-z0-9._-]+\/)+[A-Za-z0-9._-]+/g],
  ["technical_token", /\b[A-Za-z][A-Za-z0-9._/-]*\b/g],
];

function collectMatches(text) {
  const matches = [];
  for (const [kind, pattern] of PROTECTED_PATTERNS) {
    const regex = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
    for (const match of text.matchAll(regex)) matches.push({ kind, value: match[0], start: match.index, end: match.index + match[0].length });
  }
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const selected = [];
  for (const match of matches) {
    if (selected.some(item => match.start < item.end && match.end > item.start)) continue;
    selected.push(match);
  }
  return selected.sort((a, b) => a.start - b.start);
}

export function extractProtected(text) {
  const grouped = {};
  for (const match of collectMatches(String(text))) {
    const list = grouped[match.kind] ?? [];
    list.push(match.value);
    grouped[match.kind] = list;
  }
  return grouped;
}

function maskProtected(text) {
  const matches = collectMatches(text);
  let cursor = 0;
  let masked = "";
  const values = [];
  for (const match of matches) {
    masked += text.slice(cursor, match.start);
    const token = `\uE000${values.length}\uE001`;
    masked += token;
    values.push(match.value);
    cursor = match.end;
  }
  masked += text.slice(cursor);
  return { masked, restore(value) { return value.replace(/\uE000(\d+)\uE001/g, (_, index) => values[Number(index)]); } };
}

function polishKorean(text, route) {
  let out = text
    .replace(/검토를 진행했다/g, "검토했다")
    .replace(/작업을 진행했다/g, "작업했다")
    .replace(/처리가 진행되었다/g, "처리했다")
    .replace(/수행되었습니다/g, "수행했다")
    .replace(/진행되었습니다/g, "진행됐다")
    .replace(/이루어졌습니다/g, "이뤄졌다");
  if (route !== "light") {
    out = out
      .replace(/검토를 수행했다/g, "검토했다")
      .replace(/확인을 수행했다/g, "확인했다")
      .replace(/구현을 진행했다/g, "구현했다")
      .replace(/테스트를 진행했다/g, "테스트했다");
  }
  if (route === "heavy") {
    out = out.replace(/매우 중요한 /g, "중요한 ").replace(/효과적으로 /g, "");
  }
  return out;
}

export function humanizeMarkdown(text, { route = "standard" } = {}) {
  if (!["light", "standard", "heavy"].includes(route)) throw new Error(`invalid humanization route: ${route}`);
  const source = String(text);
  const masked = maskProtected(source);
  return masked.restore(polishKorean(masked.masked, route));
}

export function selectImNotAiRoute(text, { vendorRoot = resolve("vendor/im-not-ai"), override } = {}) {
  const requested = override && /^(light|standard|heavy)$/.test(override) ? override : null;
  const runDir = mkdtempSync(join(tmpdir(), "justsend-blog-humanize-"));
  try {
    writeFileSync(join(runDir, "01_input.txt"), String(text), "utf8");
    const script = join(vendorRoot, "scripts", "prepare_monolith_input.py");
    const result = spawnSync("python3", [script, "--run-dir", runDir, "--genre", "blog"], { encoding: "utf8" });
    let routeHint = "standard";
    let reason = "im-not-ai metrics unavailable; safe standard route";
    try {
      const metrics = JSON.parse(readFileSync(join(runDir, "00_metrics.json"), "utf8"));
      if (["light", "standard", "heavy"].includes(metrics.route_hint)) {
        routeHint = metrics.route_hint;
        reason = "im-not-ai 00_metrics.json route_hint";
      }
    } catch { /* handled by standard fallback */ }
    if (requested) return { route: requested, route_hint: routeHint, reason: "사용자 지정 route가 im-not-ai hint보다 우선한다.", exit_code: result.status };
    return { route: routeHint, route_hint: routeHint, reason, exit_code: result.status };
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
}

function multisetDifference(before = [], after = []) {
  const counts = new Map();
  for (const value of after) counts.set(value, (counts.get(value) ?? 0) + 1);
  const missing = [];
  for (const value of before) {
    const count = counts.get(value) ?? 0;
    if (count === 0) missing.push(value);
    else counts.set(value, count - 1);
  }
  const added = [];
  for (const [value, count] of counts) for (let i = 0; i < count; i++) added.push(value);
  return { missing, added };
}

export function auditProtected(before, after) {
  const left = extractProtected(before);
  const right = extractProtected(after);
  const differences = {};
  for (const kind of new Set([...Object.keys(left), ...Object.keys(right)])) {
    const diff = multisetDifference(left[kind], right[kind]);
    if (diff.missing.length || diff.added.length) differences[kind] = diff;
  }
  return { meaning_preserved: Object.keys(differences).length === 0, differences };
}

export function runImNotAiChangeGate(before, after, { vendorRoot = resolve("vendor/im-not-ai") } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "justsend-blog-gate-"));
  try {
    const beforePath = join(dir, "before.md");
    const afterPath = join(dir, "after.md");
    writeFileSync(beforePath, before, "utf8");
    writeFileSync(afterPath, after, "utf8");
    const result = spawnSync("python3", [join(vendorRoot, "scripts", "verify_change_rate.py"), "--before", beforePath, "--after", afterPath], { encoding: "utf8" });
    const match = result.stdout.match(/change_rate:\s*([0-9.]+)%/);
    if (!match || ![0, 1, 2].includes(result.status)) throw new Error(`im-not-ai gate failed: ${(result.stderr || result.stdout).trim()}`);
    const changeRate = Number(match[1]) / 100;
    const protectedAudit = auditProtected(before, after);
    return {
      change_rate: changeRate,
      verdict: result.status === 0 ? "PASS" : result.status === 1 ? "WARN" : "FAIL",
      exit_code: result.status,
      meaning_preserved: protectedAudit.meaning_preserved,
      protected_differences: protectedAudit.differences,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
