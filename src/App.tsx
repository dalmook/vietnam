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
            <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
              <p className="text-lg font-semibold text-ink">앱 라우터를 초기화하고 있습니다.</p>
            </section>
          </main>
        }
      />
    </AppErrorBoundary>
  );
}

export default App;
