import {
  getCourseCompletion,
  isCourseUnlocked
} from "../domain/progress";
import type { CourseData, CourseManifest, CourseProgress } from "../domain/types";

interface CourseCatalogProps {
  catalog: CourseManifest[];
  progressByCourse: Record<string, CourseProgress>;
  courseCache: Record<string, CourseData>;
  onOpenCourse: (courseId: string) => void | Promise<void>;
}

export function CourseCatalog({
  catalog,
  progressByCourse,
  courseCache,
  onOpenCourse
}: CourseCatalogProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-white/92 p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Course Path</p>
        <h2 className="display-font mt-2 text-3xl font-bold text-ink">27개 기본 코스</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          PDF는 숨겨진 데이터 소스이고, 사용자는 코스를 따라가며 학습합니다. 각 코스는 카드형
          레슨으로 자동 분절됩니다.
        </p>
      </section>

      {catalog.map((course) => {
        const unlocked = isCourseUnlocked(course, catalog, progressByCourse);
        const cached = courseCache[course.id];
        const progress = progressByCourse[course.id];
        const completion = cached ? Math.round(getCourseCompletion(cached, progress) * 100) : 0;

        return (
          <button
            key={course.id}
            type="button"
            onClick={() => onOpenCourse(course.id)}
            disabled={!unlocked}
            className={`w-full rounded-[28px] p-4 text-left shadow-soft transition ${
              unlocked ? "bg-white/90" : "bg-slate-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">
                  {course.theme}
                </p>
                <h3 className={`mt-1 text-lg font-bold ${unlocked ? "text-ink" : "text-ink/45"}`}>
                  {course.order}. {course.title}
                </h3>
                <p className={`mt-2 text-sm leading-6 ${unlocked ? "text-ink/68" : "text-ink/40"}`}>
                  {course.subtitle}
                </p>
              </div>

              <div className="rounded-2xl bg-sand px-3 py-2 text-center">
                <p className="text-xs font-medium text-ink/55">{course.level}</p>
                <p className="mt-1 text-lg font-bold text-ink">{completion}%</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs font-semibold">
              <span className={unlocked ? "text-ink/55" : "text-ink/35"}>
                {course.estimatedMinutes}분 · {progress?.completed ? "완료" : "진행 중"}
              </span>
              <span className={unlocked ? "text-coral" : "text-ink/35"}>
                {unlocked ? "학습 열기" : "이전 코스부터"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
