# Outline — App Store 재제출을 한 번의 프로세스로 만드는 정합성 감사

- document type: `incident-review`
- audience outcome: 독자가 source와 Evidence를 따라 문제의 주된 관계 축과 선택의 경계를 설명할 수 있다.

## S01 · 재제출을 네 단계로 고정했습니다
- purpose: 재제출을 네 단계로 고정설명한다
- evidence_ids: JS-E101, JS-E103, JS-E105, JS-E106
- visual_candidate: true
- visual_reason: section의 주된 관계 축을 prose보다 type-specific diagram이 정확히 보여 준다.

## S02 · Build는 로컬 archive 이름이 아닙니다
- purpose: Build는 로컬 archive 이름이 아닙니다
- evidence_ids: JS-E101, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S03 · Purpose string은 실행 코드 밖의 계약입니다
- purpose: Purpose string은 실행 코드 밖의 계약설명한다
- evidence_ids: JS-E102, JS-E103
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S04 · 공개 공유 policy는 endpoint test로 확인했습니다
- purpose: 공개 공유 policy는 endpoint test로 확인설명한다
- evidence_ids: JS-E104
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S05 · 구독은 Build와 따로 제출 상태를 가집니다
- purpose: 구독은 Build와 따로 제출 상태를 가집니다
- evidence_ids: JS-E105, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S06 · App Privacy는 화면을 직접 읽었습니다
- purpose: App Privacy는 화면을 직접 읽었습니다
- evidence_ids: JS-E101, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S07 · 감사 artifact는 다음 release가 다시 실행할 수 있어야 합니다
- purpose: 감사 artifact는 다음 release가 다시 실행할 수 있어야 합니다
- evidence_ids: JS-E101, JS-E102, JS-E104, JS-E105, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

## S08 · 최종 gate가 증명하는 범위를 제한했습니다
- purpose: 최종 gate가 증명하는 범위를 제한설명한다
- evidence_ids: JS-E101, JS-E103, JS-E104, JS-E105, JS-E106
- visual_candidate: false
- visual_reason: 단일 판단·제약·검증 설명은 prose와 표가 더 정확하다.

