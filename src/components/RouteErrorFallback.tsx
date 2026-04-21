import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { EmptyState } from "./EmptyState";

export function RouteErrorFallback() {
  const error = useRouteError();

  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "알 수 없는 라우팅 오류가 발생했습니다.";

  return (
    <EmptyState
      title="페이지를 열 수 없습니다"
      description={`요청한 경로를 표시하지 못했습니다. (${description})`}
      actionLabel="홈으로 이동"
      onAction={() => {
        window.location.href = import.meta.env.BASE_URL;
      }}
    />
  );
}
