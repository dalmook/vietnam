import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { BuildInfoCard } from "../components/BuildInfoCard";
import { FeaturePanelBoundary } from "../components/FeaturePanelBoundary";
import { BUILD_TIMESTAMP, getLocationSnapshot } from "../lib/buildInfo";

const HomeCourseFeaturePanel = lazy(() => import("../components/HomeCourseFeaturePanel").then((module) => ({ default: module.HomeCourseFeaturePanel })));

export function HomePage() {
  const location = getLocationSnapshot();

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-mint/35 bg-mint/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">Home Static Card</p>
        <h2 className="mt-2 text-lg font-bold text-ink">Vietnam Flow</h2>
        <p className="mt-1 text-sm font-semibold text-ink">GitHub Pages 진단 모드 · 앱이 실행 중입니다</p>
        <ul className="mt-2 space-y-1 text-xs text-ink/75">
          <li>현재 경로: {location.pathname}</li>
          <li>현재 해시: {location.hash || "(empty)"}</li>
          <li>빌드 시간: {BUILD_TIMESTAMP}</li>
        </ul>
        <div className="mt-3 flex gap-2">
          <Link to="/library" className="inline-flex rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-white">
            라이브러리 이동
          </Link>
          <Link to="/review" className="inline-flex rounded-xl bg-sand px-3 py-2 text-xs font-semibold text-ink">
            복습 이동
          </Link>
        </div>
      </section>

      <BuildInfoCard />

      <FeaturePanelBoundary>
        <Suspense
          fallback={
            <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
              <p className="text-sm font-semibold text-ink">기능 패널을 준비하고 있습니다.</p>
            </section>
          }
        >
          <HomeCourseFeaturePanel />
        </Suspense>
      </FeaturePanelBoundary>
    </div>
  );
}
