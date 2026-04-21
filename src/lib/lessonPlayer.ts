import type { LearningCard } from "../types/extraction";
import type {
  LessonPlayerAnswer,
  LessonPlayerStep,
  LessonRewardStats,
  LessonSessionResult
} from "../types/lessonPlayer";

const LESSON_REWARD_KEY = "vietnam-flow.lesson-rewards";

export const lessonStepOrder: LessonPlayerStep[] = ["listen", "repeat", "meaning", "quiz"];

export const getStepLabel = (step: LessonPlayerStep) => {
  switch (step) {
    case "listen":
      return "듣기";
    case "repeat":
      return "따라 읽기";
    case "meaning":
      return "뜻 확인";
    case "quiz":
      return "퀴즈";
  }
};

export const buildMeaningText = (card: LearningCard) =>
  card.koreanMeaning ?? card.back ?? card.hint ?? card.sourceText ?? "이 카드의 뜻과 쓰임을 확인해 보세요.";

export const calculateStepProgress = (
  currentCardIndex: number,
  currentStepIndex: number,
  totalCards: number
) => {
  const totalSteps = Math.max(totalCards * lessonStepOrder.length, 1);
  const completedSteps = currentCardIndex * lessonStepOrder.length + currentStepIndex;
  return completedSteps / totalSteps;
};

export const loadRewardStats = (): LessonRewardStats => {
  if (typeof window === "undefined") {
    return { totalXp: 0, streak: 0, completedCount: 0 };
  }

  const raw = window.localStorage.getItem(LESSON_REWARD_KEY);
  if (!raw) {
    return { totalXp: 0, streak: 0, completedCount: 0 };
  }

  try {
    return JSON.parse(raw) as LessonRewardStats;
  } catch {
    return { totalXp: 0, streak: 0, completedCount: 0 };
  }
};

export const saveRewardStats = (stats: LessonRewardStats) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LESSON_REWARD_KEY, JSON.stringify(stats));
};

export const buildSessionResult = ({
  lessonId,
  cards,
  answers,
  previousRewards
}: {
  lessonId: string;
  cards: LearningCard[];
  answers: LessonPlayerAnswer[];
  previousRewards: LessonRewardStats;
}): LessonSessionResult => {
  const totalQuestions = Math.max(answers.length, cards.length);
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const accuracy = totalQuestions === 0 ? 1 : correctAnswers / totalQuestions;
  const reviewCardIds = answers.filter((answer) => !answer.isCorrect).map((answer) => answer.cardId);
  const wrongCards = cards.filter((card) => reviewCardIds.includes(card.id));
  const xpEarned =
    cards.length * 8 + Math.round(accuracy * 30) + (reviewCardIds.length === 0 ? 12 : 0);
  const streak = resolveNextStreak(previousRewards.lastCompletedOn, previousRewards.streak);
  const completedCount =
    previousRewards.lastCompletedLessonId === lessonId
      ? previousRewards.completedCount
      : previousRewards.completedCount + 1;

  return {
    lessonId,
    xpEarned,
    streak,
    accuracy,
    completedCount,
    correctAnswers,
    totalQuestions,
    reviewCardIds,
    wrongCards,
    totalCards: cards.length,
    submissions: answers
  };
};

export const buildNextRewardStats = (
  previousRewards: LessonRewardStats,
  result: LessonSessionResult
): LessonRewardStats => ({
  totalXp: previousRewards.totalXp + result.xpEarned,
  streak: result.streak,
  completedCount: result.completedCount,
  lastCompletedOn: getTodayKey(),
  lastCompletedLessonId: result.lessonId
});

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function resolveNextStreak(lastCompletedOn: string | undefined, currentStreak: number) {
  const today = getTodayKey();
  if (!lastCompletedOn) {
    return 1;
  }

  if (lastCompletedOn === today) {
    return Math.max(currentStreak, 1);
  }

  const previous = new Date(`${lastCompletedOn}T00:00:00`);
  const current = new Date(`${today}T00:00:00`);
  const dayDiff = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

  return dayDiff === 1 ? currentStreak + 1 : 1;
}
