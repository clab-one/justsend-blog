# ADR 0001: SoloMD 기반 작성 코어

- 상태: Accepted
- 날짜: 2026-08-23
- 결정자: OMP Main Orchestrator

## 맥락

작업 기록에서 기술 글을 만들면 원문 근거, 중간 판단, 수정 이력, 승인 경계를 나중에 재구성할 수 있어야 한다. 생성 결과만 저장하거나 별도 데이터베이스를 추가하면 사람이 확인할 수 있는 정본과 실행 상태가 갈라진다.

SoloMD는 plain Markdown workspace, 실행별 파일, AutoGit, recipe branch, dirty guard, diff, accept/reject, typed `trace.jsonl`, path containment, write cap을 실제 코드로 구현한다. 이 문제와 가장 가까운 검증된 작성 lifecycle 원천이다.

## 결정

SoloMD를 primary authoring architecture로 채택한다.

- Markdown을 글·request·research·evidence 설명·outline·draft·final의 SSOT로 둔다.
- 각 실행을 `.justsend-blog/runs/<run-id>/`에 materialize한다.
- Git을 버전 기록으로 사용하고 run path만 명시적으로 stage한다.
- 모든 run을 `justsend-blog/<date>/<slug>` branch의 별도 worktree에서 수행한다.
- ordered JSONL trace와 manifest를 남긴다.
- audit PASS는 publish가 아니라 `READY_FOR_REVIEW`다.
- accept/reject는 사용자 결정이며 자동 merge·외부 publish를 하지 않는다.

## 직접 재사용과 변형

### 직접 재사용

MIT 허용 범위에서 SoloMD 코드를 복사한 파일은 없다. 다음은 구현 원칙과 계약을 독립 JS로 다시 구현한다.

- run directory와 JSONL trace
- canonical path containment
- write cap의 side-effect 이전 검사
- diff와 review candidate

### OMP에 맞춘 변형

- SoloMD recipe YAML과 watcher 대신 OMP `SKILL.md`를 선언형 workflow로 사용한다.
- SoloMD 자체 MCP server 대신 OMP가 연결한 JustSend MCP를 capability-discovery로 사용한다.
- SoloMD의 in-place branch checkout 대신 별도 worktree를 사용한다.
- SoloMD GUI accept/reject 대신 branch, diff, audit artifact와 명시적 사용자 승인 절차를 제공한다.
- AutoGit의 전체 workspace snapshot 대신 run 관련 파일만 stage한다.

## SoloMD 전체 앱을 런타임 의존성으로 두지 않는 이유

OMP가 Skill discovery, MCP client, 도구 승인, 세션 UI를 이미 제공한다. SoloMD 전체 Tauri/Vue 앱을 포함하면 중복 UI, provider loop, watcher, cache, keychain, 선택적 HTTP transport가 따라온다. 블로그 팩에 필요하지 않은 상태와 공격 면적이다.

## Markdown과 Git을 SSOT로 두는 이유

- 텍스트 편집기와 Git만으로 모든 결과를 검사할 수 있다.
- binary DB migration 없이 과거 run을 재현할 수 있다.
- diff가 승인 단위와 일치한다.
- 사용자가 agent 결과를 거부해도 원 workspace를 손상하지 않는다.
- plugin 제거 후에도 글과 근거가 남는다.

## 결과

장점:

- local-first, reviewable, rejectable, auditable.
- 기존 dirty workspace를 건드리지 않는다.
- OMP 이외의 상시 런타임이 없다.

비용:

- 파일 수가 늘어난다.
- branch/worktree를 만들 수 있는 Git 저장소가 필요하다.
- 외부 publish는 별도 승인·통합 단계가 필요하다.

## Upstream 추적

`upstreams.lock.yml`에 SoloMD commit과 license를 고정한다. `scripts/update-upstreams.sh`는 fast-forward 가능 여부와 새 SHA만 제시하며 자동 반영하지 않는다. 업데이트할 때 다음 원본 경로를 다시 검토한다.

- `app/src-tauri/src/agent_run.rs`
- `app/src-tauri/src/trace.rs`
- `app/src-tauri/src/recipes.rs`
- `app/src-tauri/src/recipe_runner.rs`
- `app/src-tauri/src/git_history.rs`
- `mcp-server/src/safety.rs`

변경된 계약은 `SOLOMD_TRACEABILITY.md`, 관련 tests, 이 ADR의 후속 ADR에 반영한다.
