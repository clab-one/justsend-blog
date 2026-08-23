# 설치

## 1. 요구 도구 확인

```bash
omp --version
node --version
python3 --version
git --version
```

검증 환경은 OMP 18.0.0, Node 26.7.0, Python 3.14.5, Git 2.54.0이다.

## 2. 로컬 plugin link

저장소 root에서 실행한다.

```bash
omp plugin link .
```

이 명령은 `package.json#omp`를 읽고 로컬 저장소를 OMP user plugin directory에 symlink한다.

## 3. 설치 상태 확인

```bash
omp plugin list --json
omp plugin doctor
```

성공 조건:

- 목록에 `justsend-blog`, version `0.4.1`, enabled `true`.
- doctor에 plugin error가 없다.

## 4. Skill invocation 확인

interactive OMP에서 `/skill:justsend-blog`를 입력한다. 자동 검증에 사용한 실제 명령은 다음과 같다.

```bash
omp -p --no-session --no-tools --max-time 60 \
  "/skill:justsend-blog 워크플로를 실행하지 말고 호출된 skill 이름만 출력해."
```

출력: `justsend-blog`.

## 범위

Git URL·npm registry·marketplace 설치는 이 작업에서 실제 검증하지 않았으므로 설치 명령으로 제시하지 않는다. 현재 보장하는 설치 경로는 local link다.
