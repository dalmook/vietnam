import { Link } from "react-router-dom";
import { CourseCard } from "./CourseCard";
import { SafeLoader } from "./SafeLoader";
import { useCourseLibrary } from "../hooks/useCourseLibrary";

export function HomeCourseFeaturePanel() {
  const { isReady, error, continueCourse, continueLessonId, recentCourses, recommendedCourses, courses, completedCount, totalCount, rewards } =
    useCourseLibrary();

  const previewCourses = courses.slice(0, 4);

  return (
    <SafeLoader
      isReady={isReady}
      error={error}
      loadingText="코스 데이터를 준비하고 있습니다."
      errorTitle="일부 기능을 불러오지 못했습니다"
      errorDescription="IndexedDB 또는 학습 데이터 복구 실패가 발생했습니다. 상단 진단 카드는 계속 표시됩니다."
    >
      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Continue</p>
            <h2 className="display-font mt-2 text-3xl font-bold leading-tight text-ink">앱을 다시 켜도 이어집니다</h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">마지막 학습 상태를 로컬 저장소에서 복구합니다.</p>
          </div>
          <div className="rounded-[22px] bg-shell px-4 py-3 text-center">
            <p className="text-xs font-medium text-ink/45">XP / streak</p>
            <p className="mt-1 text-lg font-bold text-ink">
              {rewards.totalXp}
              <span className="ml-1 text-sm font-medium text-ink/45">xp</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-ocean">{rewards.streak}일 연속</p>
          </div>
        </div>

        {continueCourse ? (
          <div className="mt-5">
            <CourseCard course={continueCourse} actionLabel="이어하기" />
            <div className="mt-4 flex gap-3">
              <Link
                to={continueLessonId ? `/course/${continueCourse.id}/lesson/${continueLessonId}` : `/course/${continueCourse.id}`}
                className="flex-1 rounded-2xl bg-ink px-4 py-4 text-center text-base font-semibold text-white"
              >
                이어하기
              </Link>
              <Link to="/review" className="rounded-2xl bg-sand px-4 py-4 text-center text-base font-semibold text-ink">
                복습 보기
              </Link>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-ink/60">아직 저장된 이어하기 코스가 없습니다.</p>
        )}
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Recent</p>
            <h2 className="display-font mt-1 text-2xl font-bold text-ink">최근 학습</h2>
          </div>
          <div className="rounded-full bg-shell px-3 py-1 text-xs font-semibold text-ink/60">완료 {completedCount}/{totalCount}</div>
        </div>

        <div className="mt-4 space-y-3">
          {recentCourses.length > 0 ? (
            recentCourses.map((course) => (
              <Link key={course.id} to={`/course/${course.id}`} className="block">
                <CourseCard course={course} compact actionLabel="다시 열기" />
              </Link>
            ))
          ) : (
            <p className="text-sm leading-6 text-ink/60">최근 학습 기록이 아직 없습니다.</p>
          )}
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Recommended</p>
            <h2 className="display-font mt-1 text-2xl font-bold text-ink">추천 코스</h2>
          </div>
          <Link to="/library" className="text-sm font-semibold text-coral">
            모두 보기
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {recommendedCourses.map((course) => (
            <Link key={course.id} to={`/course/${course.id}`} className="block">
              <CourseCard course={course} compact actionLabel="코스 열기" />
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Preview</p>
            <h2 className="display-font mt-1 text-2xl font-bold text-ink">전체 코스 미리보기</h2>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink/60">27 Courses</span>
        </div>

        <div className="mt-4 grid gap-3">
          {previewCourses.map((course) => (
            <Link key={course.id} to={`/course/${course.id}`} className="block">
              <CourseCard course={course} compact actionLabel="코스 보기" />
            </Link>
          ))}
        </div>
      </section>
    </SafeLoader>
  );
}
