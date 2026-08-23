---
name: justsend-evidence
description: JustSend 조사 결과를 fact·decision·reason·result·failure·tradeoff·measurement·timeline-event·quote·open-question으로 분류하고 inference·conflict·unknown을 분리하는 Evidence Pack 계약.
---

# JustSend Evidence

`skill://justsend-blog/references/contracts/evidence-contract.md`와 `schemas/evidence-pack.schema.json`을 적용한다.

- 허용 evidence type: `fact`, `decision`, `reason`, `result`, `failure`, `tradeoff`, `measurement`, `timeline-event`, `quote`, `open-question`.
- 허용 confidence: `direct`, `corroborated`, `inferred`, `uncertain`.
- `research-pack.yml`의 selected excerpt에 명시된 내용만 `direct`다. JustSend record, repository source, official docs, runtime observation을 모두 사용할 수 있지만 locator와 claim key가 있어야 한다.
- Evidence item은 단일 `source`가 아니라 `sources[]`를 가진다. 각 source는 실제 `RS-...` ID, provider, source ID, locator를 보존한다.
- 독립 source 두 개 이상이 같은 값을 지지할 때만 `corroborated`다. 같은 JustSend record를 여러 Evidence ID로 나누거나 같은 문서를 두 locator로 적는 것은 독립 source가 아니다.
- 해석은 `inferences`에 두고 `supported_by`를 요구한다. inference를 evidence로 승격하지 않는다.
- 충돌하는 값은 하나를 조용히 선택하지 않고 `conflicts`에 양쪽 Evidence ID와 차이를 기록한다.
- 확인하지 못한 필수 정보는 `unknowns`에 질문과 조사한 범위를 기록한다.
- 최종 핵심 claim은 최소 하나의 `direct` 또는 `corroborated` Evidence ID가 있어야 한다. `uncertain`만으로 단정하지 않는다.
- redaction 이후 statement만 저장한다. `sources[]`에는 `research_source_id`, provider, 실제 source ID, path·line/symbol 또는 URL locator, attachment ID만 남긴다. excerpt 원문은 research pack에만 둔다.
- implementation claim은 repository source, 외부 API·표준 claim은 official-docs source, 결과 claim은 runtime source가 연결되지 않으면 production audit가 차단한다.

Pack 생성 후 `node scripts/validate-evidence.js <evidence.yml>`을 실행한다. 실패한 Pack으로 outline을 만들지 않는다.
