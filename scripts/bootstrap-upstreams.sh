#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd -P)"
mkdir -p "$ROOT/.upstream"
clone_pinned() {
  local name="$1" url="$2" sha="$3"
  local target="$ROOT/.upstream/$name"
  if [[ -e "$target" ]]; then
    printf 'skip %s: already exists\n' "$name"
    return
  fi
  git clone --filter=blob:none "$url" "$target"
  git -C "$target" checkout --detach "$sha"
  printf '%s %s\n' "$name" "$(git -C "$target" rev-parse HEAD)"
}
clone_pinned omp https://github.com/can1357/oh-my-pi.git 160ed439ac0df594347e7d7018b813a7ffdb5e81
clone_pinned solomd https://github.com/zhitongblog/solomd.git 65027dac77866d45c15f56de8999bbf6fc617e22
clone_pinned im-not-ai https://github.com/epoko77-ai/im-not-ai.git 0ac1e84f92334f9696e69184478f91c1c6f1dc5e
clone_pinned toss-technical-writing https://github.com/toss/technical-writing.git 68ba335cbe35c877775f092e98177b60da5f3d95
clone_pinned diagram-design https://github.com/cathrynlavery/diagram-design.git 648c2a597839301e06df1e7434a08bde9f42eed3
