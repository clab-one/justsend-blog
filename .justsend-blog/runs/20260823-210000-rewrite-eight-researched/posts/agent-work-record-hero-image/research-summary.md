# Research Summary — 에이전트 작업 기록에 대표 이미지를 붙이면서 데이터 계약부터 고친 과정

- selected source: 6
- providers: corpus, justsend, official-docs, repository, runtime
- production gate: repository 2 · official primary 1 · runtime 1 · corpus 1 · JustSend seed 1

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:EB3D1968-9E6A-4379-AEE1-9328B20F8DFB` | image-input, no-inline-duplicate, runtime-ui |
| RS-002 | repository | `mac-prod/Sources/AgentBridge/MCPToolDispatch.swift:891-1056` | image-input, atomic-staging, no-inline-duplicate |
| RS-003 | repository | `mac-prod/.port/new/app/JustSend/Sources/Home/HomeViewModel.swift:68-69,480-497` | thumb-source, authoring-boundary |
| RS-004 | official-docs | `https://modelcontextprotocol.io/specification/2025-06-18/server/tools#listing-tools` | image-input, authoring-boundary |
| RS-005 | runtime | `justsend:EB3D1968-9E6A-4379-AEE1-9328B20F8DFB#notes:installed-app` | runtime-ui, thumb-source |
| RS-006 | corpus | `web/content/blog/agent-work-record-hero-image/ko.md:1-` | corpus-depth, seed-not-source |

## 조사 결론

JustSend 기록은 사건과 실패의 시간축만 제공한다. 각 claim은 실제 repository source, 공식 1차 문서, runtime observation으로 확장했으며 기존 배포 글은 깊이 baseline으로만 사용했다.

## 제외와 불확실성

무효화된 0.2.0 run의 manifest·request·파일 목록·outline은 범위와 slug, 이전 gate의 한계를 확인하려고 읽었다. 기존 draft와 Evidence 내용은 새 글의 근거로 재사용하지 않았고, 새 outline과 Evidence ID는 0.3.1 source dossier에서 다시 만들었다. 현재 source와 과거 시점이 다른 경우에는 글에서 시점을 명시하고 현재 정본을 우선한다.
