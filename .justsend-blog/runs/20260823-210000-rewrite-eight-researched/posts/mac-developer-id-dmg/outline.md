# Outline — Mac App Store 대신 Developer ID를 택한 뒤 앱 DMG와 MCP helper를 분리한 이유

- document type: `architecture-decision`
- audience outcome: 독자가 실제 source와 검증을 따라 결정·실패·남은 경계를 설명할 수 있다.

## S01 · 채널 선택 기준을 기능보다 먼저 세웠습니다
- purpose: 채널 선택 기준을 기능보다 먼저 세웠습니다
- evidence_ids: JS-E001, JS-E002
- visual_candidate: true
- visual_reason: 관계와 흐름을 산문보다 빠르게 보여 주므로 diagram으로 표현한다.

## S02 · 앱과 helper를 같은 산출물로 묶지 않았습니다
- purpose: 앱과 helper를 같은 산출물로 묶지 않았습니다
- evidence_ids: JS-E001, JS-E002
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S03 · Developer ID가 로그인 경계도 바꿨습니다
- purpose: Developer ID가 로그인 경계도 바꿨습니다
- evidence_ids: JS-E003
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S04 · 포장 script를 release contract로 만들었습니다
- purpose: 포장 script를 release contract로 만들었습니다
- evidence_ids: JS-E004, JS-E005
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S05 · 검증은 서명 뒤 제품 동작까지 이어졌습니다
- purpose: 검증은 서명 뒤 제품 동작까지 이어졌습니다
- evidence_ids: JS-E006
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S06 · 실패에서 포장 script의 세부 규칙이 생겼습니다
- purpose: 실패에서 포장 script의 세부 규칙이 생겼습니다
- evidence_ids: JS-E004, JS-E006
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S07 · 직접 배포가 만든 운영 비용을 남겼습니다
- purpose: 직접 배포가 만든 운영 비용을 남겼습니다
- evidence_ids: JS-E002, JS-E003, JS-E006
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S08 · 결정의 현재형을 문서와 산출물에서 맞춥니다
- purpose: 결정의 현재형을 문서와 산출물에서 맞춥니다
- evidence_ids: JS-E001, JS-E002, JS-E003, JS-E004, JS-E006
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

