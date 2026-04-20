import type {
  ChapterListItem,
  CourseDetailViewModel,
  CourseManifest,
  CourseProgress,
  CourseViewModel,
  LessonListItem
} from "../types/course";
import type { ExtractedCourseDocument, LearningCard, LessonDraft } from "../types/extraction";

const LESSON_TARGET = 8;
const LESSON_MIN = 5;
const LESSON_MAX = 12;
const LESSONS_PER_CHAPTER = 4;

interface LessonAggregate {
  sourceDrafts: LessonDraft[];
  cards: LearningCard[];
}

export const buildCourseDetailViewModel = (
  course: CourseViewModel,
  document: ExtractedCourseDocument,
  progress?: CourseProgress
): CourseDetailViewModel => {
  const lessonBuckets = rebalanceLessons(document.lessons, document.cards);
  const completedLessonIds = new Set(progress?.completedLessonIds ?? []);
  const lessons: LessonListItem[] = lessonBuckets.map((bucket, index) => {
    const id = `${course.id}-lesson-${index + 1}`;
    const representativeSentence =
      bucket.cards.find((card) => card.type === "sentence" || card.type === "dialogue")?.front ??
      bucket.cards[0]?.front ??
      bucket.sourceDrafts[0]?.summary ??
      "대표 문장을 준비 중입니다.";
    const coreTopic = bucket.sourceDrafts[0]?.title ?? `Lesson ${index + 1}`;
    const isCompleted = completedLessonIds.has(id);
    const completionRate = isCompleted ? 1 : progress?.currentLessonId === id ? 0.35 : 0;

    return {
      id,
      chapterId: "",
      order: index + 1,
      title: `Lesson ${index + 1}`,
      coreTopic,
      representativeSentence,
      cardsCount: bucket.cards.length,
      canListen: bucket.cards.some((card) => card.type !== "note"),
      canQuiz: bucket.cards.filter((card) => card.type !== "note").length >= 4,
      completionRate,
      isLocked: false,
      isCompleted,
      status: "available"
    };
  });

  const unlockedLessons = applyLessonLocks(lessons, completedLessonIds);
  const chapters = buildChapters(unlockedLessons);
  const currentLesson = resolveCurrentLesson(unlockedLessons, progress?.currentLessonId);
  const reviewLesson = [...unlockedLessons]
    .filter((lesson) => lesson.isCompleted)
    .sort((a, b) => b.order - a.order)[0];
  const nextLesson = unlockedLessons.find(
    (lesson) => !lesson.isLocked && !lesson.isCompleted && lesson.id !== currentLesson?.id
  );
  const continueLesson = currentLesson ?? nextLesson ?? unlockedLessons[0];
  const completedLessons = completedLessonIds.size;

  return {
    ...course,
    chapterCount: chapters.length,
    lessonCount: unlockedLessons.length,
    totalCards: document.cards.length,
    chapters,
    currentLesson,
    nextLesson,
    reviewLesson,
    continueLesson,
    completedLessons,
    estimatedHoursText: formatEstimatedHours(course.estimatedMinutes)
  };
};

function rebalanceLessons(drafts: LessonDraft[], cards: LearningCard[]) {
  const cardsByDraftId = new Map<string, LearningCard[]>();

  cards.forEach((card) => {
    const group = cardsByDraftId.get(card.lessonDraftId);
    if (group) {
      group.push(card);
    } else {
      cardsByDraftId.set(card.lessonDraftId, [card]);
    }
  });

  const aggregates: LessonAggregate[] = [];
  let current: LessonAggregate = { sourceDrafts: [], cards: [] };

  drafts.forEach((draft) => {
    const nextCards = cardsByDraftId.get(draft.id) ?? [];
    const projectedSize = current.cards.length + nextCards.length;

    if (current.cards.length >= LESSON_MIN && projectedSize > LESSON_MAX) {
      aggregates.push(current);
      current = { sourceDrafts: [], cards: [] };
    }

    current.sourceDrafts.push(draft);
    current.cards.push(...nextCards);

    if (current.cards.length >= LESSON_TARGET) {
      aggregates.push(current);
      current = { sourceDrafts: [], cards: [] };
    }
  });

  if (current.cards.length > 0) {
    if (aggregates.length > 0 && current.cards.length < LESSON_MIN) {
      const previous = aggregates[aggregates.length - 1];
      previous.sourceDrafts.push(...current.sourceDrafts);
      previous.cards.push(...current.cards);
    } else {
      aggregates.push(current);
    }
  }

  if (aggregates.length === 0) {
    aggregates.push({
      sourceDrafts: drafts,
      cards
    });
  }

  return aggregates;
}

