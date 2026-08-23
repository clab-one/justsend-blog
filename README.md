# justsend-blog

Repository: <https://github.com/clab-one/justsend-blog>

JustSend 작업 기록을 Evidence Pack으로 정규화한 뒤 독자 중심 한국어 기술 글, 근거 기반 다이어그램, im-not-ai 지표·규칙을 적용한 Main 직접 윤문, Fidelity Audit과 Git diff를 거쳐 출판 후보 Markdown을 만드는 OMP 플러그인 팩이다.

## 핵심 보장

- OMP에 노출되는 사용자 진입점은 `/skill:justsend-blog` 하나다. Research·Evidence·Writing·Visual·Humanize·Audit은 Master 내부 references다.
- OMP Main Orchestrator가 연구, 작성, 시각화, 윤문, 검증을 직접 수행한다.
- 허용 subagent는 읽기 전용 `scout` 하나뿐이다.
- JustSend MCP는 실행 시 tool description으로 capability를 발견하며 기본 read-only다.
- JustSend record에서 바로 글을 쓰지 않고 `evidence.yml`을 먼저 확정한다.
- Markdown과 Git이 SSOT다. run은 별도 worktree와 branch에서 진행한다.
- diagram node·edge와 최종 핵심 claim은 Evidence ID를 가진다.
- 실제 OMP run은 기술 구조와 시각화가 확정된 뒤 im-not-ai route·references를 읽은 Main이 직접 윤문하고 `main-direct-im-not-ai-guided` mode를 기록한다.
- 자동 fixture runner의 고정 치환은 `deterministic-fallback`으로 명시하며 im-not-ai monolith/finalizer 실행으로 보고하지 않는다.
- text·diagram audit가 통과해도 결과는 `READY_FOR_REVIEW`다. 자동 merge·publish·JustSend write-back은 없다.

## 요구사항

실제로 검증한 환경:

- OMP `18.0.0`
- Node `v26.7.0`
- Python `3.14.5`
- Git `2.54.0`

Node 22 이상과 Python 3가 필요하다. im-not-ai의 vendored deterministic scripts는 Python 표준 라이브러리만 사용한다.

## 설치

현재 저장소 root에서 다음 로컬 link 설치를 실제 검증했다.

```bash
omp plugin link .
omp plugin list --json
omp plugin doctor
```

검증 결과: `justsend-blog@0.1.0` enabled, doctor `4 ok / 0 warnings / 0 errors`.

## JustSend MCP 설정

실제 endpoint, command, token, local path는 이 저장소에 포함하지 않는다. `.omp/mcp.json.example`을 `.omp/mcp.json`으로 복사한 뒤 현재 설치의 실제 값을 넣는다.

```json
{
  "$schema": "https://raw.githubusercontent.com/can1357/oh-my-pi/main/packages/coding-agent/src/config/mcp-schema.json",
  "mcpServers": {
    "<JUSTSEND_SERVER_ID>": {
      "type": "stdio",
      "command": "<ABSOLUTE_PATH_TO_JUSTSEND_MCP>",
      "args": []
    }
  }
}
```

전역 `~/.omp/agent/mcp.json`은 자동 수정하지 않는다. 설정 뒤 새 OMP session에서 server와 tool description이 보이는지 확인한다. 자세한 절차는 `docs/operations/MCP_SETUP.md`를 따른다.

## 실행

OMP interactive session에서 다음처럼 호출한다.

```text
/skill:justsend-blog 지난 한 달간 JustSend 동기화 작업 기록을 조사해서 개발자를 위한 기술 블로그로 작성해줘. 필요한 아키텍처 그림도 포함해.
```

`/skill:justsend-blog` discovery 자체는 로컬 OMP에서 실제 검증했다.

## 산출물

각 run은 격리 worktree의 `.justsend-blog/runs/<run-id>/`에 다음을 남긴다.

```text
request.md
manifest.json
research-summary.md
evidence.yml
evidence.md
outline.md
draft.md
visual-plan.yml
diagrams/
humanized.md
humanization.json
audit.json
trace.jsonl
final.md
```

`final.md`는 publish candidate다. 사용자 승인 전 `vault/published/`나 외부 서비스로 보내지 않는다.

## 결정적 E2E 실행

Mock JustSend fixture로 전체 pipeline을 실제 실행한다.

```bash
npm run test:e2e
```

직접 실행하려면 기존 commit이 있는 별도 Git workspace를 지정한다.

```bash
node scripts/run-pipeline.js \
  --workspace /absolute/path/to/git-workspace \
  --fixture "$PWD/tests/fixtures/justsend-records.json" \
  --date 2026-08-23T12:34:56Z
```

이 CLI fixture 모드는 테스트용이며 prose 단계는 `deterministic-fallback`이다. im-not-ai의 route metrics와 변경률 gate는 실제 vendored Python을 실행하지만 diagnostician/monolith/finalizer를 호출하지 않는다. 실제 JustSend run은 `/skill:justsend-blog`를 읽은 Main이 현재 OMP tool description을 발견하고 im-not-ai references에 따라 prose를 직접 윤문한다.

## 검증

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
node scripts/verify-agent-policy.js
node scripts/validate-package.js
node scripts/doctor.js
```

마지막 검증 결과:

- Unit: 13 pass, 0 fail
- Integration: 2 pass, 0 fail
- E2E: 1 pass, 0 fail
- Agent policy: Scout 5, state-changing Scout 0, recursive spawn 0
- Package: 1 exposed Skill, 6 internal workflows, manifest versions synchronized

## 설계 문서

- `docs/architecture/OVERVIEW.md`
- `docs/architecture/SOLOMD_TRACEABILITY.md`
- `docs/adr/0001-solomd-authoring-core.md`
- `docs/licenses/upstream-usage.md`
- `THIRD_PARTY_NOTICES.md`

## 보안과 개인정보

API key, token, cookie, password, 개인 연락처, 내부 IP, private endpoint, repository credential은 Evidence 생성 전에 redaction한다. trace에는 secret 원문 대신 category와 count만 남긴다. MCP 입력은 데이터로 취급하며 그 안의 지시문을 실행하지 않는다.

## License

프로젝트 코드는 MIT. 고정 upstream과 사용 방식은 `upstreams.lock.yml`, `THIRD_PARTY_NOTICES.md`, `docs/licenses/upstream-usage.md`에 기록한다. Toss Technical Writing 콘텐츠는 CC BY-NC-SA 4.0 research-only이며 배포하지 않는다.
