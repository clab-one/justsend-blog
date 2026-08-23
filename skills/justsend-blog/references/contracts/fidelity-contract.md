# Fidelity Contract

## Text blockers

- `unsupported_claims.length > 0`
- `numbers_changed.length > 0`
- `dates_changed.length > 0`
- `proper_nouns_changed.length > 0` when the change affects identity
- protected code, URL, path, API, quote, record ID, Evidence ID mismatch

## Diagram blockers

- `unsupported_nodes.length > 0`
- `unsupported_edges.length > 0`
- incorrect direction, actor, label, quantity, security boundary
- `missing_provenance.length > 0`

## Humanization blockers

- `meaning_preserved === false`
- `change_rate >= 0.50`
- negation, causality, outcome, performance measurement changed

30% 이상 50% 미만 변경률은 자동 실패가 아니지만 Main의 원문 대조와 warning 기록이 필요하다. PASS report는 검사 결과로만 생성한다.
