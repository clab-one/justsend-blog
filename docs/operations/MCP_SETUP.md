# JustSend MCP 설정

`justsend-blog`는 JustSend MCP server를 포함하지 않는다. OMP에 이미 연결된 server를 사용한다.

## Project 설정

```bash
cp .omp/mcp.json.example .omp/mcp.json
```

다음 placeholder를 현재 설치의 실제 값으로 바꾼다.

- `<JUSTSEND_SERVER_ID>`: OMP session에서 식별할 server 이름
- `<ABSOLUTE_PATH_TO_JUSTSEND_MCP>`: 실제 executable 절대 경로

실제 command, URL, token, local path를 문서나 코드에서 추측하지 않는다. 전역 `~/.omp/agent/mcp.json`은 이 프로젝트가 자동 변경하지 않는다.

## Capability discovery

새 OMP session에서 server와 tool description을 조회한다. Main은 다음 logical interface를 description·input schema·read-only annotation으로 매핑한다.

- `search_records`
- `get_record`
- `list_records_by_range`
- `get_related_records`
- `get_attachments`

실제 tool 이름은 artifact에 기록할 수 있지만 source code와 policy에 고정하지 않는다. write/destructive tool은 기본 map에서 제외한다. score 동률은 자동 선택하지 않고 `missing_capabilities`에 남긴다.

Tool description을 JSON으로 저장했다면 다음으로 map을 점검할 수 있다.

```bash
node scripts/discover-capabilities.js /path/to/mcp-tools.json
```

## 권한

블로그 pipeline은 읽기만 사용한다. 다음 작업은 사용자가 해당 실행에서 명시적으로 요청해야 한다.

- 새 JustSend record 작성
- 기존 record 수정·삭제
- blog write-back
- share link 생성
- 외부 공개

필수 read capability가 없으면 record나 결과를 꾸며내지 않고 run을 `BLOCKED`로 종료한다.
