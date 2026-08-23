---
name: justsend-visual
description: 글보다 그림이 독자 이해 비용을 줄이는 구간만 골라 Evidence provenance가 있는 visual plan을 만들고 pinned diagram-design으로 HTML·SVG·PNG를 생성하는 절차.
---

# JustSend Visual

먼저 `references/visual-routing.md`를 읽는다.

1. 후보마다 “문단이나 표보다 그림이 더 빠르고 정확한가?”에 답한다. false면 이유를 남기고 diagram을 만들지 않는다.
2. true면 `diagram_id`, `section_id`, `purpose`, `type_hint`, `evidence_ids`, `nodes`, `edges`, `excluded`, `formats`를 작성한다.
3. 모든 핵심 node와 edge에 Evidence ID를 요구한다. ID가 없으면 삭제하거나 `excluded`에 적는다.
4. `.diagram-design` marker와 `.justsend-blog/profiles/justsend.md`를 확인한다.
5. `skill://diagram-design`과 선택한 type reference를 읽는다. `doc-inline`, `balanced`, `engineer`를 기본값으로 사용하되 요청이 명시하면 따른다.
6. HTML을 편집 가능한 정본으로 먼저 만든다. SVG는 HTML의 first SVG를 보존해 export하고 PNG는 호환본으로 만든다.
7. terminology와 방향, actor, 수치, security boundary를 본문 및 Evidence와 대조한다.

HTML/SVG/PNG 생성 실패를 숨기거나 빈 placeholder를 만들지 않는다. PNG external renderer가 없으면 `src/pipeline/visual.js`의 deterministic raster export를 사용하되 HTML/SVG 의미와 visual plan을 동일하게 유지한다.
