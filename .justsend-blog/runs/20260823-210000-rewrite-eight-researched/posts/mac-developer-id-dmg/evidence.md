# Evidence — Mac App Store 대신 Developer ID를 택한 뒤 앱 DMG와 MCP helper를 분리한 이유

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E001 | reason | corroborated | TestFlight/App Store 자격과 MCP helper 실행 자격을 동시에 만족시키지 못한 실측이 배포 채널 재검토를 촉발했다. | RS-001, RS-002 |
| JS-E002 | decision | corroborated | 현재 배포 계약은 앱을 공증 DMG로, helper를 번들 밖 universal ZIP으로 각각 배포하는 것이다. | RS-001, RS-002, RS-005 |
| JS-E003 | decision | corroborated | Developer ID에서 네이티브 Apple 로그인 entitlement를 쓸 수 없어 Services ID 기반 웹 OAuth를 기존 서버 인증 경로에 연결했다. | RS-001, RS-002 |
| JS-E004 | fact | direct | package-dmg.sh는 앱 공증과 스테이플, 신원 검증, DMG 생성·공증·스테이플, 체크섬 생성을 중간 실패 시 중단하는 순서로 고정한다. | RS-003 |
| JS-E005 | fact | direct | Apple notarization은 악성 요소와 코드 서명 문제를 자동 검사하고 성공 시 Gatekeeper가 확인할 ticket을 생성한다. | RS-004 |
| JS-E006 | result | direct | 실제 DMG의 Gatekeeper 판정·마운트·설치·앱 실행과 별도 helper의 initialize 응답을 확인했다. | RS-005 |
| JS-E007 | measurement | direct | 기존 배포 글은 Markdown 원문 1343자로, 같은 한국어 corpus 중앙값 8203자의 60% 기준에 크게 못 미쳤다. | RS-006 |
