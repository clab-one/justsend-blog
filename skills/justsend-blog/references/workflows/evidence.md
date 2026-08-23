---
name: justsend-evidence
description: JustSend 조사 결과를 fact·decision·reason·result·failure·tradeoff·measurement·timeline-event·quote·open-question으로 분류하고 inference·conflict·unknown을 분리하는 Evidence Pack 계약.
---

# JustSend Evidence

`skill://justsend-blog/references/contracts/evidence-contract.md`와 `schemas/evidence-pack.schema.json`을 적용한다.

- 허용 evidence type: `fact`, `decision`, `reason`, `result`, `failure`, `tradeoff`, `measurement`, `timeline-event`, `quote`, `open-question`.
- 허용 confidence: `direct`, `corroborated`, `inferred`, `uncertain`.
- 원 기록에 명시된 내용만 `direct`다. 독립 source 두 개 이상이 같은 값을 지지하면 `corroborated`다.
- 해석은 `inferences`에 두고 `supported_by`를 요구한다. inference를 evidence로 승격하지 않는다.
- 충돌하는 값은 하나를 조용히 선택하지 않고 `conflicts`에 양쪽 Evidence ID와 차이를 기록한다.
- 확인하지 못한 필수 정보는 `unknowns`에 질문과 조사한 범위를 기록한다.
- 최종 핵심 claim은 최소 하나의 `direct` 또는 `corroborated` Evidence ID가 있어야 한다. `uncertain`만으로 단정하지 않는다.
- redaction 이후 statement만 저장한다. source에는 provider, 실제 record ID, attachment ID만 남긴다.

Pack 생성 후 `node scripts/validate-evidence.js <evidence.yml>`을 실행한다. 실패한 Pack으로 outline을 만들지 않는다.
