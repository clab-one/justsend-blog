# Upstream 사용 정책

이 문서는 법률 자문이 아니라 현재 고정 commit에서 확인한 배포 경계를 기록한다.

## OMP

- 고정: `can1357/oh-my-pi@160ed439ac0df594347e7d7018b813a7ffdb5e81`
- 라이선스: MIT (`.upstream/omp/LICENSE`)
- 사용: 실행 규격 연구. 코드는 vendor하지 않는다.
- 적용: `package.json#omp`, one-level Skill layout, `/skill:<name>`, `.omp/mcp.json` 예시, `omp plugin link` 검증.

## SoloMD

- 고정: `zhitongblog/solomd@65027dac77866d45c15f56de8999bbf6fc617e22`
- 라이선스: MIT (`.upstream/solomd/LICENSE`)
- 사용: 핵심 작성 아키텍처 연구. 원본 코드를 복사하지 않고 JS로 독립 구현한다.
- 적용: Markdown SSOT, run directory, trace, Git 격리, diff, review candidate, path safety, write cap.

## im-not-ai

- 고정: `epoko77-ai/im-not-ai@0ac1e84f92334f9696e69184478f91c1c6f1dc5e`
- 라이선스: MIT (`.upstream/im-not-ai/LICENSE`)
- 사용: `skills/justsend-blog/vendor/im-not-ai/`에 route metric·deterministic gate·필요 references를 고정 vendor한다.
- 수정: 원본 Python은 수정하지 않는다. OMP Main 전용 orchestration은 `skills/justsend-blog/references/workflows/humanize.md`와 `src/pipeline/humanize.js`에 별도 작성한다.
- attribution: `THIRD_PARTY_NOTICES.md`와 vendored LICENSE에 보존한다.

## diagram-design

- 고정: `cathrynlavery/diagram-design@648c2a597839301e06df1e7434a08bde9f42eed3`
- 라이선스: MIT (`.upstream/diagram-design/LICENSE`)
- 사용: `skills/justsend-blog/vendor/diagram-design/` 전체 Skill을 pinned vendor하고 Master가 내부 dependency로 읽는다. 독립 OMP Skill로 discover하지 않는다.
- 수정: `references/style-guide.md`를 직접 바꾸지 않는다. JustSend token은 `.justsend-blog/profiles/justsend.md`와 `.diagram-design` marker로 분리한다.
- attribution: upstream LICENSE와 THIRD_PARTY_LICENSES를 보존한다. font binary는 포함하지 않는다.

## Toss Technical Writing

- 고정: `toss/technical-writing@68ba335cbe35c877775f092e98177b60da5f3d95`
- 라이선스: CC BY-NC-SA 4.0. 별도 LICENSE 파일은 없고 `README.md:23-29`, `docs/overview.md:58-64`에 선언돼 있다.
- 사용: research-only.
- 배포하지 않는 것: 원문, 문장, 단락, 표, 템플릿, 예시, 이미지, 브랜드 표현, Toss 고유 threshold.
- `policies/writing-policy.yml`과 `skills/justsend-blog/references/writing/*`는 독자의 목표, 가치 우선, 명확한 주체, 구체성, 용어 일관성 같은 일반 원칙을 독립된 표현·구조·예시로 작성한다.

## 독립 작성 확인

Reader-first policy는 upstream 문장이나 문단을 번역·축약·치환한 결과가 아니다. 정책 키, 순서, 분류, 예시는 `justsend-blog` pipeline의 Evidence 계약과 기술 블로그 유형에 맞춰 새로 설계한다. Toss 문서는 배포 tree에 복사하지 않는다.
