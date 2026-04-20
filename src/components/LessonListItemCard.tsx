import type { LessonListItem } from "../types/course";

interface LessonListItemCardProps {
  lesson: LessonListItem;
  isCurrent?: boolean;
  onOpen: (lesson: LessonListItem) => void;
}

export function LessonListItemCard({
  lesson,
  isCurrent = false,
  onOpen
}: LessonListItemCardProps) {
  const statusLabel = lesson.status === "completed"
    ? "완료"
    : lesson.status === "in_progress"
      ? "진행 중"
      : lesson.status === "locked"
        ? "잠금"
        : "시작 가능";

  return (
    <button
      type="button"
      disabled={lesson.isLocked}
      onClick={() => onOpen(lesson)}
      className={`w-full rounded-[26px] border p-4 text-left transition ${
        lesson.isLocked
          ? "border-transparent bg-slate-100 text-ink/40"
          : isCurrent
            ? "border-ocean/30 bg-ocean/10 text-ink shadow-soft"
            : "border-black/5 bg-white text-ink shadow-soft"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sand px-3 py-1 text-[11px] font-semibold text-ink/70">
              Lesson {lesson.order}
            </span>
            {isCurrent && (
              <span className="rounded-full bg-ocean px-3 py-1 text-[11px] font-semibold text-white">
                지금 여기
              </span>
            )}
          </div>

          <h4 className="mt-3 text-lg font-bold leading-7">{lesson.coreTopic}</h4>
          <p className="mt-2 text-sm leading-6 text-ink/68">{lesson.representativeSentence}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            lesson.isLocked
              ? "bg-ink text-white"
              : lesson.status === "completed"
                ? "bg-mint text-ink"
                : lesson.status === "in_progress"
                  ? "bg-coral text-white"
                  : "bg-shell text-ink/70"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge active={lesson.canListen} label="듣기" />
          <Badge active={lesson.canQuiz} label="퀴즈" />
          <Badge active label={`${lesson.cardsCount} cards`} />
        </div>
        <p className="text-sm font-semibold text-ink/55">{Math.round(lesson.completionRate * 100)}%</p>
      </div>
    </button>
  );
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-sand text-ink" : "bg-slate-100 text-ink/35"
      }`}
    >
      {label}
    </span>
  );
}
