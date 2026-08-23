# SoloMD 설계 추적성

고정 원천: `zhitongblog/solomd@65027dac77866d45c15f56de8999bbf6fc617e22`.

| SoloMD 개념 | SoloMD 원본 파일 | 채택 상태 | justsend-blog 대상 파일 | 변경 이유 |
| --- | --- | --- | --- | --- |
| Plain Markdown vault | `app/src-tauri/src/workspace_index.rs:1-11,399-486`; `mcp-server/src/workspace.rs:1-31,50-191` | Adopted | `vault/`; `.justsend-blog/runs/*/*.md`; `src/pipeline/run-context.js` | Markdown을 사람이 직접 읽고 Git으로 검토 가능한 SSOT로 유지한다. 앱 인덱스/cache는 필요하지 않다. |
| Frontmatter metadata | `app/src-tauri/src/commands.rs:569-718,757-944`; `mcp-server/src/workspace.rs:233-252` | Adapted | `templates/*.md`; `src/pipeline/authoring.js` | run template에 최소 YAML frontmatter를 쓰되 Tauri 편집 UI와 범용 YAML mutation은 이식하지 않는다. |
| MCP workspace 접근 | `mcp-server/src/main.rs:75-230`; `mcp-server/src/tools.rs:30-122,379-458` | Adapted | `src/mcp/capability-discovery.js`; `src/mcp/justsend-adapter.js`; `.omp/mcp.json.example` | MCP server를 번들하지 않고 OMP가 연결한 JustSend tool description을 실행 시 매핑한다. |
| Agent run 저장 | `app/src-tauri/src/agent_run.rs:1-24,190-389` | Adopted | `src/pipeline/run-context.js`; `src/tracing/trace-writer.js`; `.justsend-blog/runs/` | run별 manifest·Markdown·JSONL을 독립 디렉터리에 남긴다. |
| Recipe | `app/src-tauri/src/recipes.rs:1-24,410-525` | Adapted | `skills/justsend-blog/SKILL.md`; `schemas/run-manifest.schema.json`; `policies/*.yml` | OMP Skill이 선언형 recipe 역할을 맡는다. 별도 scheduler·watcher는 범위 밖이다. |
| AutoGit | `app/src-tauri/src/git_history.rs:1-24,260-318,332-480` | Adapted | `src/pipeline/run-context.js`; `scripts/run-pipeline.js` | 전체 vault 자동 stage 대신 run 관련 경로만 명시적으로 stage·commit한다. |
| 실행 branch sandbox | `app/src-tauri/src/recipe_runner.rs:638-757,768-900,930-946` | Adapted | `src/pipeline/run-context.js` | SoloMD는 같은 working tree에서 branch를 전환한다. 이 팩은 WIP 혼입 위험을 없애기 위해 별도 Git worktree를 사용한다. |
| Dirty workspace 보호 | `app/src-tauri/src/recipe_runner.rs:638-757`; `tests/recipes_e2e_test.rs:307-359` | Adopted | `src/pipeline/run-context.js`; `tests/integration/pipeline.test.js` | 원 workspace를 stage·stash·reset하지 않고 worktree를 HEAD에서 만든다. |
| Accept/Reject | `app/src-tauri/src/recipe_runner.rs:301-482`; `app/src/stores/recipes.ts:206-227` | Adapted | `src/pipeline/run-context.js`; `policies/publishing-policy.yml`; `skills/justsend-blog/SKILL.md` | 자동 fast-forward/delete 대신 `READY_FOR_REVIEW` 후보와 명시적 accept/reject 명령 계약만 제공한다. 승인 전 merge·publish 없음. |
| Diff 표시 | `app/src-tauri/src/recipe_runner.rs:301-366`; `app/src-tauri/src/git_history.rs:589-696` | Adopted | `src/pipeline/run-context.js`; `scripts/run-pipeline.js` | run branch와 base commit 간 unified diff를 검토 자료로 보존한다. |
| Typed `trace.jsonl` | `app/src-tauri/src/trace.rs:1-36,41-207,214-393` | Adopted | `src/tracing/trace-writer.js`; `.justsend-blog/runs/<run-id>/trace.jsonl` | 순번·시각·event·redacted details를 JSONL로 append한다. result 크기와 secret을 제한한다. |
| Replay | `app/src-tauri/src/trace.rs:431-510` | Adapted | `src/tracing/trace-writer.js` | `seq < N` prefix를 읽어 과거 단계와 입력 artifact를 재참조한다. 모델 호출 재실행은 하지 않는다. |
| Path traversal 방어 | `mcp-server/src/safety.rs:1-83`; `app/src-tauri/src/agent_tools.rs:278-393` | Adopted | `src/pipeline/run-context.js`; `tests/unit/path-safety.test.js` | `..`, 절대경로 탈출, symlink 탈출을 canonical containment로 거부한다. |
| Write cap | `app/src-tauri/src/recipes.rs:33-65,410-525`; `app/src-tauri/src/agent_tools.rs:68-124,1108-1147` | Adopted | `src/pipeline/run-context.js`; `policies/publishing-policy.yml` | 기본 50 파일 hard cap을 side effect 전에 청구한다. |
| Local-first | `app/src-tauri/src/workspace_index.rs:1-11`; `app/src-tauri/src/git_history.rs:1-7`; `app/src/stores/workspace.ts:1-31` | Adopted | 전체 저장소 | GUI·데몬·DB·서버를 추가하지 않고 로컬 Markdown과 Git만 지속 상태로 사용한다. |
| SoloMD Tauri/Vue 앱 | `app/src-tauri/src/lib.rs`; `app/src/stores/recipes.ts` | Rejected | 없음 | OMP가 orchestration·UI를 제공하므로 앱 런타임 중복과 서버 의존을 만들지 않는다. |
| SoloMD HTTP MCP transport | `mcp-server/src/main.rs:250-295` | Rejected | 없음 | JustSend MCP transport는 OMP 설정의 책임이며 이 플러그인이 endpoint를 열지 않는다. |

## 핵심 차이

SoloMD 원본 branch sandbox는 현재 working tree를 일시 전환하고 dirty workspace면 실행을 거부한다. `justsend-blog`는 clean/dirty 여부와 무관하게 원 workspace를 보존하도록 HEAD에서 nested ignored worktree를 만든다. 이는 SoloMD의 격리 의도를 유지하면서 데이터 손실 위험을 줄이는 강화된 Adaptation이다.
