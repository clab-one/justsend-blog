# Visual Routing

| 설명 대상 | 우선 유형 |
| --- | --- |
| 시스템 컴포넌트와 연결 | Architecture |
| 시간순 메시지 교환 | Sequence |
| 데이터 이동 | Data Flow |
| 상태와 전이 | State Machine |
| 분기와 판단 | Flowchart |
| 시간순 사건 | Timeline |
| 추상화 계층 | Layer Stack |
| 반복 강화 구조 | Loop / Flywheel |
| 컴포넌트 의존성 | Dependency Graph |
| 실제 배포 위치 | Deployment |
| 데이터 모델 | ER / Database Schema |
| 여러 역할의 작업 흐름 | Swimlane / Process |
| 원인 분석 | Fishbone |

다음은 diagram을 만들지 않는다: 단순 목록, 짧은 전후 표, 한 문장으로 정확히 설명 가능한 관계. 두 유형이 경쟁하면 독자가 찾아야 하는 주된 축 하나만 고른다.

유형 선택은 다양성 quota가 아니다. 서로 다른 글이 같은 주된 축을 가지면 같은 type을 반복해도 된다. 반대로 이름만 state·deployment·architecture로 바꾸고 같은 generic box-arrow geometry를 쓰면 실패다. `purpose`, covered section, 연결 Evidence에서 신호를 다시 계산해 selected `type`과 `primary_axis`를 검증한다.

선택 우선순위는 명시적 관계가 일반 명사보다 강하다. `notDetermined → granted/blocked` 같은 실제 상태 값은 state machine, pod·namespace·DMG·runtime 위치는 deployment, 유지·보류·재확인 처분 분기는 flowchart, source→transform/store→sink 이동은 data flow다. `pipeline`이라는 단어 하나만으로 process를 고르거나 `server`라는 단어 하나만으로 architecture를 고르지 않는다.

Evidence가 부족한 architecture·sequence·data flow를 상상해 그리지 않는다. 그러나 이 경우 no-diagram으로 통과하는 것이 아니라 source 조사를 보강할 때까지 BLOCKED다. 첨부 이미지가 없다는 사실은 diagram 생성과 무관하다.

outline의 title·purpose에 위 표의 관계 신호가 있으면 `visual_candidate: true`다. candidate를 false로 낮추거나 `omit`으로 남기면 Fidelity Audit가 차단한다.
