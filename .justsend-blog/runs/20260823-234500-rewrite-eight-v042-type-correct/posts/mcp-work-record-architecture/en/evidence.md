# English Evidence — A Provisional–Live–Dead Contract for Asynchronous MCP Work Records

| ID | type | confidence | statement |
|---|---|---|---|
| JS-E101 | failure | direct | start 성공과 anchor materialization 사이에 도착한 note 67건은 destination ID가 없어 queue 진입 전에 유실됐다. |
| JS-E102 | decision | corroborated | helper가 executor보다 먼저 item ID를 발급하고 queued 상태에서도 후속 note가 같은 destination을 쓰게 했다. |
| JS-E103 | fact | corroborated | provisional anchor와 시작 intent는 openWork 한 transaction에서 함께 생성된다. |
| JS-E104 | fact | corroborated | account 복원 전 owner mismatch는 permanent error가 아니라 retry 가능한 상태로 분류한다. |
| JS-E105 | fact | direct | MCP tools의 schema와 result는 identifier와 state를 client에 전달하는 protocol contract다. |
| JS-E106 | result | direct | 로그인 전 note가 queue에 남고 복원 뒤 live anchor에 붙는 흐름을 실제 기록으로 확인했다. |
| JS-E107 | measurement | direct | 기존 공개 글은 Markdown 5943자로, 새 run은 같은 source를 다시 조사하되 기존 final과 Evidence artifact를 복사하지 않는다. |
| JS-E108 | fact | direct | justsend-blog 0.4.4 routes state-machine and flowchart branches through distinct attach points and rejects edge paths that cross non-endpoint or endpoint node interiors. |
