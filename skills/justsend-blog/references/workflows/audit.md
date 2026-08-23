---
name: justsend-audit
description: Evidence Pack, technical draft, humanized prose, visual plan과 diagram을 대조해 unsupported claim·변경된 token·provenance 누락을 차단하는 Fidelity Audit.
---

# JustSend Audit

`skill://justsend-blog/references/contracts/fidelity-contract.md`와 `schemas/audit-report.schema.json`을 적용한다.

1. deterministic 검사로 numbers, dates, URLs, record IDs, Evidence IDs, proper nouns, code blocks, inline code, paths, API names, quoted strings를 비교한다.
2. final의 사실 claim을 추출해 adjacent evidence comment 또는 outline section Evidence ID에 연결한다.
3. `uncertain`만 연결된 단정, 존재하지 않는 ID, source 없는 수치와 인과를 unsupported로 분류한다.
4. visual plan의 node/edge와 rendered diagram ledger를 대조한다. Evidence 없는 node/edge, 방향·actor·label 불일치를 기록한다.
5. humanization route, change rate, protected-token diff, meaning preservation을 기록한다.
6. 다음 중 하나라도 있으면 PASS 금지: unsupported claim/node/edge, changed number/date, missing provenance, `meaning_preserved=false`, change rate ≥ 0.50.
7. 고칠 수 있으면 Main이 직접 claim을 삭제·불확실성 표시하거나 provenance를 고친 뒤 전체 audit를 다시 실행한다.

`audit.json` result가 `PASS`일 때만 `final.md`와 `READY_FOR_REVIEW` 상태를 만든다. audit를 우회하거나 수동으로 result만 바꾸지 않는다.
