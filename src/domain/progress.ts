import type {
  CardProgress,
  CourseData,
  CourseManifest,
  CourseProgress,
  LessonCard,
  QuizQuestion,
  ShellState,
  StudyCursor
} from "./types";

export const defaultShellState: ShellState = {
  activeTab: "home",
  customCatalog: [],
  progressByCourse: {},
  settings: {
    slowMode: false
  }
};

export const flattenCourseCards = (course: CourseData) =>
  course.chapters.flatMap((chapter) => chapter.lessons.flatMap((lesson) => lesson.cards));

export const getDefaultCourseProgress = (courseId: string): CourseProgress => {
  const now = new Date().toISOString();
  return {
    courseId,
    startedAt: now,
    updatedAt: now,
    currentLessonIndex: 0,
    currentCardIndex: 0,
    completed: false,
    completedLessons: [],
    cardProgressById: {}
  };
};

export const getCardProgress = (progress: CourseProgress, cardId: string): CardProgress =>
  progress.cardProgressById[cardId] ?? {
    cardId,
    mastery: 0,
    incorrectCount: 0
  };

export const getStudyCursor = (course: CourseData, progress?: CourseProgress): StudyCursor => {
  const safeProgress = progress ?? getDefaultCourseProgress(course.id);
  const lessons = course.chapters[0]?.lessons ?? [];
  const lessonIndex = Math.min(safeProgress.currentLessonIndex, Math.max(lessons.length - 1, 0));
  const currentLesson = lessons[lessonIndex];
  const cardIndex = Math.min(
    safeProgress.currentCardIndex,
    Math.max((currentLesson?.cards.length ?? 1) - 1, 0)
  );

  return {
    lessonIndex,
    cardIndex
  };
};

export const applyCardReview = (
  course: CourseData,
  progress: CourseProgress | undefined,
  card: LessonCard,
  mastered: boolean
) => {
  const current = progress ?? getDefaultCourseProgress(course.id);
  const lessons = course.chapters[0]?.lessons ?? [];
  const cursor = getStudyCursor(course, current);
  const lesson = lessons[cursor.lessonIndex];
  const now = new Date().toISOString();
  const previous = getCardProgress(current, card.id);
  const nextCardProgress: CardProgress = {
    cardId: card.id,
    mastery: Math.max(0, Math.min(5, previous.mastery + (mastered ? 1 : -1))),
    incorrectCount: previous.incorrectCount + (mastered ? 0 : 1),
    lastReviewedAt: now
  };

  let nextLessonIndex = cursor.lessonIndex;
  let nextCardIndex = cursor.cardIndex + 1;
  const completedLessons = new Set(current.completedLessons);

  if (lesson && nextCardIndex >= lesson.cards.length) {
    completedLessons.add(lesson.id);
    nextLessonIndex = Math.min(cursor.lessonIndex + 1, Math.max(lessons.length - 1, 0));
    nextCardIndex = 0;
  }

  const isLastLesson = cursor.lessonIndex >= Math.max(lessons.length - 1, 0);
  const isLastCard = lesson ? cursor.cardIndex >= lesson.cards.length - 1 : true;
  const completed = isLastLesson && isLastCard && mastered;

  return {
    ...current,
    updatedAt: now,
    currentLessonIndex: completed ? cursor.lessonIndex : nextLessonIndex,
    currentCardIndex: completed ? cursor.cardIndex : nextCardIndex,
    completed,
    completedLessons: Array.from(completedLessons),
    cardProgressById: {
      ...current.cardProgressById,
      [card.id]: nextCardProgress
    }
  };
};

export const getCourseCompletion = (course: CourseData, progress?: CourseProgress) => {
  const cards = flattenCourseCards(course);
  if (cards.length === 0) {
    return 0;
  }

  const reviewed = cards.filter((card) => (progress?.cardProgressById[card.id]?.mastery ?? 0) > 0).length;
  return reviewed / cards.length;
};

export const isReviewDue = (cardProgress?: CardProgress) => {
  if (!cardProgress?.lastReviewedAt) {
    return false;
  }

  const elapsedHours =
    (Date.now() - new Date(cardProgress.lastReviewedAt).getTime()) / (1000 * 60 * 60);
  const requiredHours = Math.max(8, 16 * Math.max(1, cardProgress.mastery));
  return elapsedHours >= requiredHours;
};

export const getReviewCount = (course: CourseData, progress?: CourseProgress) =>
  flattenCourseCards(course).filter((card) => isReviewDue(progress?.cardProgressById[card.id])).length;

export const buildQuizQuestion = (card: LessonCard, cards: LessonCard[]): QuizQuestion => {
  const answer = (card.focusWords[0] ?? card.vietnamese.split(/\s+/)[0] ?? "").trim();
  const prompt = card.vietnamese.replace(new RegExp(`\\b${escapeRegExp(answer)}\\b`, "i"), "_____");
  const choices = Array.from(
    new Set(
      cards
        .flatMap((candidate) => candidate.focusWords)
        .filter((word) => word && word !== answer)
    )
  )
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return {
    prompt,
    answer,
    choices: [...choices, answer].sort(() => Math.random() - 0.5)
  };
};

export const getRecommendedCourseId = (
  catalog: CourseManifest[],
  progressByCourse: ShellState["progressByCourse"]
) => {
  const started = catalog.find((course) => {
    const progress = progressByCourse[course.id];
    return progress && !progress.completed;
  });

  if (started) {
    return started.id;
  }

  const firstUntouched = catalog.find((course) => !progressByCourse[course.id]);
  return firstUntouched?.id ?? catalog[0]?.id;
};

export const isCourseUnlocked = (
  manifest: CourseManifest,
  catalog: CourseManifest[],
  progressByCourse: ShellState["progressByCourse"]
) => {
  if (manifest.order === 1) {
    return true;
  }

  const previous = catalog.find((item) => item.order === manifest.order - 1);
  if (!previous) {
    return true;
  }

  return Boolean(progressByCourse[previous.id]);
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
