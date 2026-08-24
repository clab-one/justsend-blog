# Fidelity Contract

## Text blockers

- `unsupported_claims.length > 0`
- `numbers_changed.length > 0`
- `dates_changed.length > 0`
- `proper_nouns_changed.length > 0` when the change affects identity
- protected code, URL, path, API, quote, record ID, Evidence ID mismatch

## Research blockers

- production Evidence가 JustSend work-record provider만 사용
- `research_source_depth`, `research_source_diversity`, `repository_research`, `external_primary_research`, `runtime_research`, `research_claim_coverage` blocker 발생
- selected source에 locator·20자 excerpt·claim key가 없음
- 구현 claim에 repository source가, 외부 플랫폼 claim에 official primary source가, result claim에 runtime observation이 연결되지 않음
- final이 사용하지 않는 source를 수치 채우기용으로 research pack에 추가

## Content quality blockers

- `quality.blockers.length > 0`
- production 장문의 characters·section·subsection·source artifact·code/log·direct Evidence 최소값 미달
- 기존 corpus가 있는데 `corpus_depth_ratio < 0.60`
- `evidence_coverage < 0.65` 또는 `unused_high_value_evidence.length > 0`
- 작업 카드 요약을 article로 승격하거나 근거 없는 padding으로 threshold를 채움
- 예외는 `quality-contract.json`에 `approved_by: user`, 20자 이상의 이유가 있을 때만 허용

## Diagram blockers

- `unsupported_nodes.length > 0`
- `unsupported_edges.length > 0`
- incorrect direction, actor, label, quantity, security boundary
- `missing_provenance.length > 0`
- `incorrect_type_selection.length > 0`: section·purpose·Evidence가 가리키는 최적 type과 plan type 불일치
- `renderer_contract_mismatch.length > 0`: plan renderer와 SVG root metadata 불일치 또는 미등록 renderer
- `type_invariant_violations.length > 0`: state·transition, zone·artifact·runtime, decision·outcome 등 선택 type의 필수 구조 누락
- `edge_node_intersections.length > 0`: edge가 source·destination이 아닌 node 내부를 통과
- `branch_endpoint_violations.length > 0`: 같은 source의 branch edge가 하나의 attach point를 공유
- type 다양성을 만들려고 의미상 차선 type 선택. 같은 type이 여러 글에서 실제 최적이면 허용
- `missing_required_visuals.length > 0`
- `misclassified_visual_candidates.length > 0`
- `unjustified_omissions.length > 0`
- 첨부 부재를 no-diagram 사유로 사용

## Humanization blockers

- `meaning_preserved === false`
- `change_rate >= 0.50`
- negation, causality, outcome, performance measurement changed

30% 이상 50% 미만 변경률은 자동 실패가 아니지만 Main의 원문 대조와 warning 기록이 필요하다. PASS report는 검사 결과로만 생성한다.
