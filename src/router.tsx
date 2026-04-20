import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { ExtractionDebugPage } from "./pages/ExtractionDebugPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { LessonPage } from "./pages/LessonPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppShell />,
      children: [
        {
          index: true,
          element: <HomePage />
        },
        {
          path: "review",
          element: <ReviewPage />
        },
        {
          path: "library",
          element: <LibraryPage />
        },
        {
          path: "settings",
          element: <SettingsPage />
        },
        {
          path: "course/:courseId",
          element: <CourseDetailPage />
        },
        {
          path: "course/:courseId/lesson/:lessonId",
          element: <LessonPage />
        },
        {
          path: "debug/extract",
          element: <ExtractionDebugPage />
        }
      ]
    }
  ],
  {
    basename: import.meta.env.BASE_URL
  }
);
