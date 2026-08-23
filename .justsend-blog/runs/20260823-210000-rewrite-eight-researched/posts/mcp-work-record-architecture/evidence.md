# Evidence — JustSend MCP 재설계: 비동기 집행 앞에서 노트를 잃지 않는 앵커 계약

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E001 | failure | corroborated | 기록 생성을 비동기 집행기에 맡긴 상태에서 즉시 후속 노트를 받자 앵커가 없어 67건이 큐에도 들어가지 못하고 유실됐다. | RS-001, RS-002 |
| JS-E002 | decision | corroborated | work_start가 집행 전에 item_id를 발급하고 호출자에게 즉시 반환하도록 계약을 바꿨다. | RS-002, RS-004 |
| JS-E003 | fact | corroborated | openWork는 provisional anchor와 anchor intent를 같은 SQLite 트랜잭션에 저장해 앵커만 남는 중간 상태를 막는다. | RS-002, RS-003 |
| JS-E004 | fact | corroborated | 계정 복원 전 owner mismatch는 잘못된 입력이 아니라 일시 상태로 분류해 의도를 보존하고 재시도한다. | RS-001, RS-003 |
| JS-E005 | fact | corroborated | MCP tools 계약은 tools/list의 inputSchema와 tools/call 호출로 노출되며 구현은 ToolSpec에서 access와 parameter를 검증한다. | RS-002, RS-004 |
| JS-E006 | result | direct | 로그인 전에 받은 노트가 큐에 남고 계정 복원 뒤 같은 앵커에 붙는 경로를 실제 작업 기록으로 확인했다. | RS-005 |
| JS-E007 | measurement | direct | 기존 배포 글은 Markdown 원문 1320자로, 같은 한국어 corpus 중앙값 8203자의 60% 기준에 크게 못 미쳤다. | RS-006 |
