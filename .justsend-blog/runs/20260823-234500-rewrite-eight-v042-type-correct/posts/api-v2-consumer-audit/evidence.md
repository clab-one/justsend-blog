# Evidence — 미사용 API를 삭제하지 않고 유지·보류·재확인으로 분류한 이유

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E101 | measurement | corroborated | 실행 router에서 method와 path 조합 88개를 inventory로 만들었다. | RS-001, RS-003, RS-004 |
| JS-E102 | measurement | corroborated | source consumer와 traffic을 대조해 66개 사용 근거와 22개 관측 미사용을 구분했다. | RS-001, RS-005 |
| JS-E103 | failure | corroborated | 관측 미사용을 dead API로 읽어 삭제 6건을 권고한 초기 분류는 기존 처분표를 놓쳤다. | RS-001, RS-002, RS-005 |
| JS-E104 | fact | direct | 기존 처분은 server-first route를 보류하고 profile·avatar를 유지하도록 이미 구분했다. | RS-002 |
| JS-E105 | decision | corroborated | 최종 outcome은 유지 11, 보류 8, 재확인 3이며 삭제 권고는 0건이다. | RS-001, RS-002, RS-005 |
| JS-E106 | fact | corroborated | 같은 path라도 HTTP method가 다르면 별도 contract로 센다. | RS-003, RS-004 |
| JS-E107 | measurement | direct | 기존 공개 글은 Markdown 5956자로, 새 run은 같은 source를 다시 조사하되 기존 final과 Evidence artifact를 복사하지 않는다. | RS-006 |
