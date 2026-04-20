import {
  getCourseCompletion,
  getReviewCount,
  isCourseUnlocked
} from "../domain/progress";
import type { CourseData, CourseManifest, CourseProgress } from "../domain/types";

interface HomeScreenProps {
  catalog: CourseManifest[];
  progressByCourse: Record<string, CourseProgress>;
  activeCourseId?: string;
  recommendedCourseId?: string;
  courseCache: Record<string, CourseData>;
  onOpenCourse: (courseId: string) => void | Promise<void>;
}

export function HomeScreen({
  catalog,
  progressByCourse,
  activeCourseId,
  recommendedCourseId,
  courseCache,
  onOpenCourse
}: HomeScreenProps) {
  const continueId = activeCourseId ?? recommendedCourseId ?? catalog[0]?.id;
  const continueManifest = catalog.find((course) => course.id === continueId) ?? catalog[0];
  const recommendedManifest =
    catalog.find((course) => course.id === recommendedCourseId) ?? catalog[1] ?? catalog[0];
  const starterManifest = catalog[0];

  const totalReview = catalog.reduce((sum, course) => {
    const cached = courseCache[course.id];
    const progress = progressByCourse[course.id];
    return sum + (cached && progress ? getReviewCount(cached, progress) : 0);
  }, 0);

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-ink p-5 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Continue</p>
        <h2 className="display-font mt-3 text-3xl font-bold leading-tight">
          오늘도 짧게, 정확하게, 성조까지 귀에 남게.
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/72">
          내장된 27개 PDF 코스를 기반으로 바로 학습을 시작할 수 있습니다. 파일을 고르는 도구가
          아니라, 흐름대로 따라가는 베트남어 코스 앱입니다.
        </p>

        {continueManifest && (
          <button
            type="button"
            onClick={() => onOpenCourse(continueManifest.id)}
            className="mt-5 w-full rounded-2xl bg-coral px-4 py-4 text-base font-semibold text-white"
          >
            이어하기 · {continueManifest.title}
          </button>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <FeatureCard
          eyebrow="추천 코스"
          title={recommendedManifest?.title ?? "추천 코스 준비 중"}
          detail={recommendedManifest?.subtitle ?? "내장 코스를 먼저 열어 보세요."}
          onClick={recommendedManifest ? () => onOpenCourse(recommendedManifest.id) : undefined}
        />
        <FeatureCard
          eyebrow="기본 코스"
          title={starterManifest?.title ?? "코스 준비 중"}
          detail="1강부터 순서대로 시작"
          onClick={starterManifest ? () => onOpenCourse(starterManifest.id) : undefined}
        />
      </section>

      <section className="rounded-[30px] bg-white/90 p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Daily Snapshot</p>
            <h3 className="display-font mt-1 text-2xl font-bold text-ink">오늘의 흐름</h3>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink/70">
            복습 {totalReview}개
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {catalog.slice(0, 5).map((course) => {
            const cached = courseCache[course.id];
            const progress = progressByCourse[course.id];
            const unlocked = isCourseUnlocked(course, catalog, progressByCourse);
            const completion = cached ? Math.round(getCourseCompletion(cached, progress) * 100) : 0;

            return (
              <button
                key={course.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onOpenCourse(course.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left ${
                  unlocked ? "bg-sand text-ink" : "bg-slate-100 text-ink/40"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">{course.title}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    {course.level} · {course.estimatedMinutes}분
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ocean">
                  {completion}%
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  eyebrow,
  title,
  detail,
  onClick
}: {
  eyebrow: string;
  title: string;
  detail: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[28px] bg-white/90 p-4 text-left shadow-soft"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">{eyebrow}</p>
      <h3 className="mt-2 text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/68">{detail}</p>
    </button>
  );
}
