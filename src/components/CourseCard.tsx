import type { CourseViewModel } from "../types/course";

interface CourseCardProps {
  course: CourseViewModel;
  compact?: boolean;
  actionLabel?: string;
}

const themeClassMap: Record<CourseViewModel["coverTheme"], string> = {
  mint: "from-[#A1F0D8] to-[#E8FFF7]",
  coral: "from-[#FF9B80] to-[#FFE7DD]",
  gold: "from-[#FFD772] to-[#FFF2C8]",
  ocean: "from-[#90E7E9] to-[#E3FCFF]",
  indigo: "from-[#B5C2FF] to-[#EEF1FF]",
  sunset: "from-[#FFC1A1] to-[#FFF0E7]"
};

const levelClassMap: Record<CourseViewModel["level"], string> = {
  Starter: "bg-white/80 text-ocean",
  Core: "bg-white/80 text-coral",
  Builder: "bg-white/80 text-ink",
  Advanced: "bg-white/80 text-indigo-700"
};

export function CourseCard({ course, compact = false, actionLabel }: CourseCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-[28px] bg-white shadow-soft ${
        compact ? "" : "min-h-[220px]"
      }`}
    >
      <div className={`bg-gradient-to-br ${themeClassMap[course.coverTheme]} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-white">
                {course.order.toString().padStart(2, "0")}
              </span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${levelClassMap[course.level]}`}>
                {course.level}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-bold leading-tight text-ink">{course.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">{course.subtitle}</p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              course.isAvailable ? "bg-white/75 text-ink" : "bg-ink text-white"
            }`}
          >
            {course.isAvailable ? "OPEN" : "LOCK"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {!compact && <p className="text-sm leading-6 text-ink/70">{course.description}</p>}

        <div className="flex flex-wrap gap-2">
          {course.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <span key={tag} className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink/70">
              #{tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-shell p-3">
          <Metric label="예상" value={`${course.estimatedMinutes}분`} />
          <Metric label="완료율" value={`${Math.round(course.completionRate * 100)}%`} />
          <Metric label="상태" value={course.isCompleted ? "완료" : course.isAvailable ? "진행" : "잠김"} />
        </div>

        <div className="h-2 rounded-full bg-shell">
          <div
            className="h-full rounded-full bg-ink transition-all"
            style={{ width: `${Math.round(course.completionRate * 100)}%` }}
          />
        </div>

        {actionLabel && (
          <div className="rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white">
            {actionLabel}
          </div>
        )}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-medium text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
