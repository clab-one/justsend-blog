# Outline — 비동기 MCP 기록에서 노트를 잃지 않는 provisional·live·dead 상태 계약

- document type: `architecture-decision`
- audience outcome: 독자가 source와 Evidence를 따라 문제의 주된 관계 축과 선택의 경계를 설명할 수 있다.

## S01 · 성공 응답과 materialization을 분리했습니다
- purpose: 성공 응답과 materialization을 분리설명한다
- evidence_ids: JS-E101, JS-E102, JS-E105
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S02 · Anchor는 네 상태를 거칩니다
- purpose: Anchor는 네 상태를 거칩니다
- evidence_ids: JS-E102, JS-E103
- visual_candidate: true
- visual_reason: section의 주된 관계 축을 prose보다 type-specific diagram이 정확히 보여 준다.

## S03 · ID와 시작 intent를 한 transaction에 세웠습니다
- purpose: ID와 시작 intent를 한 transaction에 세웠습니다
- evidence_ids: JS-E103, JS-E104
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S04 · 계정 복원은 transition guard입니다
- purpose: 계정 복원은 transition guard설명한다
- evidence_ids: JS-E104
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S05 · Tool schema도 상태 어휘를 공유합니다
- purpose: Tool schema도 상태 어휘를 공유합니다
- evidence_ids: JS-E105
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S06 · Executor는 library의 정상 쓰기를 사용합니다
- purpose: Executor는 library의 정상 쓰기를 사용합니다
- evidence_ids: JS-E103, JS-E104
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S07 · Failure class가 retry 횟수보다 먼저입니다
- purpose: Failure class가 retry 횟수보다 먼저설명한다
- evidence_ids: JS-E103, JS-E104, JS-E105, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S08 · 실제 작업 기록으로 end-to-end를 닫았습니다
- purpose: 실제 작업 기록으로 end-to-end를 닫았습니다
- evidence_ids: JS-E103, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S09 · 적용 기준은 “후속 명령이 ID를 즉시 필요로 하는가”입니다
- purpose: 적용 기준은 “후속 명령이 ID를 즉시 필요로 하는가”설명한다
- evidence_ids: JS-E101, JS-E102, JS-E103, JS-E104, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

