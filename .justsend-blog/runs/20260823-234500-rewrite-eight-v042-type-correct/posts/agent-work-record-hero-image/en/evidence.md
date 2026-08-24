# English Evidence — How One image_path Becomes Both a List Thumbnail and Detail Hero

| ID | type | confidence | statement |
|---|---|---|---|
| JS-E101 | decision | corroborated | 대표 이미지의 의미는 caller가 정하고 work_start는 image_path라는 명시적 input만 받는다. |
| JS-E102 | fact | direct | helper는 image를 staging에 atomic write하고 attachment identity와 path를 anchor intent에 함께 보존한다. |
| JS-E103 | failure | corroborated | attachment hero와 body jsattach reference를 함께 만들자 같은 그림이 상세에서 두 번 렌더링됐다. |
| JS-E104 | decision | corroborated | 본문 reference를 제거하고 attachment를 목록과 상세가 함께 읽는 단일 source로 삼았다. |
| JS-E105 | fact | direct | 목록 thumbnail은 첫 visual attachment localPath에서 계산된다. |
| JS-E106 | result | direct | 설치본에서 목록 thumbnail·상세 hero·첨부 없는 행의 여백 부재를 확인했다. |
| JS-E107 | measurement | direct | 기존 공개 글은 Markdown 5808자로, 새 run은 같은 source를 다시 조사하되 기존 final과 Evidence artifact를 복사하지 않는다. |
| JS-E108 | fact | direct | justsend-blog 0.4.4 routes state-machine and flowchart branches through distinct attach points and rejects edge paths that cross non-endpoint or endpoint node interiors. |
