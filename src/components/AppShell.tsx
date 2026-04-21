import type { ReactNode } from "react";
import { APP_VERSION, BUILD_TIMESTAMP, getLocationSnapshot } from "../lib/buildInfo";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = getLocationSnapshot();

  return (
    <main className="safe-pb min-h-screen bg-shell px-4 pb-24 pt-4">
      <section className="mb-3 rounded-2xl border border-mint/35 bg-white px-4 py-3 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean">App Diagnostics</p>
        <p className="mt-1 text-sm font-semibold text-ink">앱이 실행 중입니다</p>
        <ul className="mt-2 space-y-1 text-xs text-ink/70">
          <li>build timestamp: {BUILD_TIMESTAMP}</li>
          <li>pathname: {location.pathname}</li>
          <li>hash: {location.hash || "(empty)"}</li>
          <li>base url: {import.meta.env.BASE_URL}</li>
          <li>version: {APP_VERSION}</li>
        </ul>
      </section>

      <header className="overflow-hidden rounded-[32px] bg-ink px-5 py-6 text-white shadow-soft">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(255,215,114,0.22),_transparent_28%)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Vietnam Flow</p>
          <h1 className="display-font mt-2 text-4xl font-bold leading-tight">GitHub Pages 진단 모드</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">라우터 동작과 무관하게 이 AppShell은 항상 먼저 렌더링됩니다.</p>
        </div>
      </header>

      <section className="mt-4">{children}</section>
    </main>
  );
}
