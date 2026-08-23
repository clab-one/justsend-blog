# Evidence Contract

## Required top-level fields

- `topic`: 공개 가능한 주제
- `generated_at`: ISO-8601
- `scope.date_from`, `scope.date_to`, `scope.query_terms`
- `evidence`, `inferences`, `conflicts`, `unknowns`

## Evidence item

각 item은 `id`, `type`, `statement`, `occurred_at`, `claim_keys`, `sources`, `confidence`, `sensitivity`를 가진다. `claim_keys`는 research source의 claim mapping과 교집합을 가져야 한다. ID는 run 안에서 유일한 `JS-E001` 형식이다.

`sources`는 비어 있지 않은 배열이다. 각 source는 다음을 가진다.

- `research_source_id`: `research-pack.yml`의 실제 `RS-001` ID
- `provider`: `justsend | repository | official-docs | web | runtime | corpus | user`
- `source_id`: record ID, repository path+revision, URL, runtime artifact ID 등 실제 식별자
- `locator`: path:line/symbol, URL fragment, artifact path처럼 사람이 다시 읽을 위치
- `attachment_ids`: JustSend attachment가 아니면 빈 배열

`corroborated`는 `provider:source_id`가 다른 독립 source 두 개 이상이 필요하다. 같은 source를 여러 Evidence로 나누어 수를 채우지 않는다.

`sensitivity`는 `public-safe`, `redacted`, `internal-review` 중 하나다. `internal-review` item은 명시적 사용자 승인 없이는 draft에 포함하지 않는다.

## Inference

`JS-I001` 형식의 ID, statement, 비어 있지 않은 `supported_by`, `confidence: inferred|uncertain`을 사용한다. Evidence가 지원하는 범위를 넘어선 인과·효과를 쓰지 않는다.

## Claim provenance

outline section과 final 핵심 사실 문장은 Evidence ID를 보존한다. 출판 본문에서 ID를 숨겨야 하는 target이라도 run의 `final.md`에는 HTML comment `<!-- evidence: JS-E001 -->`로 추적성을 남긴다.
