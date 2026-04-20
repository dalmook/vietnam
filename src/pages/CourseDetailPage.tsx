import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChapterLessonList } from "../components/ChapterLessonList";
import { useCourseDetail } from "../hooks/useCourseDetail";
import { buildCourseDetailPath, buildLessonPath } from "../lib/lessonRoutes";
import type { LessonListItem } from "../types/course";

export function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    isReady,
    isExtracting,
    error,
    course,
    detail,
    document,
    startCourse,
    continueCourse,
    reviewCourse,
    markLessonEntered,
    hasUnsupportedDocument,
    hasFailedDocument
  } = useCourseDetail(courseId);

  const statusMessage = useMemo(() => {
    if (hasUnsupportedDocument || hasFailedDocument) {
      return document?.errorMessage;
    }

    return error;
  }, [document?.errorMessage, error, hasFailedDocument, hasUnsupportedDocument]);

  const openLesson = async (lesson: LessonListItem) => {
    if (lesson.isLocked || !courseId) {
      return;
    }

    await markLessonEntered(lesson);
    navigate(buildLessonPath(courseId, lesson.id));
  };

  if (!isReady || !course) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">코스 상세를 준비하고 있습니다.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[32px] bg-ink text-white shadow-soft">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(255,215,114,0.32),_transparent_30%),linear-gradient(135deg,_rgba(161,240,216,0.18),_transparent_45%)] p-5">
          <Link to="/library" className="text-sm font-semibold text-white/70">
            코스 라이브러리
          </Link>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-mint">
                {course.level}
              </span>
              <h2 className="display-font mt-3 text-3xl font-bold leading-tight">{course.title}</h2>
              <p className="mt-2 text-sm font-medium text-white/70">{course.subtitle}</p>
              <p className="mt-4 text-sm leading-6 text-white/78">{course.description}</p>
            </div>

            <div className="rounded-[24px] bg-white/10 px-4 py-3 text-center backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">완료율</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {Math.round((detail?.completionRate ?? course.completionRate) * 100)}%
              </p>
            </div>
          </div>

          <div className="mt-5 h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mint via-gold to-coral transition-all"
              style={{ width: `${Math.round((detail?.completionRate ?? course.completionRate) * 100)}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroMetric label="총 lesson" value={`${detail?.lessonCount ?? "-"}`} />
            <HeroMetric label="예상 시간" value={detail?.estimatedHoursText ?? `${course.estimatedMinutes}분`} />
            <HeroMetric label="완료 lesson" value={`${detail?.completedLessons ?? 0}`} />
            <HeroMetric label="카드 수" value={`${detail?.totalCards ?? "-"}`} />
          </div>

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={() => {
                void startCourse().then((lesson) => {
                  if (lesson && courseId) {
                    navigate(buildLessonPath(courseId, lesson.id));
                  }
                });
              }}
              disabled={!detail}
              className="rounded-[24px] bg-coral px-4 py-4 text-base font-semibold text-white disabled:opacity-50"
            >
              처음부터 시작
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  void continueCourse().then((lesson) => {
                    if (lesson && courseId) {
                      navigate(buildLessonPath(courseId, lesson.id));
                    }
                  });
                }}
                disabled={!detail?.continueLesson}
                className="rounded-[24px] bg-white px-4 py-4 text-base font-semibold text-ink disabled:opacity-50"
              >
                이어하기
              </button>

              <button
                type="button"
                onClick={() => {
                  void reviewCourse().then((lesson) => {
                    if (lesson && courseId) {
                      navigate(buildLessonPath(courseId, lesson.id));
                    }
                  });
                }}
                disabled={!detail?.reviewLesson}
                className="rounded-[24px] bg-gold px-4 py-4 text-base font-semibold text-ink disabled:opacity-50"
              >
                복습하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {isExtracting && (
        <section className="rounded-[26px] bg-white p-4 text-sm font-medium text-ink shadow-soft">
          PDF에서 lesson 흐름을 만드는 중입니다. 잠시만 기다려 주세요.
        </section>
      )}

      {statusMessage && (
        <section className="rounded-[26px] bg-coral/10 p-4 text-sm leading-6 text-ink shadow-soft">
          {statusMessage}
        </section>
      )}

      {detail ? (
        <>
          <section className="rounded-[30px] bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Learning Path</p>
                <h3 className="display-font mt-1 text-2xl font-bold text-ink">지금 여기까지 왔어요</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">
                  현재 lesson, 다음 lesson, 복습할 lesson을 한눈에 확인할 수 있습니다.
                </p>
              </div>
              <Link
                to={buildCourseDetailPath(course.id)}
                className="rounded-full bg-shell px-3 py-2 text-xs font-semibold text-ink/65"
              >
                {detail.chapterCount} chapters
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ProgressTile
                tone="mint"
                label="현재 학습 중"
                value={detail.currentLesson?.coreTopic ?? "시작할 lesson을 선택해 주세요"}
                helper={detail.currentLesson?.representativeSentence ?? "학습을 시작하면 위치가 기록됩니다."}
              />
              <ProgressTile
                tone="ocean"
                label="다음 lesson"
                value={detail.nextLesson?.coreTopic ?? "남은 lesson을 정리했어요"}
                helper={detail.nextLesson?.representativeSentence ?? "현재 lesson을 마치면 자동으로 이어집니다."}
              />
              <ProgressTile
                tone="gold"
                label="복습 추천"
                value={detail.reviewLesson?.coreTopic ?? "아직 복습할 lesson이 없어요"}
                helper={detail.reviewLesson?.representativeSentence ?? "첫 lesson을 완료하면 복습 동선이 열립니다."}
              />
            </div>
          </section>

          <ChapterLessonList
            chapters={detail.chapters}
            currentLessonId={detail.currentLesson?.id}
            onOpenLesson={openLesson}
          />
        </>
      ) : (
        <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
          <p className="text-lg font-semibold text-ink">아직 lesson 흐름을 만들지 못했습니다.</p>
        </section>
      )}
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
      <p className="text-xs font-medium text-white/65">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function ProgressTile({
  label,
  value,
  helper,
  tone
}: {
  label: string;
  value: string;
  helper: string;
  tone: "mint" | "ocean" | "gold";
}) {
  const toneClassMap = {
    mint: "bg-mint/30",
    ocean: "bg-ocean/18",
    gold: "bg-gold/35"
  };

  return (
    <div className={`rounded-[24px] p-4 ${toneClassMap[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">{label}</p>
      <p className="mt-2 text-base font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-ink/65">{helper}</p>
    </div>
  );
}
