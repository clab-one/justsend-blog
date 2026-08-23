import { existsSync, mkdirSync, realpathSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const RUN_ID = /^\d{8}-\d{6}-[a-z0-9][a-z0-9-]{0,63}$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

function git(cwd, args, { allowFailure = false } = {}) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`git ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`);
  }
  return { status: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

export function slugify(value) {
  const slug = String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || "blog-run";
}

export function mintRunId({ date = new Date(), slug } = {}) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  const safeSlug = slugify(slug);
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}-${safeSlug}`;
}

function deepestExisting(path) {
  let current = path;
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) throw new Error(`No existing ancestor for ${path}`);
    current = parent;
  }
  return current;
}

export function resolveWithin(root, input, { mustExist = false } = {}) {
  if (typeof input !== "string" || input.length === 0) throw new Error("path must not be empty");
  if (isAbsolute(input)) throw new Error("absolute paths are not allowed");
  if (input.split(/[\\/]+/).includes("..")) throw new Error("path traversal is not allowed");
  const rootReal = realpathSync(root);
  const candidate = resolve(rootReal, input);
  if (mustExist && !existsSync(candidate)) throw new Error(`path does not exist: ${input}`);
  const ancestor = deepestExisting(candidate);
  const ancestorReal = realpathSync(ancestor);
  const suffix = relative(ancestor, candidate);
  const resolved = resolve(ancestorReal, suffix);
  if (resolved !== rootReal && !resolved.startsWith(`${rootReal}${sep}`)) throw new Error("path escapes workspace");
  return resolved;
}

export class WriteBudget {
  constructor(limit = 50) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new Error("write limit must be an integer from 1 to 50");
    this.limit = limit;
    this.paths = new Set();
  }
  charge(path) {
    if (this.paths.has(path)) return;
    if (this.paths.size >= this.limit) throw new Error(`run write cap exceeded (${this.limit})`);
    this.paths.add(path);
  }
  get used() { return this.paths.size; }
}

export function createRunLayout({ worktree, runId, writeLimit = 50 }) {
  if (!RUN_ID.test(runId)) throw new Error(`invalid run id: ${runId}`);
  const runRelative = `.justsend-blog/runs/${runId}`;
  const runDir = resolveWithin(worktree, runRelative);
  mkdirSync(join(runDir, "diagrams"), { recursive: true, mode: 0o700 });
  const budget = new WriteBudget(writeLimit);
  return {
    runId,
    worktree,
    runDir,
    runRelative,
    budget,
    write(name, content) {
      const path = resolveWithin(runDir, name);
      budget.charge(path);
      mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
      writeFileSync(path, content, { encoding: "utf8", mode: 0o600 });
      return path;
    },
  };
}

function ensureRuntimePathsIgnored(root) {
  const gitPath = git(root, ["rev-parse", "--git-path", "info/exclude"]).stdout;
  const excludePath = isAbsolute(gitPath) ? gitPath : resolve(root, gitPath);
  const current = existsSync(excludePath) ? readFileSync(excludePath, "utf8") : "";
  const required = [".justsend-blog/worktrees/", ".justsend-blog/runs/", ".justsend-blog/cache/"];
  const missing = required.filter(pattern => !current.split("\n").includes(pattern));
  if (missing.length > 0) writeFileSync(excludePath, `${current}${current && !current.endsWith("\n") ? "\n" : ""}${missing.join("\n")}\n`, "utf8");
}

export function prepareIsolatedRun({ workspace, runId, slug, writeLimit = 50 }) {
  if (!RUN_ID.test(runId)) throw new Error(`invalid run id: ${runId}`);
  const safeSlug = slugify(slug);
  if (!SLUG.test(safeSlug)) throw new Error(`invalid slug: ${slug}`);
  const root = git(workspace, ["rev-parse", "--show-toplevel"]).stdout;
  const head = git(root, ["rev-parse", "HEAD"]).stdout;
  const date = runId.slice(0, 8);
  const branch = `justsend-blog/${date}/${safeSlug}`;
  if (git(root, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`], { allowFailure: true }).status === 0) {
    throw new Error(`run branch already exists: ${branch}`);
  }
  ensureRuntimePathsIgnored(root);
  const worktreeRelative = `.justsend-blog/worktrees/${runId}`;
  const worktree = resolveWithin(root, worktreeRelative);
  mkdirSync(dirname(worktree), { recursive: true, mode: 0o700 });
  git(root, ["worktree", "add", "-b", branch, worktree, head]);
  const layout = createRunLayout({ worktree, runId, writeLimit });
  return { ...layout, root, baseCommit: head, branch };
}

export function commitRunPaths(context, paths, message) {
  if (!Array.isArray(paths) || paths.length === 0) throw new Error("explicit paths are required");
  const normalized = paths.map(path => {
    const absolute = resolveWithin(context.worktree, path, { mustExist: true });
    const rel = relative(context.worktree, absolute);
    if (!rel.startsWith(`${context.runRelative}${sep}`) && rel !== context.runRelative) {
      throw new Error(`refusing to stage non-run path: ${rel}`);
    }
    return rel;
  });
  git(context.worktree, ["add", "-f", "--", ...normalized]);
  const staged = git(context.worktree, ["diff", "--cached", "--name-only"]).stdout.split("\n").filter(Boolean);
  const unexpected = staged.filter(path => !normalized.some(allowed => path === allowed || path.startsWith(`${allowed}${sep}`)));
  if (unexpected.length > 0) throw new Error(`unexpected staged paths: ${unexpected.join(", ")}`);
  git(context.worktree, ["commit", "-m", message, "--", ...normalized]);
  return git(context.worktree, ["rev-parse", "HEAD"]).stdout;
}

export function runDiff(context) {
  return git(context.worktree, ["diff", "--no-ext-diff", context.baseCommit, "HEAD", "--", context.runRelative]).stdout;
}

export function recordReviewDecision(runDir, decision) {
  if (!["ACCEPTED", "REJECTED"].includes(decision)) throw new Error("decision must be ACCEPTED or REJECTED");
  const manifestPath = join(runDir, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.status !== "READY_FOR_REVIEW") throw new Error("only READY_FOR_REVIEW runs can be decided");
  manifest.status = decision;
  manifest.reviewed_at = new Date().toISOString();
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
  return manifest;
}
