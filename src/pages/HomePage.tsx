import { Link } from "react-router-dom";
import { CourseCard } from "../components/CourseCard";
import { useCourseLibrary } from "../hooks/useCourseLibrary";

export function HomePage() {
  const { isReady, continueCourse, recommendedCourses, courses, completedCount, totalCount } =
    useCourseLibrary();

  if (!isReady) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">코스 라이브러리를 불러오는 중...</p>
      </section>
    );
  }

  const previewCourses = courses.slice(0, 4);

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Continue</p>
            <h2 className="display-font mt-2 text-3xl font-bold leading-tight text-ink">
              다음에 할 것이 바로 보이게
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              이어하기는 가장 먼저 진행할 코스를 가리킵니다. 아직 시작한 기록이 없으면 첫 코스를
              기본 시작점으로 안내합니다.
            </p>
          </div>
          <div className="rounded-[22px] bg-shell px-4 py-3 text-center">
            <p className="text-xs font-medium text-ink/45">완료 코스</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {completedCount}
              <span className="text-sm font-medium text-ink/45">/{totalCount}</span>
            </p>
          </div>
        </div>

        {continueCourse && (
          <div className="mt-5">
            <CourseCard course={continueCourse} />
            <div className="mt-4 flex gap-3">
              <Link
                to="/library"
                className="flex-1 rounded-2xl bg-ink px-4 py-4 text-center text-base font-semibold text-white"
              >
                이어하기
              </Link>
              <Link
                to="/library"
                className="rounded-2xl bg-sand px-4 py-4 text-center text-base font-semibold text-ink"
              >
                전체 코스
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Recommended</p>
            <h2 className="display-font mt-1 text-2xl font-bold text-ink">오늘의 추천</h2>
          </div>
          <Link to="/library" className="text-sm font-semibold text-coral">
            모두 보기
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {recommendedCourses.map((course) => (
            <CourseCard key={course.id} course={course} compact />
          ))}
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Preview</p>
            <h2 className="display-font mt-1 text-2xl font-bold text-ink">전체 코스 미리보기</h2>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink/60">
            27 Courses
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {previewCourses.map((course) => (
            <CourseCard key={course.id} course={course} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