function applyLessonLocks(lessons: LessonListItem[], completedLessonIds: Set<string>) {
  return lessons.map((lesson, index) => {
    const previous = lessons[index - 1];
    const isLocked = index === 0 ? false : !completedLessonIds.has(previous.id);
    const isCompleted = completedLessonIds.has(lesson.id);
    const status: LessonListItem["status"] = isLocked
      ? "locked"
      : isCompleted
        ? "completed"
        : lesson.completionRate > 0
          ? "in_progress"
          : "available";

    return {
      ...lesson,
      isLocked,
      status
    };
  });
}

function buildChapters(lessons: LessonListItem[]): ChapterListItem[] {
  const chapters: ChapterListItem[] = [];

  for (let index = 0; index < lessons.length; index += LESSONS_PER_CHAPTER) {
    const chunk = lessons.slice(index, index + LESSONS_PER_CHAPTER);
    const chapterId = `chapter-${chapters.length + 1}`;
    const completedLessons = chunk.filter((lesson) => lesson.isCompleted).length;
    const totalLessons = chunk.length;
    const firstLesson = chunk[0];

    chapters.push({
      id: chapterId,
      order: chapters.length + 1,
      title: buildChapterTitle(chapters.length + 1, firstLesson?.coreTopic),
      description: buildChapterDescription(chunk),
      completionRate: completedLessons / Math.max(totalLessons, 1),
      completedLessons,
      totalLessons,
      isUnlocked: chunk.some((lesson) => !lesson.isLocked),
      lessons: chunk.map((lesson) => ({
        ...lesson,
        chapterId
      }))
    });
  }

  return chapters;
}

export const findLessonInDetail = (detail: CourseDetailViewModel, lessonId: string) =>
  detail.chapters.flatMap((chapter) => chapter.lessons).find((lesson) => lesson.id === lessonId);

export const getCourseManifestById = (
  courses: CourseManifest[],
  courseId: string | undefined
) => courses.find((course) => course.id === courseId);

function resolveCurrentLesson(lessons: LessonListItem[], currentLessonId?: string) {
  return (
    lessons.find((lesson) => lesson.id === currentLessonId && !lesson.isLocked) ??
    lessons.find((lesson) => lesson.status === "in_progress") ??
    lessons.find((lesson) => !lesson.isLocked && !lesson.isCompleted)
  );
}

function buildChapterTitle(order: number, lessonTopic?: string) {
  if (!lessonTopic) {
    return `Chapter ${order}`;
  }

  const title = lessonTopic.length > 18 ? `${lessonTopic.slice(0, 18)}...` : lessonTopic;
  return order === 1 ? `첫 감각 열기` : `${title} 묶음`;
}

function buildChapterDescription(lessons: LessonListItem[]) {
  const topics = lessons.slice(0, 2).map((lesson) => lesson.coreTopic);
  return topics.join(" · ") || "핵심 표현을 짧은 lesson 흐름으로 익힙니다.";
}

function formatEstimatedHours(minutes: number) {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return restMinutes > 0 ? `${hours}시간 ${restMinutes}분` : `${hours}시간`;
}
