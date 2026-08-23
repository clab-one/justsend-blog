# Evidence — image_path 한 줄이 목록과 상세 이미지가 되기까지

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E101 | decision | corroborated | 대표 이미지의 의미는 caller가 정하고 work_start는 image_path라는 명시적 input만 받는다. | RS-001, RS-004 |
| JS-E102 | fact | direct | helper는 image를 staging에 atomic write하고 attachment identity와 path를 anchor intent에 함께 보존한다. | RS-002 |
| JS-E103 | failure | corroborated | attachment hero와 body jsattach reference를 함께 만들자 같은 그림이 상세에서 두 번 렌더링됐다. | RS-001, RS-002 |
| JS-E104 | decision | corroborated | 본문 reference를 제거하고 attachment를 목록과 상세가 함께 읽는 단일 source로 삼았다. | RS-002, RS-003 |
| JS-E105 | fact | direct | 목록 thumbnail은 첫 visual attachment localPath에서 계산된다. | RS-003 |
| JS-E106 | result | direct | 설치본에서 목록 thumbnail·상세 hero·첨부 없는 행의 여백 부재를 확인했다. | RS-005 |
| JS-E107 | measurement | direct | 기존 공개 글은 Markdown 5808자로, 새 run은 같은 source를 다시 조사하되 기존 final과 Evidence artifact를 복사하지 않는다. | RS-006 |
