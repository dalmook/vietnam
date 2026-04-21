import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: undefined
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = import.meta.env.BASE_URL;
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="safe-pb min-h-screen bg-shell px-4 pb-24 pt-6">
          <section className="rounded-[30px] bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">Runtime Error</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">화면을 불러오지 못했습니다</h1>
            <p className="mt-3 text-sm leading-6 text-ink/70">일부 기능 실패가 발생해도 앱 복구 동작을 유지합니다.</p>
            {this.state.message ? (
              <pre className="mt-4 overflow-auto rounded-2xl bg-shell p-4 text-left text-xs text-ink/75">
                {this.state.message.slice(0, 240)}
              </pre>
            ) : null}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 rounded-2xl bg-sand px-4 py-3 text-sm font-semibold text-ink"
              >
                홈으로 돌아가기
              </button>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
