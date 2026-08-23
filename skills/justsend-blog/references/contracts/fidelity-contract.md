# Fidelity Contract

## Text blockers

- `unsupported_claims.length > 0`
- `numbers_changed.length > 0`
- `dates_changed.length > 0`
- `proper_nouns_changed.length > 0` when the change affects identity
- protected code, URL, path, API, quote, record ID, Evidence ID mismatch

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
- `missing_required_visuals.length > 0`
- `misclassified_visual_candidates.length > 0`
- `unjustified_omissions.length > 0`
- 첨부 부재를 no-diagram 사유로 사용

## Humanization blockers

- `meaning_preserved === false`
- `change_rate >= 0.50`
- negation, causality, outcome, performance measurement changed

30% 이상 50% 미만 변경률은 자동 실패가 아니지만 Main의 원문 대조와 warning 기록이 필요하다. PASS report는 검사 결과로만 생성한다.
