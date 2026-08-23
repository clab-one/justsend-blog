# Research Summary — 작업 기록을 기술 글로 바꾸기 전에 Research Pack을 강제한 이유

- selected source: 6
- providers: corpus, justsend, official-docs, repository, runtime
- production gate: repository 2 · official primary 1 · runtime 1 · corpus 1 · JustSend seed 1

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:248CB389-B6D1-401D-AAF8-8D8D6401C2AE` | seed-not-source, worktree-isolation, runtime-tests |
| RS-002 | repository | `justsend-blog/src/pipeline/research.js:36-149` | research-pack, seed-not-source |
| RS-003 | repository | `justsend-blog/src/pipeline/quality.js:40-195` | evidence-mapping, quality-gate |
| RS-004 | official-docs | `https://git-scm.com/docs/git-worktree` | worktree-isolation, quality-gate |
| RS-005 | runtime | `justsend-blog@4447f67:npm-test-and-doctor` | runtime-tests, research-pack, quality-gate |
| RS-006 | corpus | `web/content/blog/evidence-first-blog-pipeline/ko.md:1-` | corpus-depth, seed-not-source |

## 조사 결론

JustSend 기록은 사건과 실패의 시간축만 제공한다. 각 claim은 실제 repository source, 공식 1차 문서, runtime observation으로 확장했으며 기존 배포 글은 깊이 baseline으로만 사용했다.

## 제외와 불확실성

무효화된 0.2.0 run의 manifest·request·파일 목록·outline은 범위와 slug, 이전 gate의 한계를 확인하려고 읽었다. 기존 draft와 Evidence 내용은 새 글의 근거로 재사용하지 않았고, 새 outline과 Evidence ID는 0.3.1 source dossier에서 다시 만들었다. 현재 source와 과거 시점이 다른 경우에는 글에서 시점을 명시하고 현재 정본을 우선한다.
