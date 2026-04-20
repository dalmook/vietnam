import { Outlet } from "react-router-dom";
import { BottomTabBar } from "./BottomTabBar";

export function AppShell() {
  return (
    <main className="safe-pb min-h-screen bg-shell px-4 pb-24 pt-4">
      <header className="overflow-hidden rounded-[32px] bg-ink px-5 py-6 text-white shadow-soft">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(255,215,114,0.22),_transparent_28%)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Vietnam Flow</p>
          <h1 className="display-font mt-2 text-4xl font-bold leading-tight">
            27개 PDF에서 만드는
            <br />
            베트남어 학습 흐름
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">
            파일 목록이 아니라, 바로 학습을 시작할 수 있는 모바일 언어학습 앱 흐름으로 코스를 정리합니다.
          </p>
        </div>
      </header>

      <section className="mt-4">
        <Outlet />
      </section>

      <BottomTabBar />
    </main>
  );
}
