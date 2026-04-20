import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";

interface SafeLoaderProps {
  isReady: boolean;
  error?: string;
  loadingText?: string;
  errorTitle?: string;
  errorDescription?: string;
  children: ReactNode;
}

export function SafeLoader({
  isReady,
  error,
  loadingText = "콘텐츠를 준비하고 있습니다.",
  errorTitle = "데이터를 불러오지 못했습니다.",
  errorDescription,
  children
}: SafeLoaderProps) {
  if (!isReady) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">{loadingText}</p>
      </section>
    );
  }

  if (error) {
    return (
      <EmptyState
        title={errorTitle}
        description={errorDescription ?? `오류: ${error}`}
        actionLabel="다시 시도"
        onAction={() => window.location.reload()}
      />
    );
  }

  return <>{children}</>;
}
