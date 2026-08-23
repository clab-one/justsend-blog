---
name: justsend-writing
description: Evidence Pack과 독자 목표를 바탕으로 기술 블로그 문서 유형, reader-first 정보 구조, section provenance를 정하고 근거 있는 한국어 초안을 작성하는 절차.
---

# JustSend Writing

다음 reference를 읽는다: `skill://justsend-blog/references/writing/document-types.md`, `skill://justsend-blog/references/writing/information-architecture.md`, `skill://justsend-blog/references/writing/sentence-policy.md`. 정책 SSOT는 `policies/writing-policy.yml`이다.

1. audience가 글을 읽은 뒤 이해하거나 판단하거나 수행해야 할 일을 한 문장으로 쓴다.
2. `engineering-story`, `architecture-decision`, `explanation`, `incident-review`, `tutorial`, `how-to`, `reference`, `product-narrative`, `launch-post` 중 하나를 선택하고 이유를 manifest에 기록한다.
3. 가치와 핵심 변화가 먼저 보이도록 섹션을 배열한다. 문제를 설명한 뒤 해결과 trade-off를 쓴다.
4. `outline.md` 각 section에 `section_id`, `purpose`, `evidence_ids`, `visual_candidate`를 둔다.
5. 한 섹션은 하나의 메시지만 맡는다. 제목만 읽어도 문제→결정→구현→결과→제약 흐름을 예측할 수 있게 한다.
6. Evidence가 없는 성공 효과, 수치, 인과 관계를 추가하지 않는다. 유용하지만 미확인인 내용은 삭제하거나 질문·추론으로 표시한다.
7. 주체와 동사를 명확히 하고 같은 개념은 같은 용어로 쓴다. 장점과 함께 실패·제약·trade-off를 남긴다.
8. 각 핵심 사실 문단 끝에 `<!-- evidence: JS-E... -->` provenance를 둔다.

Technical review는 Main이 직접 수행한다. reviewer agent를 호출하지 않는다.
