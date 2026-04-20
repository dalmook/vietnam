import { CourseCard } from "../components/CourseCard";
import { useCourseLibrary } from "../hooks/useCourseLibrary";

export function LibraryPage() {
  const { isReady, courses, completedCount, totalCount } = useCourseLibrary();

  if (!isReady) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">코스 정보를 불러오는 중...</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Library</p>
            <h2 className="display-font mt-2 text-3xl font-bold text-ink">기본 내장 27개 코스</h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              각 코스는 하나의 내장 PDF를 기반으로 운영됩니다. 난이도, 예상 학습시간, 완료율,
              잠금 상태를 한 번에 확인할 수 있습니다.
            </p>
          </div>
          <div className="rounded-[22px] bg-shell px-4 py-3 text-center">
            <p className="text-xs font-medium text-ink/45">완료</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {completedCount}
              <span className="text-sm font-medium text-ink/45">/{totalCount}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
