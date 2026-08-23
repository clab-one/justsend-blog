# Research Summary — 비동기 MCP 기록에서 노트를 잃지 않는 provisional·live·dead 상태 계약

- fresh run: `20260823-234500-rewrite-eight-v042-type-correct`
- selected sources: 6
- providers: corpus, justsend, official-docs, repository, runtime
- previous final/Evidence/visual copied: no

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:60A796EF-047B-41E0-B1C3-52427D96BBEB` | note-loss-v42, owner-recovery-v42 |
| RS-002 | repository | `mac-prod/Sources/AgentBridge/MCPToolDispatch.swift:891-1072` | issued-id-v42, anchor-state-v42 |
| RS-003 | repository | `mac-prod/Sources/AgentBridge/AgentBridge.swift:895-940` | atomic-openwork-v42, retry-contract-v42 |
| RS-004 | official-docs | `https://modelcontextprotocol.io/specification/2025-06-18/server/tools` | tool-contract-v42, issued-id-v42 |
| RS-005 | runtime | `justsend:60A796EF-047B-41E0-B1C3-52427D96BBEB#self-record` | owner-recovery-v42, runtime-anchor-v42 |
| RS-006 | corpus | `web/content/blog/mcp-work-record-architecture/ko.md` | corpus-depth-v42 |

## 결론

JustSend record는 사건 seed로만 사용했다. implementation은 current repository, 외부 계약은 official source, 결과는 runtime observation에 다시 연결했다. 기존 공개 글은 reader depth와 중복 범위를 확인하는 corpus일 뿐 claim source로 확대하지 않았다.
