# Outline — JustSend MCP 재설계: 비동기 집행 앞에서 노트를 잃지 않는 앵커 계약

- document type: `architecture-decision`
- audience outcome: 독자가 실제 source와 검증을 따라 결정·실패·남은 경계를 설명할 수 있다.

## S01 · 문제는 queue가 아니라 ID 수명이었습니다
- purpose: 문제는 queue가 아니라 ID 수명이었습니다
- evidence_ids: JS-E001, JS-E002
- visual_candidate: true
- visual_reason: 관계와 흐름을 산문보다 빠르게 보여 주므로 diagram으로 표현한다.

## S02 · Plane의 순서를 그대로 베끼지 않고 원리를 가져왔습니다
- purpose: Plane의 순서를 그대로 베끼지 않고 원리를 가져왔습니다
- evidence_ids: JS-E002, JS-E003, JS-E004
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S03 · 상태를 materialization과 분리했습니다
- purpose: 상태를 materialization과 분리설명한다
- evidence_ids: JS-E002, JS-E003
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S04 · 계정 복원 전 owner mismatch를 영구 실패로 보지 않았습니다
- purpose: 계정 복원 전 owner mismatch를 영구 실패로 보지 않았습니다
- evidence_ids: JS-E004
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S05 · ToolSpec을 선언형 계약으로 만들었습니다
- purpose: ToolSpec을 선언형 계약으로 만들었습니다
- evidence_ids: JS-E005
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S06 · 집행기는 저장소의 정상 쓰기 경로를 사용합니다
- purpose: 집행기는 저장소의 정상 쓰기 경로를 사용합니다
- evidence_ids: JS-E003, JS-E004
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S07 · 자기 기록으로 end-to-end를 검증했습니다
- purpose: 자기 기록으로 end-to-end를 검증설명한다
- evidence_ids: JS-E002, JS-E006
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S08 · 남은 비용과 적용 기준
- purpose: 남은 비용과 적용 기준
- evidence_ids: JS-E001, JS-E002, JS-E003, JS-E004, JS-E006
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

