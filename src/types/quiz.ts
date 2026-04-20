import type { LearningCard } from "./extraction";

export type QuizType =
  | "meaning_choice"
  | "listening_choice"
  | "fill_blank"
  | "word_order"
  | "typing"
  | "true_false";

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  cardId: string;
  type: QuizType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  instruction: string;
  explanation: string;
  card: LearningCard;
  choices?: QuizChoice[];
  correctChoiceId?: string;
  acceptedAnswers: string[];
  blankedText?: string;
  shuffledTokens?: string[];
  correctTokens?: string[];
  statement?: string;
  audioText?: string;
  reviewTokens?: string[];
}

export interface QuizSubmission {
  questionId: string;
  cardId: string;
  quizType: QuizType;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  reviewTokens: string[];
}

export interface QuizGenerator {
  generateQuiz(input: {
    card: LearningCard;
    lessonCards: LearningCard[];
    cardIndex: number;
  }): QuizQuestion;
}
