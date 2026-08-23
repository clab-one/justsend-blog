# Evidence Contract

## Required top-level fields

- `topic`: 공개 가능한 주제
- `generated_at`: ISO-8601
- `scope.date_from`, `scope.date_to`, `scope.query_terms`
- `evidence`, `inferences`, `conflicts`, `unknowns`

## Evidence item

각 item은 `id`, `type`, `statement`, `occurred_at`, `source`, `confidence`, `sensitivity`를 가진다. ID는 run 안에서 유일한 `JS-E001` 형식이다. source provider는 `justsend`, `record_id`는 실제 값, `attachment_ids`는 배열이다.

`sensitivity`는 `public-safe`, `redacted`, `internal-review` 중 하나다. `internal-review` item은 명시적 사용자 승인 없이는 draft에 포함하지 않는다.

## Inference

`JS-I001` 형식의 ID, statement, 비어 있지 않은 `supported_by`, `confidence: inferred|uncertain`을 사용한다. Evidence가 지원하는 범위를 넘어선 인과·효과를 쓰지 않는다.

## Claim provenance

outline section과 final 핵심 사실 문장은 Evidence ID를 보존한다. 출판 본문에서 ID를 숨겨야 하는 target이라도 run의 `final.md`에는 HTML comment `<!-- evidence: JS-E001 -->`로 추적성을 남긴다.
