# Vietnam Flow Study (Vite + React + TypeScript)

GitHub Pages 프로젝트 사이트(`https://dalmook.github.io/vietnam/`)에서 **HashRouter 기준**으로 동작하는 정적 웹앱입니다.

## 핵심 배포 전제

- Vite `base`는 **`/vietnam/`** 이어야 합니다.
- GitHub Pages 배포는 **GitHub Actions + `dist` 아티팩트 업로드 방식**을 사용합니다.
- 라우팅은 **HashRouter (`/#/`)** 를 사용합니다.
- `build:pages`는 `dist/index.html`을 `dist/404.html`로 복사하여 fallback을 유지합니다.
- `public/.nojekyll` 파일을 포함해 GitHub Pages의 Jekyll 처리를 비활성화합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## GitHub Pages용 빌드/검증

```bash
npm run build:pages
npm run preview:pages
```

`build:pages`는 다음을 수행합니다.
1. `vite build`로 `dist` 생성
2. `dist/index.html`을 `dist/404.html`로 복사

## 배포 워크플로우

- 파일: `.github/workflows/deploy.yml`
- main 브랜치 push 시 자동 배포
- `npm ci` → `npm run build:pages` → `dist` 업로드 → Pages 배포

## HashRouter 경로 규칙

- 홈: `/#/`
- 라이브러리: `/#/library`
- 복습: `/#/review`
- 설정: `/#/settings`
- 코스 상세: `/#/course/:courseId`
- 레슨: `/#/course/:courseId/lesson/:lessonId`

## 저장소 경로 변경 시

저장소 이름이 바뀌면 `vite.config.ts`의 `base`만 수정하면 됩니다.

- 예) 저장소가 `my-app`이면 `base: "/my-app/"`

## 트러블슈팅 체크리스트

1. Pages 소스가 `dist` 아티팩트 배포인지 확인
2. `dist/404.html`이 생성/업로드되는지 확인
3. 홈 진입 시 진단 카드(빌드시간/경로/해시)가 보이는지 확인
4. `/#/library`로 직접 진입이 가능한지 확인
5. 일부 기능 오류 시에도 흰 화면 없이 정적 홈 카드가 유지되는지 확인
