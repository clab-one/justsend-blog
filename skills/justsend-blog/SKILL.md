---
name: justsend-blog
description: JustSend MCP 작업 기록을 Evidence Pack으로 정규화한 뒤 독자 중심 한국어 기술 글, 근거 기반 다이어그램, im-not-ai 윤문, Fidelity Audit과 Git diff를 거쳐 publish candidate를 만드는 OMP Main 전용 워크플로.
---

# JustSend Blog

이 Skill은 OMP Main Orchestrator가 직접 실행한다. 다른 Skill의 절차를 읽어 적용하되 subagent에 단계를 위임하지 않는다. 코드베이스 위치 조사가 정말 필요할 때만 `task`에 `agent: "scout"`를 명시하며, Scout는 읽기 전용이고 재귀 호출하지 않는다.

## 불변 조건

- JustSend record에서 바로 글을 쓰지 않는다. JustSend는 사건·결정·시간축의 seed다. SoloMD의 풍부한 글이 `research/*.md` source dossier를 먼저 요구하듯, 이 Skill도 `research-pack.yml`을 Evidence보다 먼저 확정한다.
- production 글은 JustSend만으로 쓰지 않는다. 실제 repository source·테스트·설정·로그, 외부 플랫폼의 공식 1차 문서, runtime observation, 기존 corpus를 조사해 claim과 연결한다.
- MCP 실제 tool 이름을 기억이나 문서 예시로 추측하지 않는다. 현재 session의 MCP server/tool description에서 capability map을 만든다.
- JustSend는 기본 read-only다. 사용자 명시 없이 write, share, publish를 매핑하거나 호출하지 않는다.
- 모든 핵심 claim과 diagram node/edge를 Evidence ID에 연결한다.
- Evidence ID가 있다는 이유만으로 작업 카드 요약을 기술 글로 승격하지 않는다. source·실패·대안·검증·제약을 충분히 확장한다.
- 기존 발행 corpus가 있으면 같은 언어의 중앙값과 비교한 `quality-contract.json`을 만들고, 깊이 60% 미만은 사용자 승인 예외 없이는 차단한다.
- architecture·sequence·data flow·state transition·deployment·trust boundary가 핵심인 section은 그림을 만든다. 첨부 부재는 no-diagram 사유가 아니다.
- 기술 구조와 visual integration 뒤에만 한국어 윤문을 실행한다.
- audit 실패를 수동 PASS 처리하지 않는다.
- 결과 상태는 `READY_FOR_REVIEW`다. 승인 전 merge·publish·JustSend write-back 금지.

## 실행

