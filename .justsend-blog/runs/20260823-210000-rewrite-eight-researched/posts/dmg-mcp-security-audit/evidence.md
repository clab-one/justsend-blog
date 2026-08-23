# Evidence — DMG와 MCP 플러그인 보안 감사: 바이너리가 전부 공개돼도 안전한 경계 만들기

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E001 | decision | corroborated | 공격자가 DMG와 MCP 플러그인의 코드·리소스·프로토콜을 모두 읽을 수 있다는 공개 구현 위협 모델을 감사 기준으로 삼았다. | RS-001, RS-004 |
| JS-E002 | failure | corroborated | 인가되지 않은 사이드카 의도는 사용자가 만든 기록 삭제 같은 실제 앱 쓰기로 이어질 수 있었다. | RS-001, RS-002, RS-004 |
| JS-E003 | fact | direct | AgentIntentTrustTests는 staging root 밖 파일과 외부를 가리키는 symlink가 읽히거나 삭제되지 않고 기록도 만들지 못하는지 검사한다. | RS-002 |
| JS-E004 | decision | direct | ContentFetchHostPolicy를 링크 HTML·대표 이미지·favicon·JS 렌더·Markdown 이미지 앞에 두어 내용이 정한 사설·루프백 주소를 차단했다. | RS-003 |
| JS-E005 | failure | direct | 0177.0.0.1은 Network와 inet_aton이 다르게 해석하므로 한 parser 결과만 믿으면 loopback 우회가 생긴다. | RS-003 |
| JS-E006 | result | direct | 수정 전 실패를 잡은 보안 테스트가 통과한 뒤 코드를 담은 DMG를 다시 공증하고 같은 위협 모델로 재감사했다. | RS-005 |
| JS-E007 | measurement | direct | 기존 배포 글은 Markdown 원문 1423자로, 같은 한국어 corpus 중앙값 8203자의 60% 기준에 크게 못 미쳤다. | RS-006 |
