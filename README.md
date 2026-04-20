# Vietnam Flow Study (Vite + React + TypeScript)

GitHub Pages 프로젝트 사이트(`https://dalmook.github.io/vietnam/`)에서 안정적으로 동작하도록 설정된 정적 웹앱입니다.

## 핵심 배포 전제

- Vite `base`는 **`/vietnam/`** 이어야 합니다.
- GitHub Pages 배포는 **GitHub Actions + `dist` 아티팩트 업로드 방식**을 사용합니다.
- React Router는 `basename: import.meta.env.BASE_URL`를 사용합니다.
- 새로고침/직접 URL 접근(예: `/vietnam/course/course-01`)을 위해 배포 산출물에 `404.html`을 함께 포함합니다.

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
2. `dist/index.html`을 `dist/404.html`로 복사 (BrowserRouter 직접 접근 대응)

## 배포 워크플로우

- 파일: `.github/workflows/deploy.yml`
- main 브랜치 push 시 자동 배포
- `npm ci` → `npm run build:pages` → `dist` 업로드 → Pages 배포

## 저장소 경로 변경 시

저장소 이름이 바뀌면 다음 한 곳만 우선 수정하면 됩니다.

- `vite.config.ts`의 `base`
  - 예) 저장소가 `my-app`이면 `base: "/my-app/"`

그 외 Router basename, public asset 경로는 `BASE_URL` 기반으로 동작하도록 구성되어 있습니다.

## 트러블슈팅 체크리스트

1. Pages 소스가 `dist` 아티팩트 배포인지 확인
2. 배포된 HTML이 `/vietnam/assets/...` 경로를 참조하는지 확인
3. `404.html`이 함께 배포되었는지 확인
4. PDF 파일이 `/vietnam/pdfs/...`로 열리는지 확인
5. 홈 진입 시 "앱이 살아있습니다" 상태 카드가 보이는지 확인
