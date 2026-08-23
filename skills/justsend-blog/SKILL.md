---
name: justsend-blog
description: JustSend MCP 작업 기록을 Evidence Pack으로 정규화한 뒤 독자 중심 한국어 기술 글, 근거 기반 다이어그램, im-not-ai 윤문, Fidelity Audit과 Git diff를 거쳐 publish candidate를 만드는 OMP Main 전용 워크플로.
---

# JustSend Blog

이 Skill은 OMP Main Orchestrator가 직접 실행한다. 다른 Skill의 절차를 읽어 적용하되 subagent에 단계를 위임하지 않는다. 코드베이스 위치 조사가 정말 필요할 때만 `task`에 `agent: "scout"`를 명시하며, Scout는 읽기 전용이고 재귀 호출하지 않는다.

## 불변 조건

- JustSend record에서 바로 글을 쓰지 않는다. `evidence.yml`이 먼저다.
- MCP 실제 tool 이름을 기억이나 문서 예시로 추측하지 않는다. 현재 session의 MCP server/tool description에서 capability map을 만든다.
- JustSend는 기본 read-only다. 사용자 명시 없이 write, share, publish를 매핑하거나 호출하지 않는다.
- 모든 핵심 claim과 diagram node/edge를 Evidence ID에 연결한다.
- 기술 구조와 visual integration 뒤에만 한국어 윤문을 실행한다.
- audit 실패를 수동 PASS 처리하지 않는다.
- 결과 상태는 `READY_FOR_REVIEW`다. 승인 전 merge·publish·JustSend write-back 금지.

## 실행

1. `skill://justsend-research`, `skill://justsend-evidence`, `skill://justsend-writing`, `skill://justsend-visual`, `skill://justsend-humanize`, `skill://justsend-audit`를 읽는다.
2. 현재 Git root와 HEAD를 확인한다. `scripts/run-pipeline.js --workspace <root> --prepare-only` 계약으로 별도 worktree와 `justsend-blog/YYYYMMDD/<slug>` branch를 만든다. 원 workspace의 dirty 파일을 stage·stash·reset하지 않는다.
3. `.justsend-blog/runs/<run-id>/request.md`, `manifest.json`, `trace.jsonl`을 만든다. 요청에 없는 독자·기간·유형은 합리적으로 정하고 `assumptions`에 기록한다.
4. 현재 도구 목록과 description을 `scripts/discover-capabilities.js`의 논리 interface에 맞춰 매핑한다. 필수 read capability가 없으면 존재하지 않는 결과를 만들지 말고 run을 `BLOCKED`로 종료한다.
5. Research 절차로 넓게 찾고 원문·metadata를 읽어 `research-summary.md`를 만든다. secret 원문은 artifact와 trace에 쓰지 않는다.
6. Evidence 절차로 `evidence.yml`과 `evidence.md`를 확정하고 schema validator를 통과시킨다.
7. Writing 절차로 문서 유형을 선택하고 section별 `purpose`, `evidence_ids`, `visual_candidate`가 있는 `outline.md`를 만든다. 이어 `draft.md`를 작성한다.
8. Visual 절차로 그림이 더 나은 구간만 `visual-plan.yml`에 넣는다. 필요하면 `skill://diagram-design`과 선택한 type reference를 읽고 HTML 정본, SVG, PNG를 `diagrams/`에 만든다.
9. Humanize 절차로 Main이 im-not-ai references를 읽고 한국어 prose를 직접 윤문해 `humanized.md`를 만든다. 실제 run에는 `mode: main-direct-im-not-ai-guided`를 기록한다. 보호 대상 token은 원문과 동일해야 한다.
10. Audit 절차와 `scripts/verify-fidelity.js`로 text와 diagram을 함께 검사한다. 실패하면 근거 없는 문장을 삭제·불확실성 표시하거나 provenance를 고치고 재검사한다.
11. PASS일 때만 `final.md`, `audit.json`, 최종 manifest를 `READY_FOR_REVIEW`로 만든다. 관련 경로만 명시적으로 commit하고 base와의 Git diff를 제시한다.
12. 사용자에게 final Markdown, 생성 파일, Evidence 요약, audit, branch, commit, diff를 제공한다. 승인 전 다음 상태로 전이하지 않는다.

## 상태 전이

`REQUESTED → RESEARCHING → EVIDENCE_READY → OUTLINED → DRAFTED → VISUAL_PLANNED → VISUAL_RENDERED → HUMANIZED → AUDITED → READY_FOR_REVIEW → ACCEPTED | REJECTED`

시각화가 불필요해도 `VISUAL_PLANNED`에서 `visuals: []`, 판단 근거를 기록한 뒤 `VISUAL_RENDERED`로 전이한다. 빈 단계가 아니라 명시적 no-diagram 결정이다.
