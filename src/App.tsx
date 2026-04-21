import { HashRouter } from "react-router-dom";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { AppShell } from "./components/AppShell";
import { BottomTabBar } from "./components/BottomTabBar";
import { AppRoutes } from "./router";

function App() {
  return (
    <AppErrorBoundary>
      <AppShell>
        <HashRouter>
          <AppRoutes />
          <BottomTabBar />
        </HashRouter>
      </AppShell>
    </AppErrorBoundary>
  );
}

export default App;
