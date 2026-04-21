import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";

const LibraryPage = lazy(() => import("./pages/LibraryPage").then((module) => ({ default: module.LibraryPage })));
const ReviewPage = lazy(() => import("./pages/ReviewPage").then((module) => ({ default: module.ReviewPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage").then((module) => ({ default: module.CourseDetailPage })));
const LessonPage = lazy(() => import("./pages/LessonPage").then((module) => ({ default: module.LessonPage })));
const ExtractionDebugPage = lazy(() => import("./pages/ExtractionDebugPage").then((module) => ({ default: module.ExtractionDebugPage })));

function RouteLoadingFallback() {
  return (
    <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
      <p className="text-sm font-semibold text-ink">페이지를 준비하고 있습니다.</p>
    </section>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/course/:courseId" element={<CourseDetailPage />} />
        <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/debug/extract" element={<ExtractionDebugPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
}