1. `skill://justsend-blog/references/workflows/research.md`, `skill://justsend-blog/references/workflows/evidence.md`, `skill://justsend-blog/references/workflows/writing.md`, `skill://justsend-blog/references/workflows/visual.md`, `skill://justsend-blog/references/workflows/humanize.md`, `skill://justsend-blog/references/workflows/audit.md`를 순서대로 읽는다. 모두 Master Skill 내부 절차이며 독립 Skill로 호출하지 않는다.
2. 현재 Git root와 HEAD를 확인한다. `scripts/run-pipeline.js --workspace <root> --prepare-only` 계약으로 별도 worktree와 `justsend-blog/YYYYMMDD/<slug>` branch를 만든다. 원 workspace의 dirty 파일을 stage·stash·reset하지 않는다.
3. `.justsend-blog/runs/<run-id>/request.md`, `manifest.json`, `trace.jsonl`을 만든다. 요청에 없는 독자·기간·유형은 합리적으로 정하고 `assumptions`에 기록한다.
4. 현재 도구 목록과 description을 `scripts/discover-capabilities.js`의 논리 interface에 맞춰 매핑한다. 필수 read capability가 없으면 존재하지 않는 결과를 만들지 말고 run을 `BLOCKED`로 종료한다.
5. Research 절차로 JustSend 후보를 찾은 뒤 source expansion을 수행한다. implementation claim은 CodeGraph/LSP로 repository source·테스트·설정·로그를 읽고, 외부 API·표준 claim은 `read`와 `web_search`로 공식 1차 문서를 읽으며, result claim은 실제 runtime·테스트 관측을 확보한다. 기존 글이 있으면 corpus도 source로 읽는다. 선택·제외·locator·excerpt·claim_keys·hash를 `research-pack.yml`과 `research-summary.md`에 저장하고 `scripts/validate-research.js`를 통과시킨다. secret 원문은 artifact와 trace에 쓰지 않는다.
6. Evidence 절차로 Research Source ID를 연결한 multi-source `evidence.yml`과 `evidence.md`를 확정하고 schema validator를 통과시킨다. production 기본값은 selected source 5개, source kind 3개, repository 2개, official primary 1개, runtime 1개, claim key 5개다.
7. Writing 절차로 문서 유형을 선택하고 section별 `purpose`, `evidence_ids`, `visual_candidate`가 있는 `outline.md`와 동일 내용의 `outline.json`을 만든다. 발행 대상에 기존 글이 있으면 같은 언어 corpus의 길이·section·artifact 중앙값을 재어 `quality-contract.json`에 기록한다. source artifact, 실패·철회한 대안, 검증, 남은 제약을 포함한 `draft.md`를 작성한다. 작업 카드 요약이나 corpus 깊이 60% 미만 초안은 다음 단계로 보내지 않는다.
8. Visual 절차로 그림이 더 나은 구간을 `visual-plan.yml`에 넣는다. `visual_candidate: true`이거나 section 의미가 architecture·sequence·data flow·state transition·deployment·trust boundary에 해당하면 diagram은 필수다. 필요하면 `skill://justsend-blog/vendor/diagram-design/SKILL.md`와 `skill://justsend-blog/vendor/diagram-design/references/<selected-type>.md`를 읽고, vendor directory를 상대경로 기준으로 삼아 HTML 정본, SVG, PNG를 `diagrams/`에 만든다.
9. Humanize 절차로 Main이 im-not-ai references를 읽고 한국어 prose를 직접 윤문해 `humanized.md`를 만든다. 실제 run에는 `mode: main-direct-im-not-ai-guided`를 기록한다. 보호 대상 token은 원문과 동일해야 한다.
10. Audit 절차와 `scripts/verify-fidelity.js`로 research·text·diagram·quality contract를 함께 검사한다. JustSend-only research, repository·official primary·runtime source 누락, claim과 연결되지 않은 research source, unsupported claim, content depth, corpus parity, direct Evidence 수와 coverage, source artifact, 사용하지 않은 high-value Evidence, subsection 깊이, 필요한 diagram 누락을 차단한다. 실패하면 근거 없는 문장을 삭제하거나 source 조사·실패 이력·코드·검증·diagram을 보강하고 전체 검사를 다시 실행한다.
11. PASS일 때만 `final.md`, `audit.json`, 최종 manifest를 `READY_FOR_REVIEW`로 만든다. 관련 경로만 명시적으로 commit하고 base와의 Git diff를 제시한다.
12. 사용자에게 final Markdown, 생성 파일, Evidence 요약, audit, branch, commit, diff를 제공한다. 승인 전 다음 상태로 전이하지 않는다.

## 상태 전이

`REQUESTED → RESEARCHING → EVIDENCE_READY → OUTLINED → DRAFTED → VISUAL_PLANNED → VISUAL_RENDERED → HUMANIZED → AUDITED → READY_FOR_REVIEW → ACCEPTED | REJECTED`

시각 후보가 실제로 0개일 때만 `VISUAL_PLANNED`에서 `visuals: []`, `decisions: []`로 전이한다. 후보가 하나라도 있으면 해당 section을 `render` decision과 diagram으로 연결해야 한다. `omit`은 publish blocker이며, no-diagram 예외는 `quality-contract.json`에 사용자가 승인한 이유로만 기록한다.
