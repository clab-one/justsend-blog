# Evidence — Developer ID 직접 배포의 실제 위치: App DMG와 helper ZIP을 분리한 구조

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E101 | reason | direct | App Store/TestFlight 자격과 helper 실행 자격의 충돌이 직접 배포 전환의 출발점이었다. | RS-001 |
| JS-E102 | decision | corroborated | App은 공증 DMG, helper는 별도 공증 ZIP으로 release zone을 나눠 배포한다. | RS-001, RS-002 |
| JS-E103 | decision | direct | Developer ID에서 native Apple login entitlement를 쓸 수 없어 Services ID web OAuth로 credential 획득 경로를 바꿨다. | RS-002 |
| JS-E104 | fact | corroborated | package script는 app과 DMG의 notarization·staple·identity·checksum을 실패 시 중단하는 순서로 실행한다. | RS-003, RS-004 |
| JS-E105 | fact | direct | Apple notarization ticket은 Gatekeeper가 first launch에서 artifact를 확인하는 근거다. | RS-004 |
| JS-E106 | result | direct | 사용자 Mac에서 DMG 설치·app launch와 별도 helper initialize를 각각 확인했다. | RS-005 |
| JS-E107 | measurement | direct | 기존 공개 글은 Markdown 5931자로, 새 run은 같은 source를 다시 조사하되 기존 final과 Evidence artifact를 복사하지 않는다. | RS-006 |
