import { Route, Routes } from "react-router-dom";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { ExtractionDebugPage } from "./pages/ExtractionDebugPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { LessonPage } from "./pages/LessonPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";

export function AppRoutes() {
  return (
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
  );
}
