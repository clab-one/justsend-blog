# Evidence — 권한 심사 대응을 상태 머신으로 다시 읽기: 설명·동의·복구의 소유권

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E101 | failure | direct | 반려 지점은 첫 실행 안내가 시스템 동의와 분리되어 사용자가 실제 권한 요청을 건너뛸 수 있던 흐름이었다. | RS-001 |
| JS-E102 | decision | corroborated | 첫 실행에서 권한 UI를 제거하고 각 기능이 실제로 데이터를 필요로 할 때만 iOS 요청을 실행하도록 소유권을 돌렸다. | RS-001, RS-002, RS-004 |
| JS-E103 | fact | direct | 권한 model은 notDetermined, granted, blocked 세 상태를 구분한다. | RS-003 |
| JS-E104 | fact | corroborated | blocked 상태에서는 앱이 재요청하는 대신 시스템 설정으로 이동하는 복구 문을 제공한다. | RS-003, RS-004 |
| JS-E105 | measurement | direct | 앱이 직접 소유한 요청 경로는 마이크·카메라·캘린더·생체 인증 네 종류로 조사됐다. | RS-001 |
| JS-E106 | result | direct | 수정 뒤 첫 실행 완료와 실제 기기 설치·실행에서 선행 권한 섹션이 사라진 흐름을 확인했다. | RS-005 |
| JS-E107 | measurement | direct | 기존 공개 글은 Markdown 4736자로, 새 run은 같은 source를 다시 조사하되 기존 final과 Evidence artifact를 복사하지 않는다. | RS-006 |
