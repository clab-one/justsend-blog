---
name: justsend-humanize
description: 기술 구조와 diagram integration 뒤 한국어 prose만 im-not-ai route와 deterministic gate로 윤문하고 숫자·날짜·이름·코드·인과를 보존하는 OMP Main 전용 절차.
---

# JustSend Humanize

Main이 직접 수행한다. vendored im-not-ai agent 문서를 호출하거나 다른 agent를 생성하지 않는다.

실제 `/skill:justsend-blog` 실행은 `mode: main-direct-im-not-ai-guided`다. Main은 route를 정한 뒤 `vendor/im-not-ai/skills/humanize-korean/references/quick-rules.md`와 필요 시 `diagnosis-rules.md`를 직접 읽고 prose를 실제로 윤문한다. `src/pipeline/humanize.js#applyDeterministicFallback`은 mock fixture와 자동 테스트 전용 고정 치환이며 im-not-ai monolith/finalizer 실행으로 보고하지 않는다.

1. `draft.md`와 integrated diagram caption을 기준 원문으로 고정한다.
2. frontmatter, Evidence/record ID, URL, path, fenced/inline code, command, API name, JSON/YAML, 숫자, 날짜, 직접 인용, HTML/SVG, node ID를 보호 span으로 추출한다.
3. `vendor/im-not-ai/scripts/prepare_monolith_input.py`로 metrics와 `route_hint`를 계산한다. 사용자 `가볍게/빠르게만`은 light, `--strict/정밀하게/증적`은 heavy로 override한다. metrics 실패는 standard다.
4. light는 번역투·피동·메타 담화만 보수적으로 국소 수정한다. standard는 Main이 지배 패턴을 진단하고 전체 prose를 한 번 윤문한다. heavy는 진단, 겨냥 윤문, 원문↔결과 정밀 대조를 Main이 순서대로 직접 수행한다.
5. 구조·claim·section 순서를 바꾸지 않는다. 새로운 주장·효과·비유를 추가하지 않는다.
6. `src/pipeline/humanize.js`와 vendored deterministic gate로 change rate와 보호 token을 검사한다.
7. 30% 이상은 WARN과 정밀 대조, 50% 이상은 FAIL이며 윤문본을 채택하지 않는다.
8. 숫자, 날짜, 고유명사, 제품·API 이름, 기술 용어, 직접 인용, 부정, 인과, 성능 수치, 성공/실패 여부가 달라지면 실패다.

통과 결과만 `humanized.md`로 저장하고 `mode: main-direct-im-not-ai-guided`, route, 선택 이유, change rate를 manifest와 audit에 기록한다. 자동 fixture runner의 결과는 반드시 `mode: deterministic-fallback`, `scope: fixture-and-test-only`로 남긴다.
