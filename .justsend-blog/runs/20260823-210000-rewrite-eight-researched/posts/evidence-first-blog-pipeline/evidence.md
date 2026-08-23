# Evidence — 작업 기록을 기술 글로 바꾸기 전에 Research Pack을 강제한 이유

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E001 | failure | corroborated | 작업 기록만 요약하면 사건의 시간축은 남아도 실제 source·공식 계약·runtime 검증이 빠져 글이 얕아진다. | RS-001, RS-002, RS-006 |
| JS-E002 | decision | corroborated | Evidence보다 먼저 research-pack.yml을 만들고 JustSend seed를 repository·official·runtime source로 확장하도록 파이프라인을 바꿨다. | RS-001, RS-002, RS-005 |
| JS-E003 | fact | direct | selected research source는 locator, 20자 이상 excerpt, claim_keys, kind/provider 일치를 통과해야 한다. | RS-002 |
| JS-E004 | fact | direct | quality audit는 글이 실제 사용한 Evidence의 source만 세고 Evidence claim key가 research claim key에 연결되지 않으면 차단한다. | RS-003 |
| JS-E005 | decision | direct | production 기본값은 source 5개, kind 3개, repository 2개, official 1개, runtime 1개, claim key 5개다. | RS-003 |
| JS-E006 | fact | corroborated | Git worktree로 새 branch와 working tree를 분리해 원 작업공간의 미완성 변경과 publish candidate를 섞지 않는다. | RS-001, RS-004 |
| JS-E007 | result | direct | research-only 실패와 enriched dossier 성공을 포함한 unit·integration·E2E 및 package validation이 통과했다. | RS-005 |
| JS-E008 | measurement | direct | 기존 배포 글은 Markdown 원문 1804자로, 같은 한국어 corpus 중앙값 8203자의 60% 기준에 크게 못 미쳤다. | RS-006 |
