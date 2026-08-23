# Outline — 공개 DMG와 MCP를 안전하게 잇는 두 신뢰 경계

- document type: `incident-review`
- audience outcome: 독자가 source와 Evidence를 따라 문제의 주된 관계 축과 선택의 경계를 설명할 수 있다.

## S01 · 위협 모델은 공개 구현에서 시작합니다
- purpose: 위협 모델은 공개 구현에서 시작합니다
- evidence_ids: JS-E101, JS-E102, JS-E104
- visual_candidate: true
- visual_reason: section의 주된 관계 축을 prose보다 type-specific diagram이 정확히 보여 준다.

## S02 · 첫 번째 경계는 Intent Trust Gate입니다
- purpose: 첫 번째 경계는 Intent Trust Gate설명한다
- evidence_ids: JS-E102, JS-E103
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S03 · 두 번째 경계는 Content Host Policy입니다
- purpose: 두 번째 경계는 Content Host Policy설명한다
- evidence_ids: JS-E104
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S04 · 주소 parser가 다르면 나쁜 해석을 선택합니다
- purpose: 주소 parser가 다르면 나쁜 해석을 선택합니다
- evidence_ids: JS-E104, JS-E105
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S05 · 두 gate는 같은 boundary 원칙을 공유합니다
- purpose: 두 gate는 같은 boundary 원칙을 공유합니다
- evidence_ids: JS-E101, JS-E102, JS-E104
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S06 · 수정된 source를 새 DMG에 다시 담았습니다
- purpose: 수정된 source를 새 DMG에 다시 담았습니다
- evidence_ids: JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S07 · 새 입력이 생길 때 architecture를 다시 봅니다
- purpose: 새 입력이 생길 때 architecture를 다시 봅니다
- evidence_ids: JS-E101, JS-E102, JS-E103, JS-E104, JS-E106
- visual_candidate: true
- visual_reason: 선택한 diagram이 이 section의 동일한 primary axis와 type 선택 근거를 직접 설명한다.

