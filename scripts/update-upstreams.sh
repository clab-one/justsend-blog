#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd -P)"
for name in omp solomd im-not-ai toss-technical-writing diagram-design; do
  repo="$ROOT/.upstream/$name"
  if [[ ! -d "$repo/.git" ]]; then
    printf '%s missing; run scripts/bootstrap-upstreams.sh\n' "$name"
    continue
  fi
  git -C "$repo" fetch --filter=blob:none origin
  local_sha="$(git -C "$repo" rev-parse HEAD)"
  remote_sha="$(git -C "$repo" rev-parse origin/HEAD)"
  printf '%s local=%s remote=%s %s\n' "$name" "$local_sha" "$remote_sha" "$([[ "$local_sha" == "$remote_sha" ]] && printf current || printf review-required)"
done
printf 'No lockfile, checkout, vendored file, or working tree was changed.\n'
