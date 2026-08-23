# Research Summary — JustSend seed를 Research Pack과 Evidence로 바꾸는 글쓰기 데이터 흐름

- fresh run: `20260823-234500-rewrite-eight-v042-type-correct`
- selected sources: 6
- providers: corpus, justsend, official-docs, repository, runtime
- previous final/Evidence/visual copied: no

| ID | provider | locator | claim keys |
|---|---|---|---|
| RS-001 | justsend | `justsend:248CB389-B6D1-401D-AAF8-8D8D6401C2AE` | seed-limit-v42, worktree-isolation-v42 |
| RS-002 | repository | `justsend-blog/src/pipeline/visual-contract.js:1-180` | visual-type-v42, type-audit-v42 |
| RS-003 | repository | `justsend-blog/src/pipeline/audit.js:82-130` | type-audit-v42, fidelity-gate-v42 |
| RS-004 | official-docs | `https://git-scm.com/docs/git-worktree` | worktree-isolation-v42, pipeline-flow-v42 |
| RS-005 | runtime | `justsend-blog@aea2d4a:npm-test` | visual-type-v42, runtime-pipeline-v42, fidelity-gate-v42 |
| RS-006 | corpus | `web/content/blog/evidence-first-blog-pipeline/ko.md` | corpus-depth-v42 |

## 결론

JustSend record는 사건 seed로만 사용했다. implementation은 current repository, 외부 계약은 official source, 결과는 runtime observation에 다시 연결했다. 기존 공개 글은 reader depth와 중복 범위를 확인하는 corpus일 뿐 claim source로 확대하지 않았다.
