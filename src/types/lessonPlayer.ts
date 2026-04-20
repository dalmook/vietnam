import type { LearningCard } from "./extraction";
import type { QuizSubmission } from "./quiz";

export type LessonPlayerStep = "listen" | "repeat" | "meaning" | "quiz";
export type LessonPlayerPhase = "intro" | "playing" | "summary";

export interface LessonPlayerAnswer extends QuizSubmission {}

export interface LessonRewardStats {
  totalXp: number;
  streak: number;
  completedCount: number;
  lastCompletedOn?: string;
  lastCompletedLessonId?: string;
}

export interface LessonSessionResult {
  lessonId: string;
  xpEarned: number;
  streak: number;
  accuracy: number;
  completedCount: number;
  correctAnswers: number;
  totalQuestions: number;
  reviewCardIds: string[];
  wrongCards: LearningCard[];
  totalCards: number;
  submissions: QuizSubmission[];
}
