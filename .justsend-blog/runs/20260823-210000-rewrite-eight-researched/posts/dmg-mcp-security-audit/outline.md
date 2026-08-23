# Outline — DMG와 MCP 플러그인 보안 감사: 바이너리가 전부 공개돼도 안전한 경계 만들기

- document type: `incident-review`
- audience outcome: 독자가 실제 source와 검증을 따라 결정·실패·남은 경계를 설명할 수 있다.

## S01 · 공개 구현 위협 모델을 먼저 고정했습니다
- purpose: 공개 구현 위협 모델을 먼저 고정설명한다
- evidence_ids: JS-E001, JS-E002
- visual_candidate: true
- visual_reason: 관계와 흐름을 산문보다 빠르게 보여 주므로 diagram으로 표현한다.

## S02 · 가장 큰 결함은 로컬 queue의 인가였습니다
- purpose: 가장 큰 결함은 로컬 queue의 인가였습니다
- evidence_ids: JS-E002, JS-E003
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S03 · 두 번째 결함은 내용이 정한 URL이었습니다
- purpose: 두 번째 결함은 내용이 정한 URL이었습니다
- evidence_ids: JS-E004
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S04 · IP 문자열을 한 parser로만 읽으면 안 됐습니다
- purpose: IP 문자열을 한 parser로만 읽으면 안 됐습니다
- evidence_ids: JS-E004, JS-E005
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S05 · 클라이언트 secret을 보안 경계로 세지 않았습니다
- purpose: 클라이언트 secret을 보안 경계로 세지 않았습니다
- evidence_ids: JS-E001, JS-E002
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S06 · source 수정 뒤 DMG를 다시 구웠습니다
- purpose: source 수정 뒤 DMG를 다시 구웠습니다
- evidence_ids: JS-E006
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

## S07 · 열린 위험을 등급과 조건으로 남겼습니다
- purpose: 열린 위험을 등급과 조건으로 남겼습니다
- evidence_ids: JS-E001, JS-E002, JS-E004, JS-E006
- visual_candidate: false
- visual_reason: 핵심이 단일 판단 또는 상세 설명이라 산문과 표가 더 정확하다.

