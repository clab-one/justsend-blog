# Evidence — 에이전트 작업 기록에 대표 이미지를 붙이면서 데이터 계약부터 고친 과정

| ID | type | confidence | statement | sources |
|---|---|---|---|---|
| JS-E001 | decision | corroborated | 대표 이미지는 work_start의 image_path라는 명시적 입력으로 받고 무엇을 그릴지는 작업 문맥을 아는 호출자가 결정한다. | RS-001, RS-002, RS-004 |
| JS-E002 | fact | direct | workStart는 이미지 바이트를 staging directory에 원자적으로 쓰고 attachment id·filename·path를 anchor intent에 함께 저장한다. | RS-002 |
| JS-E003 | failure | corroborated | 첨부 hero가 상세 상단에 이미 표시되는데 본문에 jsattach 참조까지 주입해 같은 그림이 두 번 렌더링됐다. | RS-001, RS-002 |
| JS-E004 | decision | corroborated | 대표 이미지는 본문 참조가 아니라 첨부 자체를 정본으로 삼고 목록과 상세가 같은 첨부를 읽도록 고쳤다. | RS-002, RS-003 |
| JS-E005 | fact | direct | HomeViewModel은 photo 또는 video 첨부 중 첫 localPath를 leadingThumbPath로 선택하고 첨부가 없으면 썸네일 경로를 만들지 않는다. | RS-003 |
| JS-E006 | result | direct | 정식 서명 설치본에서 목록의 56pt 썸네일, 상세 상단 이미지, 첨부 없는 행의 빈 자리 부재를 실제 계정으로 확인했다. | RS-005 |
| JS-E007 | measurement | direct | 기존 배포 글은 Markdown 원문 1348자로, 같은 한국어 corpus 중앙값 8203자의 60% 기준에 크게 못 미쳤다. | RS-006 |
