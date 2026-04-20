import type { LessonSessionResult } from "../types/lessonPlayer";

interface ResultSummaryProps {
  result: LessonSessionResult;
  totalXp: number;
}

export function ResultSummary({ result, totalXp }: ResultSummaryProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-white p-5 shadow-soft">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-20px] top-8 h-20 w-20 rounded-full bg-mint/35 blur-2xl" />
        <div className="absolute right-[-12px] top-12 h-24 w-24 animate-pulse rounded-full bg-gold/35 blur-2xl" />
        <div className="absolute bottom-6 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-ocean/15 blur-2xl" />
      </div>

      <div className="relative">
        <span className="inline-flex animate-pulse rounded-full bg-mint px-4 py-2 text-sm font-semibold text-ink">
          lesson 완료
        </span>
        <h3 className="display-font mt-4 text-3xl font-bold text-ink">학습 결과 요약</h3>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          오늘 세션 결과를 기준으로 임시 XP, streak, accuracy를 계산했습니다.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SummaryStat label="획득 XP" value={`+${result.xpEarned}`} tone="coral" />
          <SummaryStat label="연속 streak" value={`${result.streak}일`} tone="gold" />
          <SummaryStat label="정확도" value={`${Math.round(result.accuracy * 100)}%`} tone="ocean" />
          <SummaryStat label="완료 lesson" value={`${result.completedCount}`} tone="mint" />
        </div>

        <div className="mt-4 rounded-[24px] bg-shell p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">누적 XP</p>
            <p className="text-lg font-bold text-ink">{totalXp}</p>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-ink/65">
            <span>정답 {result.correctAnswers}개</span>
            <span>복습 카드 {result.reviewCardIds.length}개</span>
          </div>
        </div>

        {result.reviewCardIds.length > 0 && (
          <div className="mt-4 rounded-[24px] bg-coral/10 p-4">
            <p className="text-sm font-semibold text-ink">오답 복습 준비 완료</p>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              헷갈린 카드 {result.reviewCardIds.length}장을 따로 모아 다시 볼 수 있게 상태를 준비했습니다.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryStat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "coral" | "gold" | "ocean" | "mint";
}) {
  const toneClassMap = {
    coral: "bg-coral/12",
    gold: "bg-gold/22",
    ocean: "bg-ocean/12",
    mint: "bg-mint/32"
  };

  return (
    <div className={`rounded-[22px] p-4 ${toneClassMap[tone]}`}>
      <p className="text-xs font-medium text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
