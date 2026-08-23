# Research Summary — image_path 한 줄이 목록과 상세 이미지가 되기까지

- fresh run: `20260823-234500-rewrite-eight-v042-type-correct`
- selected sources: 6
- providers: corpus, justsend, official-docs, repository, runtime
- previous final/Evidence/visual copied: no

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:EB3D1968-9E6A-4379-AEE1-9328B20F8DFB` | image-input-v42, duplicate-render-v42 |
| RS-002 | repository | `mac-prod/Sources/AgentBridge/MCPToolDispatch.swift:995-1056` | staging-transform-v42, duplicate-render-v42 |
| RS-003 | repository | `mac-prod/.port/new/app/JustSend/Sources/Home/HomeViewModel.swift:480-500` | attachment-store-v42, surface-sink-v42 |
| RS-004 | official-docs | `https://modelcontextprotocol.io/specification/2025-06-18/server/tools` | image-input-v42, staging-transform-v42 |
| RS-005 | runtime | `justsend:EB3D1968-9E6A-4379-AEE1-9328B20F8DFB#installed-app` | surface-sink-v42, runtime-image-v42 |
| RS-006 | corpus | `web/content/blog/agent-work-record-hero-image/ko.md` | corpus-depth-v42 |

## 결론

JustSend record는 사건 seed로만 사용했다. implementation은 current repository, 외부 계약은 official source, 결과는 runtime observation에 다시 연결했다. 기존 공개 글은 reader depth와 중복 범위를 확인하는 corpus일 뿐 claim source로 확대하지 않았다.
