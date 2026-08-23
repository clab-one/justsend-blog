# Outline — Developer ID 직접 배포의 실제 위치: App DMG와 helper ZIP을 분리한 구조

- document type: `architecture-decision`
- audience outcome: 독자가 source와 Evidence를 따라 문제의 주된 관계 축과 선택의 경계를 설명할 수 있다.

## S01 · 배포 채널보다 artifact 위치가 먼저였습니다
- purpose: 배포 채널보다 artifact 위치가 먼저였습니다
- evidence_ids: JS-E101, JS-E102
- visual_candidate: true
- visual_reason: section의 주된 관계 축을 prose보다 type-specific diagram이 정확히 보여 준다.

## S02 · App과 helper는 서로 다른 공증 단위입니다
- purpose: App과 helper는 서로 다른 공증 단위설명한다
- evidence_ids: JS-E102, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S03 · Developer ID는 Apple login 위치도 바꿨습니다
- purpose: Developer ID는 Apple login 위치도 바꿨습니다
- evidence_ids: JS-E103
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S04 · package script가 release zone의 순서를 고정합니다
- purpose: package script가 release zone의 순서를 고정합니다
- evidence_ids: JS-E104
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S05 · Notarization과 runtime 검증은 다른 질문입니다
- purpose: Notarization과 runtime 검증은 다른 질문설명한다
- evidence_ids: JS-E105, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S06 · Rollback도 artifact별로 분리합니다
- purpose: Rollback도 artifact별로 분리합니다
- evidence_ids: JS-E102, JS-E104, JS-E105, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S07 · 직접 배포의 비용을 위치별로 남겼습니다
- purpose: 직접 배포의 비용을 위치별로 남겼습니다
- evidence_ids: JS-E101, JS-E102, JS-E103, JS-E104, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

