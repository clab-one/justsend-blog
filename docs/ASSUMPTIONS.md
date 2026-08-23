# 구현 가정과 확인된 제약

## OMP 버전

로컬 실행기는 `omp/18.0.0`, 고정 upstream HEAD는 `18.0.3`이다. package layout과 Skill invocation은 두 근거를 비교했고 실제 설치·discovery 명령은 로컬 18.0.0에서 검증했다. 향후 18.0.3 기능만 의존하지 않는다.

## Plugin dependency

조사한 OMP manifest에는 plugin-to-plugin dependency field가 없다. 따라서 MIT인 diagram-design Skill과 im-not-ai deterministic runtime 최소 범위를 pinned vendor했다. Toss 콘텐츠는 vendor하지 않았다.

## JustSend MCP

현재 OMP 환경에서 JustSend MCP discovery와 read 호출 가능 여부를 확인했다. 실제 사용자 record를 사용한 blog run은 개인정보 최소화 때문에 수행하지 않았고, 전체 pipeline 행동 검증은 8-record mock fixture로 수행했다. runtime Skill은 실제 tool description에서 map을 만든다.

## Evidence serialization

외부 YAML dependency를 추가하지 않기 위해 `evidence.yml`과 `visual-plan.yml`은 YAML 1.2에서 유효한 JSON 표현으로 저장한다. 사람이 읽을 수 있는 대응 Markdown도 함께 남긴다.

## Brand profile

`https://justsend.cloud` 직접 fetch는 작업 시점에 연결 실패했다. 같은 workspace의 JustSend web 정본 `../web/src/styles/tokens.css`에서 semantic color와 font stack을 직접 확인해 `justsend` profile을 만들었다. 배포 profile에는 외부 경로나 font binary를 포함하지 않는다.

## Diagram PNG

upstream diagram-design의 PNG export는 optional Playwright·Chromium을 요구하며 자동 설치를 금지한다. 단일 설치와 deterministic E2E를 위해 HTML/SVG와 동일 plan을 사용하는 dependency-free raster renderer를 구현했다. HTML이 편집 정본, SVG가 blog 우선 형식, PNG가 호환 형식이다.

## Git isolation

worktree는 기존 HEAD가 필요하다. commit이 하나도 없는 repository에서는 run을 시작하지 않는다. 같은 날짜와 slug의 branch가 존재하면 강제 삭제하지 않고 충돌로 실패한다.

## Publish

`READY_FOR_REVIEW`는 승인 대기 상태다. `scripts/review-run.js accept`도 manifest 결정만 기록하며 merge·branch 삭제·외부 publish를 하지 않는다.
