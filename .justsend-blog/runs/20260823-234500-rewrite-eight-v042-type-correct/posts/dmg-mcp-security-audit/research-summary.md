# Research Summary — 공개 DMG와 MCP를 안전하게 잇는 두 신뢰 경계

- fresh run: `20260823-234500-rewrite-eight-v042-type-correct`
- selected sources: 6
- providers: corpus, justsend, official-docs, repository, runtime
- previous final/Evidence/visual copied: no

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:EFE6757E-D426-4EB2-BAAE-6C8BB08928FF` | threat-model-v42, runtime-security-v42 |
| RS-002 | repository | `mac-prod/MacTests/AgentIntentTrustTests.swift:150-220` | intent-gate-v42, staged-path-v42 |
| RS-003 | repository | `git:mac-prod:11b36db:patches/0066-contentfetchhostpolicy.patch` | host-gate-v42, parser-divergence-v42 |
| RS-004 | official-docs | `https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices` | threat-model-v42, intent-gate-v42 |
| RS-005 | runtime | `justsend:EFE6757E-D426-4EB2-BAAE-6C8BB08928FF#reaudit` | runtime-security-v42, host-gate-v42 |
| RS-006 | corpus | `web/content/blog/dmg-mcp-security-audit/ko.md` | corpus-depth-v42 |

## 결론

JustSend record는 사건 seed로만 사용했다. implementation은 current repository, 외부 계약은 official source, 결과는 runtime observation에 다시 연결했다. 기존 공개 글은 reader depth와 중복 범위를 확인하는 corpus일 뿐 claim source로 확대하지 않았다.
