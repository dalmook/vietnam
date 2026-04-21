import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

interface FeaturePanelBoundaryProps {
  children: ReactNode;
}

interface FeaturePanelBoundaryState {
  hasError: boolean;
  message?: string;
}

export class FeaturePanelBoundary extends Component<FeaturePanelBoundaryProps, FeaturePanelBoundaryState> {
  state: FeaturePanelBoundaryState = {
    hasError: false,
    message: undefined
  };

  static getDerivedStateFromError(error: Error): FeaturePanelBoundaryState {
    return {
      hasError: true,
      message: error.message
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Feature panel failed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-[28px] border border-coral/30 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">일부 기능을 불러오지 못했습니다</h2>
          <p className="mt-2 text-sm text-ink/70">핵심 진단 홈 카드는 유지되며, 기능 영역만 비활성화됩니다.</p>
          {this.state.message ? <p className="mt-2 text-xs text-coral">{this.state.message}</p> : null}
        </section>
      );
    }

    return this.props.children;
  }
}
