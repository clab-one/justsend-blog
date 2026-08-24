# English Evidence — Two Trust Boundaries between a Public DMG and MCP Writes

| ID | type | confidence | statement |
|---|---|---|---|
| JS-E101 | decision | corroborated | 감사는 공격자가 DMG와 MCP protocol을 모두 분석할 수 있다는 공개 구현 threat model에서 시작했다. |
| JS-E102 | failure | corroborated | 인가 없는 intent row는 앱의 정상 delete path를 통해 사용자 기록을 실제로 변경할 수 있었다. |
| JS-E103 | fact | direct | executor는 staging root 밖 path와 외부 symlink를 읽거나 삭제하지 않고 item 생성도 거절한다. |
| JS-E104 | decision | direct | content URL은 host policy를 지나며 가능한 IP 해석 중 하나라도 private·loopback이면 차단된다. |
| JS-E105 | failure | direct | 0177.0.0.1은 Network와 inet_aton의 해석이 달라 한 parser만 믿으면 loopback 우회가 생긴다. |
| JS-E106 | result | direct | 두 policy test가 통과한 build를 새 DMG로 만들고 동일 threat model로 재감사했다. |
| JS-E107 | measurement | direct | 기존 공개 글은 Markdown 6115자로, 새 run은 같은 source를 다시 조사하되 기존 final과 Evidence artifact를 복사하지 않는다. |
| JS-E108 | fact | direct | justsend-blog 0.4.4 routes state-machine and flowchart branches through distinct attach points and rejects edge paths that cross non-endpoint or endpoint node interiors. |
