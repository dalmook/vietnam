import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LessonPlayer } from "../components/LessonPlayer";
import { useCourseDetail } from "../hooks/useCourseDetail";
import { findLessonInDetail } from "../lib/courseOutline";
import { buildCourseDetailPath } from "../lib/lessonRoutes";

export function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isReady, detail, document, markLessonCompleted } = useCourseDetail(courseId);

  const lesson = useMemo(
    () => (detail && lessonId ? findLessonInDetail(detail, lessonId) : undefined),
    [detail, lessonId]
  );

  const lessonCards = useMemo(() => {
    if (!detail || !lesson || !document) {
      return [];
    }

    const allLessons = detail.chapters.flatMap((chapter) => chapter.lessons);
    const startIndex = allLessons
      .slice(0, lesson.order - 1)
      .reduce((sum, item) => sum + item.cardsCount, 0);

    return document.cards.slice(startIndex, startIndex + lesson.cardsCount);
  }, [detail, document, lesson]);

  if (!isReady || !detail || !lesson) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">lesson player를 준비하고 있습니다.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[32px] bg-ink p-5 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">Lesson Player</p>
        <h2 className="display-font mt-2 text-3xl font-bold leading-tight">{lesson.coreTopic}</h2>
        <p className="mt-3 text-sm leading-6 text-white/75">{lesson.representativeSentence}</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <LessonMetric label="cards" value={`${lesson.cardsCount}`} />
          <LessonMetric label="듣기" value={lesson.canListen ? "핵심 기능" : "준비 중"} />
          <LessonMetric label="퀴즈" value={lesson.canQuiz ? "가능" : "셀프 체크"} />
        </div>
      </section>

      <LessonPlayer
        lesson={lesson}
        cards={lessonCards}
        onComplete={(result, cards) => markLessonCompleted(lesson.id, result, cards)}
        onExit={() => navigate(buildCourseDetailPath(courseId ?? detail.id))}
      />
    </div>
  );
}

function LessonMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-medium text-white/65">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
