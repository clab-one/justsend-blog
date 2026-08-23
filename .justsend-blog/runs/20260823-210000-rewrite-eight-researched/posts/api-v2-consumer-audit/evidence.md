# Evidence — API v2 소비자 감사: 미사용 22개를 찾고도 삭제 권고를 0건으로 되돌린 이유

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E001 | measurement | corroborated | 실행 라우터에 등록된 method와 path 조합 88개를 inventory 정본으로 만들었다. | RS-001, RS-002, RS-003, RS-004 |
| JS-E002 | measurement | corroborated | 앱·웹·운영 도구 source와 실트래픽을 대조한 결과 66개는 사용 근거가 있고 22개는 관측 기간 미사용이었다. | RS-001, RS-005 |
| JS-E003 | failure | corroborated | 관측 미사용을 곧바로 고아로 해석해 6개 삭제 권고를 만든 초기 판정은 기존 처분표를 놓친 결과였다. | RS-001, RS-002, RS-005 |
| JS-E004 | fact | direct | 기존 처분표는 sync/state·state/docs·feed/catalog·공유 관리 경로를 선반영 보류로, profile·avatar를 유지로 이미 구분했다. | RS-002 |
| JS-E005 | decision | corroborated | 최종 분류를 유지 11, 보류 8, 재확인 3으로 고치고 삭제 권고를 0건으로 철회했다. | RS-001, RS-002, RS-005 |
| JS-E006 | fact | corroborated | HTTP 계약은 같은 path라도 method가 다르면 의미가 다르므로 route inventory는 method와 target URI를 함께 센다. | RS-003, RS-004 |
| JS-E007 | measurement | direct | 기존 배포 글은 Markdown 원문 1371자로, 같은 한국어 corpus 중앙값 8203자의 60% 기준에 크게 못 미쳤다. | RS-006 |
