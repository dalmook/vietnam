import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "library",
        element: <LibraryPage />
      }
    ]
  }
], {
  basename: import.meta.env.BASE_URL
});
