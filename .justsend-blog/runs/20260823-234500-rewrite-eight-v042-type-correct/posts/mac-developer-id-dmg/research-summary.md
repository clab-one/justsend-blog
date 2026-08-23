# Research Summary — Developer ID 직접 배포의 실제 위치: App DMG와 helper ZIP을 분리한 구조

- fresh run: `20260823-234500-rewrite-eight-v042-type-correct`
- selected sources: 6
- providers: corpus, justsend, official-docs, repository, runtime
- previous final/Evidence/visual copied: no

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:8CB91A4B-A9FD-46BE-9EA5-AF4BD9126E50` | channel-conflict-v42, runtime-dmg-v42 |
| RS-002 | repository | `mac-prod/PLAN-DIRECT-DISTRIBUTION.md:1-80,180-270` | separate-artifacts-v42, deployment-zones-v42, oauth-boundary-v42 |
| RS-003 | repository | `mac-prod/scripts/package-dmg.sh:1-180` | package-pipeline-v42, notarization-v42 |
| RS-004 | official-docs | `https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution` | notarization-v42, deployment-zones-v42 |
| RS-005 | runtime | `justsend:8CB91A4B-A9FD-46BE-9EA5-AF4BD9126E50#dmg-runtime` | runtime-dmg-v42, separate-artifacts-v42 |
| RS-006 | corpus | `web/content/blog/mac-developer-id-dmg/ko.md` | corpus-depth-v42 |

## 결론

JustSend record는 사건 seed로만 사용했다. implementation은 current repository, 외부 계약은 official source, 결과는 runtime observation에 다시 연결했다. 기존 공개 글은 reader depth와 중복 범위를 확인하는 corpus일 뿐 claim source로 확대하지 않았다.
