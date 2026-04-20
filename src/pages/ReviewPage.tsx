import { useReviewCenter } from "../hooks/useReviewCenter";

export function ReviewPage() {
  const { isReady, error, reviewEntries, weakCards, recentStudy, dismissReviewEntry } = useReviewCenter();

  if (!isReady) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">복습 큐를 준비하고 있습니다.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Review</p>
        <h2 className="display-font mt-2 text-3xl font-bold text-ink">틀린 문제와 약한 카드</h2>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          앱을 다시 켜도 남아 있는 복습 큐입니다. 최근 틀린 카드와 자주 약했던 카드를 따로 모아 보여 줍니다.
        </p>
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
      </section>

      <ReviewSection title="틀린 문제" items={reviewEntries} actionLabel="큐에서 제거" onAction={dismissReviewEntry} />
      <ReviewSection title="약한 카드" items={weakCards} />
      <ReviewSection title="최근 학습" items={recentStudy} />
    </div>
  );
}

function ReviewSection({
  title,
  items,
  actionLabel,
  onAction
}: {
  title: string;
  items: Array<{
    id: string;
    front: string;
    courseId: string;
    wrongCount: number;
    quizType: string;
  }>;
  actionLabel?: string;
  onAction?: (id: string) => void | Promise<void>;
}) {
  return (
    <section className="rounded-[30px] bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <span className="rounded-full bg-shell px-3 py-1 text-xs font-semibold text-ink/60">
          {items.length} items
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={item.id} className="rounded-[22px] bg-shell p-4">
              <p className="text-sm font-semibold text-ink">{item.front}</p>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-ink/55">
                <span>{item.courseId}</span>
                <span>{item.quizType}</span>
                <span>wrong {item.wrongCount}</span>
              </div>
              {actionLabel && onAction ? (
                <button
                  type="button"
                  onClick={() => {
                    void onAction(item.id);
                  }}
                  className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink"
                >
                  {actionLabel}
                </button>
              ) : null}
            </article>
          ))
        ) : (
          <p className="text-sm leading-6 text-ink/55">아직 이 섹션에 저장된 카드가 없습니다.</p>
        )}
      </div>
    </section>
  );
}
