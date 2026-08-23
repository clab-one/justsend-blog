# Research Summary — API v2 소비자 감사: 미사용 22개를 찾고도 삭제 권고를 0건으로 되돌린 이유

- selected source: 6
- providers: corpus, justsend, official-docs, repository, runtime
- production gate: repository 2 · official primary 1 · runtime 1 · corpus 1 · JustSend seed 1

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:FC53D2FB-2C39-4436-B61C-08FE9FF6A4EB` | route-inventory, used-unused, no-deletion |
| RS-002 | repository | `docs/platform/backend-surface-audit.md:1-160` | prior-disposition, classification, no-deletion |
| RS-003 | repository | `platform/backend/internal/api/{register.go,account.go,share.go,state.go}:register*` | route-inventory, http-contract |
| RS-004 | official-docs | `https://www.rfc-editor.org/rfc/rfc9110` | http-contract, route-inventory |
| RS-005 | runtime | `justsend:FC53D2FB-2C39-4436-B61C-08FE9FF6A4EB#notes:audit-result` | used-unused, classification, no-deletion |
| RS-006 | corpus | `web/content/blog/api-v2-consumer-audit/ko.md:1-` | corpus-depth, seed-not-source |

## 조사 결론

JustSend 기록은 사건과 실패의 시간축만 제공한다. 각 claim은 실제 repository source, 공식 1차 문서, runtime observation으로 확장했으며 기존 배포 글은 깊이 baseline으로만 사용했다.

## 제외와 불확실성

무효화된 0.2.0 run의 manifest·request·파일 목록·outline은 범위와 slug, 이전 gate의 한계를 확인하려고 읽었다. 기존 draft와 Evidence 내용은 새 글의 근거로 재사용하지 않았고, 새 outline과 Evidence ID는 0.3.1 source dossier에서 다시 만들었다. 현재 source와 과거 시점이 다른 경우에는 글에서 시점을 명시하고 현재 정본을 우선한다.
