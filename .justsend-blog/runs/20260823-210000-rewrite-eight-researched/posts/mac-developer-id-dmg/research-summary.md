# Research Summary — Mac App Store 대신 Developer ID를 택한 뒤 앱 DMG와 MCP helper를 분리한 이유

- selected source: 6
- providers: corpus, justsend, official-docs, repository, runtime
- production gate: repository 2 · official primary 1 · runtime 1 · corpus 1 · JustSend seed 1

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:8CB91A4B-A9FD-46BE-9EA5-AF4BD9126E50` | channel-conflict, oauth-boundary, runtime-artifact |
| RS-002 | repository | `mac-prod/PLAN-DIRECT-DISTRIBUTION.md:1-300` | helper-separation, oauth-boundary, channel-conflict |
| RS-003 | repository | `mac-prod/scripts/package-dmg.sh:1-180` | package-pipeline, notarization-contract |
| RS-004 | official-docs | `https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution` | notarization-contract, package-pipeline |
| RS-005 | runtime | `justsend:8CB91A4B-A9FD-46BE-9EA5-AF4BD9126E50#notes:dmg-result` | runtime-artifact, helper-separation |
| RS-006 | corpus | `web/content/blog/mac-developer-id-dmg/ko.md:1-` | corpus-depth, seed-not-source |

## 조사 결론

JustSend 기록은 사건과 실패의 시간축만 제공한다. 각 claim은 실제 repository source, 공식 1차 문서, runtime observation으로 확장했으며 기존 배포 글은 깊이 baseline으로만 사용했다.

## 제외와 불확실성

무효화된 0.2.0 run의 manifest·request·파일 목록·outline은 범위와 slug, 이전 gate의 한계를 확인하려고 읽었다. 기존 draft와 Evidence 내용은 새 글의 근거로 재사용하지 않았고, 새 outline과 Evidence ID는 0.3.1 source dossier에서 다시 만들었다. 현재 source와 과거 시점이 다른 경우에는 글에서 시점을 명시하고 현재 정본을 우선한다.
