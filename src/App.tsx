import { RouterProvider } from "react-router-dom";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { router } from "./router";

function App() {
  return (
    <AppErrorBoundary>
      <RouterProvider
        router={router}
        fallbackElement={
          <main className="safe-pb min-h-screen bg-shell px-4 pb-24 pt-6">
            <section className="rounded-[28px] bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean">Vietnam Flow</p>
              <h1 className="mt-2 text-2xl font-bold text-ink">앱이 정상 실행되었습니다</h1>
              <p className="mt-2 text-sm text-ink/70">라우터와 코스 화면을 준비하는 중입니다.</p>
              <a
                href={`${import.meta.env.BASE_URL}library`}
                className="mt-4 inline-flex rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
              >
                코스 라이브러리 열기
              </a>
            </section>
          </main>
        }
      />
    </AppErrorBoundary>
  );
}

export default App;
