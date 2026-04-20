import { Outlet } from "react-router-dom";
import { BottomTabBar } from "./BottomTabBar";

export function AppShell() {
  return (
    <main className="safe-pb min-h-screen bg-shell px-4 pb-24 pt-4">
      <header className="rounded-[32px] bg-ink px-5 py-6 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Vietnam Flow</p>
        <h1 className="display-font mt-2 text-4xl font-bold leading-tight">
          27개 기본 PDF 코스로 배우는 베트남어
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/72">
          파일 브라우저가 아니라, 바로 시작할 수 있는 순서형 코스 라이브러리입니다.
        </p>
      </header>

      <section className="mt-4">
        <Outlet />
      </section>

      <BottomTabBar />
    </main>
  );
}
