---
name: justsend-visual
description: 글보다 그림이 독자 이해 비용을 줄이는 구간만 골라 Evidence provenance가 있는 visual plan을 만들고 pinned diagram-design으로 HTML·SVG·PNG를 생성하는 절차.
---

# JustSend Visual

먼저 `skill://justsend-blog/references/visual/visual-routing.md`를 읽는다.

1. 모든 outline section을 `visual-routing.md`로 분류한다. architecture·sequence·data flow·state machine·deployment·trust boundary·dependency·process 신호가 있으면 `visual_candidate: true`다. 이를 false로 낮추면 audit가 `misclassified_visual_candidates`로 차단한다.
2. candidate마다 `visual-plan.yml.decisions`에 `section_id`, `decision`, `diagram_id`, `reason`을 기록한다. candidate의 `omit`은 publish blocker다. 첨부 부재는 no-diagram 사유가 아니다.
3. render decision이면 `diagram_id`, `section_id`, `covers_section_ids`, `purpose`, `type_hint`, `evidence_ids`, `nodes`, `edges`, `excluded`, `formats`를 작성한다. 하나의 그림이 여러 section을 설명하면 `covers_section_ids`에 모두 적는다.
4. 모든 핵심 node와 edge에 direct 또는 corroborated Evidence ID를 요구한다. ID가 없으면 source를 더 조사하거나 해당 관계를 삭제한다.
5. `.diagram-design` marker와 `.justsend-blog/profiles/justsend.md`를 확인한다.
6. `skill://justsend-blog/vendor/diagram-design/SKILL.md`와 `skill://justsend-blog/vendor/diagram-design/references/<selected-type>.md`를 읽고 vendor directory를 상대경로 기준으로 삼는다. `doc-inline`, `balanced`, `engineer`를 기본값으로 사용하되 요청이 명시하면 따른다.
7. HTML을 편집 가능한 정본으로 먼저 만든다. SVG는 HTML의 first SVG를 보존해 export하고 PNG는 호환본으로 만든다.
8. terminology와 방향, actor, 수치, security boundary를 본문 및 Evidence와 대조한다.
9. `visual_candidate: true` section이 모두 render decision과 실제 SVG로 덮였는지 확인한다. 누락·false 하향·omit은 audit FAIL이다.

HTML/SVG/PNG 생성 실패를 숨기거나 빈 placeholder를 만들지 않는다. PNG external renderer가 없으면 `src/pipeline/visual.js`의 deterministic raster export를 사용하되 HTML/SVG 의미와 visual plan을 동일하게 유지한다.
