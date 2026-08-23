# Research Summary — 권한 심사 대응을 상태 머신으로 다시 읽기: 설명·동의·복구의 소유권

- fresh run: `20260823-234500-rewrite-eight-v042-type-correct`
- selected sources: 6
- providers: corpus, justsend, official-docs, repository, runtime
- previous final/Evidence/visual copied: no

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:A552BAB0-E7AF-4F89-98AD-384A5DF5E104` | review-cause-v42, permission-inventory-v42 |
| RS-002 | repository | `mac-prod/.port/new/app/JustSend/Sources/Setup/SetupScreen.swift:1-22,196-218` | request-timing-v42, setup-scope-v42 |
| RS-003 | repository | `mac-prod/.port/new/app/JustSend/Sources/Setup/SetupPermission.swift:1-50` | permission-states-v42, settings-recovery-v42 |
| RS-004 | official-docs | `https://developer.apple.com/documentation/uikit/protecting-the-user-s-privacy` | request-timing-v42, settings-recovery-v42 |
| RS-005 | runtime | `justsend:A552BAB0-E7AF-4F89-98AD-384A5DF5E104#runtime` | runtime-flow-v42, setup-scope-v42 |
| RS-006 | corpus | `web/content/blog/appstore-permission-preprompt/ko.md` | corpus-depth-v42 |

## 결론

JustSend record는 사건 seed로만 사용했다. implementation은 current repository, 외부 계약은 official source, 결과는 runtime observation에 다시 연결했다. 기존 공개 글은 reader depth와 중복 범위를 확인하는 corpus일 뿐 claim source로 확대하지 않았다.
