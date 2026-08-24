---
name: justsend-visual
description: 글보다 그림이 독자 이해 비용을 줄이는 구간만 골라 Evidence provenance가 있는 visual plan을 만들고 pinned diagram-design으로 HTML·SVG·PNG를 생성하는 절차.
---

# JustSend Visual

먼저 `skill://justsend-blog/references/visual/visual-routing.md`를 읽는다.

1. 모든 outline section을 `visual-routing.md`로 분류한다. architecture·sequence·data flow·state machine·deployment·trust boundary·dependency·process 신호가 있으면 `visual_candidate: true`다. 이를 false로 낮추면 audit가 `misclassified_visual_candidates`로 차단한다.
2. candidate마다 본문·section purpose·연결 Evidence를 `selectDiagramType`과 같은 의미 규칙으로 평가한다. 독자가 찾아야 하는 **주된 축 하나**를 고른다. 여러 글이 같은 type을 선택해도 그것이 최적이면 정상이다. 종류를 다양하게 보이게 하려고 차선 type을 고르지 않는다.
3. candidate마다 `visual-plan.yml.decisions`에 `section_id`, `decision`, `diagram_id`, `reason`을 기록한다. candidate의 `omit`은 publish blocker다. 첨부 부재는 no-diagram 사유가 아니다.
4. render decision이면 `diagram_id`, `section_id`, `covers_section_ids`, `purpose`, `type`, `selection`, `renderer`, `evidence_ids`, `nodes`, `edges`, `excluded`, `formats`를 작성한다. `selection`은 `primary_axis`, 근거 신호, 선택 이유, 검토한 대안을 보존한다. node는 `role`, edge는 `kind`를 가진다.
5. `type`은 이름표가 아니다. state machine은 state·transition, deployment는 zone·artifact·runtime, flowchart는 decision·outcome, data flow는 source·transform/store·sink, process는 ordered stage, architecture는 component와 필요한 boundary를 실제 plan에 가져야 한다.
6. 모든 핵심 node와 edge에 direct 또는 corroborated Evidence ID를 요구한다. ID가 없으면 source를 더 조사하거나 해당 관계를 삭제한다.
7. `.diagram-design` marker와 `.justsend-blog/profiles/justsend.md`를 확인하고 선택한 type reference만 읽는다. `doc-inline`, `balanced`, `engineer`를 기본값으로 사용하되 요청이 명시하면 따른다.
8. production artifact는 등록된 `renderer.id`와 version을 사용한다. 임의 generator로 SVG를 만든 뒤 type attribute만 붙이지 않는다. root의 `data-diagram-type`, `data-primary-axis`, `data-renderer-id`, `data-renderer-version`과 node role·edge kind가 plan과 일치해야 한다.
9. HTML을 편집 가능한 정본으로 만들고 SVG·PNG를 같은 type layout에서 export한다. terminology와 방향, actor, 수치, boundary를 본문 및 Evidence와 대조한다.
10. `visual_candidate: true` section이 모두 render decision과 실제 SVG로 덮였는지 확인한다. 누락·false 하향·omit, 의미상 최적 type과 plan type 불일치, renderer metadata 불일치, type invariant 위반, 비종점 node를 통과하는 edge, branch edge의 공유 attach point는 audit FAIL이다.

HTML/SVG/PNG 생성 실패를 숨기거나 빈 placeholder를 만들지 않는다. PNG external renderer가 없으면 `src/pipeline/visual.js`의 deterministic raster export를 사용하되 HTML/SVG 의미와 visual plan을 동일하게 유지한다.
