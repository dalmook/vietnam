interface SessionProgressBarProps {
  progressRate: number;
  lessonProgressRate: number;
  currentCardNumber: number;
  totalCards: number;
  currentStepNumber: number;
  totalSteps: number;
  stepLabel: string;
}

export function SessionProgressBar({
  progressRate,
  lessonProgressRate,
  currentCardNumber,
  totalCards,
  currentStepNumber,
  totalSteps,
  stepLabel
}: SessionProgressBarProps) {
  return (
    <section className="rounded-[28px] bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ocean">Lesson Progress</p>
          <p className="mt-1 text-base font-semibold text-ink">
            카드 {currentCardNumber}/{totalCards}
            <span className="ml-2 text-sm font-medium text-ink/45">
              step {currentStepNumber}/{totalSteps}
            </span>
          </p>
        </div>
        <span className="rounded-full bg-shell px-3 py-1 text-xs font-semibold text-ink/65">
          {stepLabel}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-2 rounded-full bg-shell">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ocean via-mint to-coral transition-all"
            style={{ width: `${Math.max(6, Math.round(progressRate * 100))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-ink/45">
          <span>세부 step 진행률</span>
          <span>{Math.round(progressRate * 100)}%</span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="h-2 rounded-full bg-shell">
          <div
            className="h-full rounded-full bg-ink transition-all"
            style={{ width: `${Math.max(6, Math.round(lessonProgressRate * 100))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-ink/45">
          <span>현재 lesson 완료율</span>
          <span>{Math.round(lessonProgressRate * 100)}%</span>
        </div>
      </div>
    </section>
  );
}
