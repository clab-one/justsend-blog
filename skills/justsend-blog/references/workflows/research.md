---
name: justsend-research
description: OMP Main이 현재 연결된 JustSend MCP의 read capability를 발견하고 기간·주제·관계·첨부 기준으로 실제 기록을 선별하는 읽기 전용 조사 절차.
---

# JustSend Research

SoloMD auto-blog는 웹 검색을 대신하지 않는다. `research/*.md`의 완성된 source dossier와 writing Skill을 모델에 주고, 두 번째 pass에서 source-only audit을 수행한다. SoloMD panel에서 풍부한 글이 나온 경우에는 read-only tool loop와 사용자의 “Plane·실제 앱을 확인하라”는 지시로 dossier를 먼저 만들었다. 이 Skill은 그 선행 단계를 명시적으로 수행한다.

이 절차의 Research는 OMP Scout가 아니다. Main이 도구를 직접 호출하고 `research-pack.yml`을 만든다.

## A. JustSend seed 조사

1. 요청에서 topic, project, feature, incident, date range를 추출한다.
2. 동의어·이전 이름·컴포넌트·오류 표현을 query terms로 만든다.
3. 현재 session의 MCP server와 tool description을 읽고 `search_records`, `get_record`, `list_records_by_range`, `get_related_records`, `get_attachments`를 매핑한다.
4. 넓은 검색 뒤 날짜·tag·relation·attachment metadata로 좁히고 핵심 record 원문·후속 note·상태를 읽는다.
5. JustSend record는 사건·결정·시간축의 seed다. 이 단계의 snippet이나 한 record 요약만으로 draft를 만들지 않는다.

## B. Repository source expansion

6. implementation·원인·변경 claim이 있으면 `codegraph_explore`를 먼저 사용해 실제 source·caller·test·config·문서 위치를 찾는다. exported symbol은 LSP references도 확인한다.
7. claim마다 최소 두 개의 repository source를 읽는다. 권장 조합은 구현+회귀 테스트, 설정+런타임 소비자, migration+현재 schema다.
8. `research-pack.yml`에 정확한 path와 line/symbol locator, 20자 이상의 redacted excerpt, `claim_keys`, content hash를 기록한다. source 파일 전체를 artifact에 복사하지 않는다.

## C. External primary research

9. Apple·Kubernetes·SQLite·MCP·웹 표준처럼 외부 플랫폼 계약을 설명하면 공식 문서를 조사한다. 이미 URL을 알면 `read`로 직접 읽고, 발견이 필요하면 `web_search`에서 공식 domain을 우선한다.
10. 공식 1차 문서가 있으면 2차 블로그를 Evidence로 대신하지 않는다. 2차 source는 용어·독자 질문·반례 발견용으로만 쓰고 provider를 `web`으로 구분한다.
11. 공식 source마다 URL, retrieval 시각, claim key, 사용할 수 있는 범위를 기록한다. 문서가 보장하지 않는 동작을 runtime 사실로 확대하지 않는다.

## D. Runtime·test observation

12. result·성능·수정 완료 claim은 실제 테스트 로그, 앱·CLI 실행, read-only live state, 브라우저·시뮬레이터 관측 중 하나 이상을 요구한다. 빌드 성공을 사용자 동작 성공으로 대체하지 않는다.
13. runtime source에는 실행 조건, 입력, 관찰, artifact locator를 기록한다. 외부 mutation이 필요하면 일반 배포 승인 규칙을 따른다.

## E. Corpus와 source pack

14. 기존 글이 있으면 같은 언어 corpus를 읽어 깊이·구조·용어·이미 설명한 범위를 기록한다. 다른 글의 claim을 새 글 Evidence로 복사하지 않는다.
15. 모든 source를 `RS-001` 형식으로 `research-pack.yml`에 저장한다. 각 source는 `kind`, `provider`, `source_id`, `locator`, `excerpt`, `claim_keys`, 선택·제외 이유, sensitivity를 가진다.
16. normalized content hash와 source ID로 중복을 표시하고, 양립할 수 없는 값은 conflict candidate로 남긴다.
17. `node scripts/validate-research.js <research-pack.yml>`을 통과시킨 뒤 `research-summary.md`를 작성한다.

production 기본값은 selected source 5개, source kind 3개, repository source 2개, official primary source 1개, runtime observation 1개, claim key 5개다. Evidence가 실제 사용하는 source만 이 수치에 포함한다. JustSend-only pack, locator·excerpt·claim mapping 없는 source, 글자 수를 채우기 위한 무관한 research는 audit FAIL이다.

필수 source를 확보할 수 없으면 없는 결과를 꾸며내지 않는다. `unknowns`와 blocker를 기록한다. 쓰기·수정·삭제·공유 capability는 사용자가 명시하지 않으면 비활성화한다.
