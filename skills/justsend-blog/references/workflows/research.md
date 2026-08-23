---
name: justsend-research
description: OMP Main이 현재 연결된 JustSend MCP의 read capability를 발견하고 기간·주제·관계·첨부 기준으로 실제 기록을 선별하는 읽기 전용 조사 절차.
---

# JustSend Research

이 절차의 Research는 OMP Scout가 아니다. Main이 MCP를 직접 호출한다.

1. 요청에서 topic, project, feature, incident, date range를 추출한다.
2. 동의어·이전 이름·컴포넌트·오류 표현을 query terms로 만든다.
3. 현재 session의 MCP server와 tool description을 읽고 다음 논리 capability를 매핑한다: `search_records`, `get_record`, `list_records_by_range`, `get_related_records`, `get_attachments`.
4. 이름이 아니라 description·input schema·read/write 성격으로 점수를 매긴다. 모호한 동률은 자동 선택하지 않고 manifest `missing_capabilities`에 기록한다.
5. 넓은 1차 검색 후 날짜, tag, relation, attachment metadata로 좁힌다.
6. 핵심 후보의 원문과 metadata를 읽는다. source ID와 발생 시각을 보존한다.
7. normalized content hash와 source ID로 중복을 표시한다.
8. 서로 양립할 수 없는 값을 conflict candidate로 표시한다.
9. secret과 공개 목적에 무관한 개인정보를 redaction한 뒤 `research-summary.md`를 작성한다.
10. 선택·제외 이유를 각각 `record_selected`, `record_rejected` trace event로 남긴다. secret·전체 원문은 trace details에 넣지 않는다.

필수 capability가 없으면 없는 tool이나 record를 꾸며내지 않는다. 가능한 범위만 완료하고 `unknowns`와 blocker를 기록한다. 쓰기·수정·삭제·공유 capability는 사용자가 명시적으로 요청하지 않으면 발견 map에서도 비활성화한다.
