import { getReviewCount } from "../domain/progress";
import type { CourseData, CourseManifest, CourseProgress } from "../domain/types";

interface ReviewScreenProps {
  catalog: CourseManifest[];
  progressByCourse: Record<string, CourseProgress>;
  courseCache: Record<string, CourseData>;
  onOpenCourse: (courseId: string) => void | Promise<void>;
}

export function ReviewScreen({
  catalog,
  progressByCourse,
  courseCache,
  onOpenCourse
}: ReviewScreenProps) {
  const dueCourses = catalog
    .map((course) => {
      const cached = courseCache[course.id];
      const progress = progressByCourse[course.id];
      return {
        course,
        due: cached && progress ? getReviewCount(cached, progress) : 0
      };
    })
    .filter((item) => item.due > 0)
    .sort((a, b) => b.due - a.due);

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-white/92 p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Review</p>
        <h2 className="display-font mt-2 text-3xl font-bold text-ink">복습 큐</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          오답과 이전 학습 이력을 기반으로 다시 들어야 할 카드를 모았습니다.
        </p>
      </section>

      {dueCourses.length === 0 ? (
        <section className="rounded-[28px] bg-white/90 p-6 text-center shadow-soft">
          <h3 className="text-xl font-bold text-ink">복습 대기 카드가 아직 없어요.</h3>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            먼저 기본 코스 몇 개를 학습하면 여기서 다시 꺼내 연습할 수 있습니다.
          </p>
        </section>
      ) : (
        dueCourses.map(({ course, due }) => (
          <button
            key={course.id}
            type="button"
            onClick={() => onOpenCourse(course.id)}
            className="w-full rounded-[28px] bg-white/90 p-4 text-left shadow-soft"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">
                  {course.theme}
                </p>
                <h3 className="mt-1 text-lg font-bold text-ink">{course.title}</h3>
                <p className="mt-2 text-sm text-ink/68">{course.subtitle}</p>
              </div>
              <div className="rounded-2xl bg-sand px-4 py-3 text-center">
                <p className="text-xs font-medium text-ink/55">복습 대기</p>
                <p className="mt-1 text-xl font-bold text-coral">{due}</p>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
