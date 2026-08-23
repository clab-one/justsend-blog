# Evidence — App Store 권한 심사 대응: 설명 화면을 걷어내고 기능 순간에 묻기까지

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E001 | failure | direct | App Store 5.1.1(iv) 반려의 직접 원인은 첫 실행 커스텀 안내가 시스템 권한 프롬프트로 항상 이어지지 않아 요청을 건너뛸 수 있던 흐름이었다. | RS-001 |
| JS-E002 | decision | corroborated | 첫 실행 화면에서 캘린더·마이크·카메라 권한 UI를 제거하고 권한 요청을 실제 기능 사용 시점으로 옮겼다. | RS-001, RS-002, RS-004 |
| JS-E003 | fact | direct | 현재 SetupScreen의 footer에는 setup.finish.done 한 동작만 남고 권한을 미리 요청하지 않는다는 계약이 소스 주석과 UI에 고정돼 있다. | RS-002 |
| JS-E004 | fact | corroborated | SetupPermission은 notDetermined, granted, blocked 상태 조회와 설정 앱 이동만 소유하며 실제 요청을 실행하지 않는다. | RS-003, RS-004 |
| JS-E005 | measurement | direct | 전수 조사에서 앱 소유 권한 요청은 마이크·카메라·캘린더·생체 인증 네 종류였고 사진 선택기 같은 시스템 UI 경로는 별도로 분리됐다. | RS-001 |
| JS-E006 | result | direct | 수정 뒤 권한 섹션 없이 완료 동작으로 진입하는 화면과 실제 기기 설치·실행을 관측했다. | RS-005 |
| JS-E007 | measurement | direct | 기존 배포 글은 Markdown 원문 1478자로, 같은 한국어 corpus 중앙값 8203자의 60% 기준에 크게 못 미쳤다. | RS-006 |
