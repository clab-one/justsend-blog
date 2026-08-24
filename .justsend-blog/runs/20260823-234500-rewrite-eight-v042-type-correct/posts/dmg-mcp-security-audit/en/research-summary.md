# English Localization Research — Two Trust Boundaries between a Public DMG and MCP Writes

- parent fresh run: `20260823-234500-rewrite-eight-v042-type-correct`
- target language: `en`
- sources: 7
- providers: corpus, justsend, official-docs, repository, runtime
- previous English article: none

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:EFE6757E-D426-4EB2-BAAE-6C8BB08928FF` | threat-model-v42, runtime-security-v42 |
| RS-002 | repository | `mac-prod/MacTests/AgentIntentTrustTests.swift:150-220` | intent-gate-v42, staged-path-v42 |
| RS-003 | repository | `git:mac-prod:11b36db:patches/0066-contentfetchhostpolicy.patch` | host-gate-v42, parser-divergence-v42 |
| RS-004 | official-docs | `https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices` | threat-model-v42, intent-gate-v42 |
| RS-005 | runtime | `justsend:EFE6757E-D426-4EB2-BAAE-6C8BB08928FF#reaudit` | runtime-security-v42, host-gate-v42 |
| RS-006 | corpus | `web/content/blog/dmg-mcp-security-audit/ko.md` | corpus-depth-v42 |
| RS-007 | repository | `justsend-blog/src/pipeline/visual-contract.js@dc557f3:173-560` | edge-routing-v44, endpoint-geometry-v44 |
