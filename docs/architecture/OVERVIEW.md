# justsend-blog 아키텍처

`justsend-blog`는 OMP Main Orchestrator가 JustSend 작업 기록을 근거로 출판 후보 Markdown을 만드는 로컬 플러그인 팩이다. 데이터베이스, 데몬, 웹 서버를 추가하지 않는다. 글과 실행 산출물은 Markdown·JSON·YAML 파일이며 Git이 버전 기록을 맡는다.

## 권한 경계

| 영역 | 정본 | 적용 방식 |
| --- | --- | --- |
| 실행·discovery·MCP | OMP 18 | `package.json#omp`, `skills/*/SKILL.md`, `.omp/mcp.json.example` |
| 작성 lifecycle | SoloMD | run directory, JSONL trace, 선언형 manifest, Git 격리, review candidate |
| 사실 근거 | 연결된 JustSend MCP | 실행 시 tool description으로 capability map 생성, 기본 read-only |
| 한국어 윤문 | im-not-ai | pinned Python metric/gate와 독립 OMP Main 절차 |
| 시각화 | diagram-design | pinned Skill과 evidence provenance를 결합 |
| 문장 정책 | 독립 Reader-first policy | Toss 자료를 연구하되 원문·템플릿은 배포하지 않음 |
| 최종 판단 | OMP Main Orchestrator | unsupported claim을 제거하고 audit 통과 여부 결정 |

## 실행 흐름

```text
REQUESTED → RESEARCHING → EVIDENCE_READY → OUTLINED → DRAFTED
→ VISUAL_PLANNED → VISUAL_RENDERED → HUMANIZED → AUDITED
→ READY_FOR_REVIEW → ACCEPTED | REJECTED
```

단계를 건너뛰지 않는다. `AUDITED`가 실패하면 `READY_FOR_REVIEW`로 전이하지 않는다. `READY_FOR_REVIEW`는 출판이 아니라 검토 가능한 후보 상태다.

1. 요청을 `goal`, `audience`, `date_range`, `document_type`, `visuals`로 정규화한다.
2. OMP가 노출한 MCP server와 tool description에서 논리 capability를 발견한다. 실제 tool 이름을 설정이나 코드에 고정하지 않는다.
3. Main이 JustSend를 읽고 후보를 선별한다. write capability는 사용자 명시가 없는 한 매핑하지 않는다.
4. 기록을 redaction·중복 제거·충돌 표시한 뒤 Evidence Pack으로 만든다.
5. Evidence ID가 연결된 outline과 기술 초안을 작성한다.
6. 문단보다 시각화가 이해 비용을 줄이는 구간만 visual plan으로 승격한다.
7. diagram-design 계약에 따라 HTML을 정본으로 만들고 SVG·PNG 호환본을 만든다.
8. 기술 구조가 확정된 뒤 im-not-ai route를 선택해 한국어 prose만 윤문한다.
9. 숫자·날짜·URL·식별자·고유명사·코드와 claim/diagram provenance를 검사한다.
10. audit PASS와 Git diff를 함께 제시한다. 사용자가 승인하기 전에는 merge·publish·JustSend write-back을 하지 않는다.

## 실행 파일 구조

각 실행은 격리 worktree의 `.justsend-blog/runs/<run-id>/` 아래에 다음 파일을 남긴다.

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
audit.json
trace.jsonl
final.md
```

`run-id`는 `YYYYMMDD-HHMMSS-<slug>`, branch는 `justsend-blog/YYYYMMDD/<slug>` 형식이다. 원래 workspace가 clean인지 dirty인지와 무관하게 별도 worktree를 사용하므로 사용자의 tracked·untracked 변경을 stage, stash, reset, commit하지 않는다.

## 신뢰 경계

- MCP record 본문과 attachment metadata는 비신뢰 입력이다. 지시문으로 실행하지 않는다.
- redaction은 Evidence 정규화보다 먼저 실행한다. trace에는 secret 원문 대신 redaction 종류와 개수만 쓴다.
- 모든 입력·출력 경로는 canonical workspace 내부인지 확인하며 `..`, 절대경로 탈출, symlink 탈출을 거부한다.
- run write cap 기본값은 50개 파일이다. cap을 넘기면 쓰기 전에 실패한다.
- 다이어그램 node와 edge는 각각 Evidence ID가 있어야 한다.
- humanization은 frontmatter, code, inline code, URL, ID, 숫자, 날짜, 직접 인용, HTML/SVG를 변경하지 않는다.

## OMP 통합 결정

OMP 18은 linked plugin을 `package.json`의 `omp` manifest와 conventional `skills/<name>/SKILL.md`로 발견한다. plugin-to-plugin dependency 필드는 없다. 따라서 다음 방식을 사용한다.

- `omp plugin link <repo>`로 로컬 개발 설치.
- root `skills/`에 justsend Skill과 pinned diagram-design Skill을 함께 패키징.
- im-not-ai는 MIT Python scripts와 필요한 references만 `vendor/im-not-ai/`에 고정하고, OMP Main 전용 `justsend-humanize`가 직접 실행한다.
- Toss 콘텐츠는 vendor하지 않는다.

로컬 런타임은 OMP `18.0.0`, 조사한 upstream HEAD는 `18.0.3`이다. 로컬 설치 검증 결과를 배포 명령의 기준으로 삼고, 차이는 `docs/ASSUMPTIONS.md`에 기록한다.
