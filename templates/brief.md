---
run_id: "{{run_id}}"
goal: "{{goal}}"
audience: "{{audience}}"
language: ko
status: REQUESTED
---

# 작성 Brief

## 독자가 얻어야 할 것

{{reader_outcome}}

## 조사 범위

- 기간: {{date_from}} ~ {{date_to}}
- 주제: {{topic}}
- query terms: {{query_terms}}

## 품질 기준

- 문서 유형: {{document_type}}
- 같은 언어 corpus 중앙값: {{corpus_median_characters}}
- 최소 corpus depth ratio: 0.60
- source artifact·실패·검증 coverage: {{coverage_requirements}}
- visual candidate: {{visual_candidates}}

## 가정

{{assumptions}}

## 출판 경계

Audit를 통과해도 결과는 `READY_FOR_REVIEW`다.
