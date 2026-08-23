# Evidence — App Store 재제출 전 감사: 빌드·메타데이터·서버 계약을 한 판에 맞추는 법

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E001 | failure | direct | 수정된 바이너리만 준비된 상태에서는 Review Notes, 권한 문구, App Privacy, 구독과 공유 정책이 서로 다른 제품 상태를 설명할 수 있었다. | RS-001 |
| JS-E002 | fact | direct | 권한 목적 문자열은 project.yml의 배포 설정에 있으며 앱 코드와 독립적으로 제출 산출물에 들어간다. | RS-002 |
| JS-E003 | fact | direct | Apple은 개인정보 정보·설명·스크린샷·미리보기가 앱 핵심 경험을 정확히 반영하고 새 버전에 맞게 갱신되도록 요구한다. | RS-004 |
| JS-E004 | fact | corroborated | 공개 공유 신고 테스트는 신고의 멱등성과 링크 폐기를 함께 검사해 문서 정책을 실행 가능한 서버 계약으로 만든다. | RS-003, RS-004 |
| JS-E005 | decision | corroborated | 재제출 게이트를 빌드 업로드가 아니라 빌드·메타데이터·권한·개인정보·구독·공유 경로가 같은 사실을 말하는 상태로 정의했다. | RS-001, RS-002, RS-003, RS-004 |
| JS-E006 | result | direct | 검증 harness의 입력 방식이 만든 크래시를 제품 결함과 분리한 뒤 빌드 178과 구독 2종을 함께 제출했다. | RS-005 |
| JS-E007 | measurement | direct | 기존 배포 글은 Markdown 원문 1415자로, 같은 한국어 corpus 중앙값 8203자의 60% 기준에 크게 못 미쳤다. | RS-006 |
