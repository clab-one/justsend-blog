# 문제 해결

## `/skill:justsend-blog`가 보이지 않는다

```bash
omp plugin list --json
omp plugin doctor
node scripts/validate-package.js
```

`justsend-blog@0.4.1`이 enabled인지, `skills/justsend-blog/SKILL.md`가 linked root 바로 아래 one-level layout인지 확인한다. 기존 session은 plugin cache를 유지할 수 있으므로 새 session을 연다.

## JustSend MCP capability가 누락된다

`.omp/mcp.json`의 placeholder가 남아 있지 않은지 확인한다. 현재 OMP session의 tool description을 다시 가져오고 `scripts/discover-capabilities.js`로 검사한다. 동률 또는 read-only 근거가 없는 tool을 수동으로 사실처럼 매핑하지 않는다.

## Evidence validator가 실패한다

```bash
node scripts/validate-evidence.js /path/to/evidence.yml
```

이 프로젝트가 생성하는 `.yml`은 YAML 1.2와 호환되는 JSON 표현이다. ID 중복, 잘못된 type/confidence, Research Source ID·provider·source_id·locator 누락, inference의 빈 `supported_by`를 고친다.

## run branch가 이미 존재한다

같은 날짜와 slug의 실행이 이미 있다. 기존 branch를 강제 삭제하지 않는다. 기존 run을 검토하거나 다른 slug로 새 run을 만든다.

## workspace가 dirty다

정상 지원 상태다. pipeline은 HEAD에서 별도 worktree를 만들며 dirty tracked/untracked 파일을 stage·stash·reset하지 않는다. Git repository에 아직 commit이 하나도 없으면 worktree를 만들 수 없으므로 먼저 사용자가 기준 commit을 만든다.

## im-not-ai route가 standard fallback이다

`python3`와 다음 파일을 확인한다.

```bash
python3 --version
ls skills/justsend-blog/vendor/im-not-ai/scripts/prepare_monolith_input.py
ls skills/justsend-blog/vendor/im-not-ai/skills/humanize-korean/references/metrics_v2.py
```

metrics 오류를 숨기지 않는다. route는 standard로 안전하게 낮추고 manifest에 이유를 기록한다.

## 변경률이 50% 이상이다

윤문본을 채택하지 않는다. 원문과 보호 token diff를 확인하고 변경 범위를 줄여 다시 실행한다. audit result를 수동 PASS로 바꾸지 않는다.

## research audit가 JustSend-only 글을 차단한다

정상 동작이다. JustSend record는 사건 seed이지 완성된 research dossier가 아니다. `research-pack.yml`에 repository source·test·config 두 개 이상, official primary docs, runtime observation, existing corpus를 추가하고 각 source의 locator·excerpt·claim_keys를 Evidence `sources[]`에 연결한다. source 수만 채우는 무관한 research는 실제 사용 Evidence와 연결되지 않아 집계되지 않는다.

```bash
node scripts/validate-research.js /path/to/research-pack.yml
node scripts/validate-evidence.js /path/to/evidence.yml
```

## quality audit가 작업 카드 요약을 차단한다

정상 동작이다. `audit.json.quality.blockers`에서 `content_depth`, `corpus_depth_ratio`, `source_artifacts`, `code_or_log_evidence`, `direct_evidence_depth`, `evidence_coverage`, `unused_high_value_evidence`를 확인한다. 글자 수만 늘리지 말고 원 기록의 source·로그·실패·철회·검증·제약을 보강한다. threshold 예외는 사용자가 이유를 보고 승인한 `quality-contract.json` exemption만 허용한다.

## 필요한 diagram이 없다고 실패한다

`outline.json`의 section 의미와 `visual_candidate`를 다시 확인한다. candidate를 false로 낮추거나 `omit`으로 남기지 말고 유형에 맞는 diagram을 만든다. 첨부 이미지가 없는 것은 no-diagram 사유가 아니다.

## diagram audit가 실패한다

`visual-plan.yml`의 모든 node·edge가 실제 Evidence ID를 가지는지 확인한다. 방향, actor, label, 수치, security boundary를 본문·Evidence와 다시 대조한다. 근거가 없으면 요소를 삭제한다.

## PNG renderer 결과가 다르다

HTML이 편집 가능한 정본이고 SVG가 blog 삽입 우선 형식이다. bundled renderer는 dependency-free compatibility PNG를 만든다. font binary는 번들하지 않으므로 host font fallback에 따라 glyph 모양이 달라질 수 있다.

## audit는 PASS인데 publish되지 않는다

정상이다. PASS는 `READY_FOR_REVIEW`다. 사용자 승인 전 merge, `vault/published/` 반영, 외부 publish, JustSend write-back을 하지 않는다.
