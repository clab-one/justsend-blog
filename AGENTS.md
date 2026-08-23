# justsend-blog 실행 정책

## 언어

사용자 보고, 문서, README, 오류 설명은 한국어로 작성한다. 코드 식별자, 파일명, schema field는 영어를 사용한다.

## Orchestration

- OMP Main Orchestrator가 MCP 호출, Evidence 선별, 구조 설계, 작성, 다이어그램, 윤문, audit, Git 작업을 직접 수행한다.
- `task` 도구를 사용해야 할 때 허용되는 유일한 `agent` 값은 명시적 `scout`다. 값을 생략하지 않는다.
- Scout는 읽기 전용 위치·관계 조사만 수행한다. 파일 수정, Git mutation, 설치, build/test, 설계·작성·다이어그램, 다른 agent 호출을 금지한다.
- Main → Scout 한 계층만 허용한다.
- reviewer, task, planner, builder, designer, librarian, advisor, sonic, explorer, writer 및 기본 agent dispatch를 금지한다.

## Evidence

- JustSend record에서 직접 글을 쓰지 않는다. 먼저 `evidence.yml`을 확정한다.
- 핵심 사실 문장과 diagram node/edge는 Evidence ID를 가진다.
- `uncertain`은 단정하지 않는다. inference는 evidence와 분리한다.
- secret과 공개 목적에 불필요한 개인정보는 Evidence 생성 전에 redaction한다.

## Files and Git

- Markdown과 Git이 SSOT다.
- run은 별도 worktree와 `justsend-blog/<date>/<slug>` branch에서 수행한다.
- 원 workspace를 stash, reset, clean, restore, 전체 stage하지 않는다.
- run path만 명시적으로 stage한다.
- audit PASS도 `READY_FOR_REVIEW`다. 사용자 승인 전 merge, publish, JustSend write-back을 금지한다.

## Pipeline order

`REQUESTED → RESEARCHING → EVIDENCE_READY → OUTLINED → DRAFTED → VISUAL_PLANNED → VISUAL_RENDERED → HUMANIZED → AUDITED → READY_FOR_REVIEW → ACCEPTED | REJECTED`

단계를 건너뛰거나 audit 결과를 수동 PASS 처리하지 않는다.
