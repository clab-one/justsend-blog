# English Evidence — Where Direct Distribution Actually Runs: App DMG and Helper ZIP

| ID | type | confidence | statement |
|---|---|---|---|
| JS-E101 | reason | direct | App Store/TestFlight 자격과 helper 실행 자격의 충돌이 직접 배포 전환의 출발점이었다. |
| JS-E102 | decision | corroborated | App은 공증 DMG, helper는 별도 공증 ZIP으로 release zone을 나눠 배포한다. |
| JS-E103 | decision | direct | Developer ID에서 native Apple login entitlement를 쓸 수 없어 Services ID web OAuth로 credential 획득 경로를 바꿨다. |
| JS-E104 | fact | corroborated | package script는 app과 DMG의 notarization·staple·identity·checksum을 실패 시 중단하는 순서로 실행한다. |
| JS-E105 | fact | direct | Apple notarization ticket은 Gatekeeper가 first launch에서 artifact를 확인하는 근거다. |
| JS-E106 | result | direct | 사용자 Mac에서 DMG 설치·app launch와 별도 helper initialize를 각각 확인했다. |
| JS-E107 | measurement | direct | 기존 공개 글은 Markdown 5931자로, 새 run은 같은 source를 다시 조사하되 기존 final과 Evidence artifact를 복사하지 않는다. |
| JS-E108 | fact | direct | justsend-blog 0.4.4 routes state-machine and flowchart branches through distinct attach points and rejects edge paths that cross non-endpoint or endpoint node interiors. |
