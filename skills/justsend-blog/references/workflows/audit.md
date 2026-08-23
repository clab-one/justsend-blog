---
name: justsend-audit
description: Evidence Pack, technical draft, humanized prose, visual plan과 diagram을 대조해 unsupported claim·변경된 token·provenance 누락을 차단하는 Fidelity Audit.
---

# JustSend Audit

`skill://justsend-blog/references/contracts/fidelity-contract.md`와 `schemas/audit-report.schema.json`을 적용한다.

1. deterministic 검사로 numbers, dates, URLs, record IDs, Evidence IDs, proper nouns, code blocks, inline code, paths, API names, quoted strings를 비교한다.
2. final의 사실 claim을 추출해 adjacent evidence comment 또는 outline section Evidence ID에 연결한다.
3. `uncertain`만 연결된 단정, 존재하지 않는 ID, source 없는 수치와 인과를 unsupported로 분류한다.
4. `quality-contract.json`과 final을 대조한다. characters, H2/H3, source artifact, code/log block, direct Evidence 수, Evidence coverage, corpus depth ratio, unused high-value Evidence를 계산한다.
5. `outline.json`과 visual plan을 대조한다. section 의미에서 visual 필요성을 추론하고 false로 낮춘 candidate, render되지 않은 candidate, candidate의 omit을 차단한다.
6. visual plan의 node/edge와 rendered diagram ledger를 대조한다. Evidence 없는 node/edge, 방향·actor·label 불일치를 기록한다.
7. humanization route, change rate, protected-token diff, meaning preservation을 기록한다.
8. 다음 중 하나라도 있으면 PASS 금지: unsupported claim/node/edge, changed number/date, missing provenance, quality blocker, corpus depth 미달, unused high-value Evidence, source artifact 부족, 필요한 diagram 누락·오분류·omit, `meaning_preserved=false`, change rate ≥ 0.50.
9. 고칠 수 있으면 Main이 source 조사·실패 이력·코드·검증·diagram을 보강하고 전체 audit를 다시 실행한다. 글자 수만 채우는 근거 없는 padding은 추가 blocker다.

`audit.json` result가 `PASS`일 때만 `final.md`와 `READY_FOR_REVIEW` 상태를 만든다. audit를 우회하거나 수동으로 result만 바꾸지 않는다.
