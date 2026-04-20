import type { DBSchema } from "idb";
import type { CourseProgress } from "./course";
import type { ExtractedCourseDocument, ExtractionStatus } from "./extraction";
import type { LessonRewardStats } from "./lessonPlayer";
import type { QuizSubmission, QuizType } from "./quiz";

export type CourseSourceKind = "default" | "imported";

export interface StoredCourseDocumentMeta {
  courseId: string;
  title: string;
  pdfPath: string;
  sourceKind: CourseSourceKind;
  status: ExtractionStatus;
  pageCount: number;
  warningCount: number;
  extractedAt?: string;
  lastOpenedAt?: string;
  importedAt?: string;
  errorMessage?: string;
}

export interface ReviewQueueEntry {
  id: string;
  courseId: string;
  cardId: string;
  front: string;
  sourcePageNumber: number;
  questionId: string;
  quizType: QuizType;
  createdAt: string;
  lastSeenAt?: string;
  wrongCount: number;
  lessonId?: string;
}

export interface PersistedCourseProgress extends CourseProgress {
  sourceKind: CourseSourceKind;
  completedLessonIds: string[];
  completedCardIds: string[];
  quizSubmissions: QuizSubmission[];
  reviewQueue: ReviewQueueEntry[];
  weakCardIds: string[];
  lastSessionAccuracy?: number;
  lastSessionAt?: string;
}

export interface UserSettings {
  id: "primary";
  selectedVoiceId?: string;
  speechRate: number;
  showTranslation: boolean;
  autoRepeat: boolean;
  preferSlowListening: boolean;
  learnerMode: "beginner" | "intermediate";
  updatedAt: string;
}

export interface ImportedCourseRecord {
  courseId: string;
  title: string;
  pdfName: string;
  pdfPath: string;
  createdAt: string;
  isHidden?: boolean;
}

export interface AppStateRecord {
  id: "primary";
  rewards: LessonRewardStats;
  lastStudiedCourseId?: string;
  lastStudiedLessonId?: string;
  updatedAt: string;
}

export interface VietnamFlowDB extends DBSchema {
  progress: {
    key: string;
    value: Record<string, CourseProgress>;
  };
  extractions: {
    key: string;
    value: ExtractedCourseDocument;
  };
  courseProgress: {
    key: string;
    value: PersistedCourseProgress;
  };
  courseExtractions: {
    key: string;
    value: ExtractedCourseDocument;
  };
  courseDocuments: {
    key: string;
    value: StoredCourseDocumentMeta;
  };
  reviewQueue: {
    key: string;
    value: ReviewQueueEntry;
    indexes: {
      "by-courseId": string;
      "by-createdAt": string;
    };
  };
  userSettings: {
    key: string;
    value: UserSettings;
  };
  appState: {
    key: string;
    value: AppStateRecord;
  };
  importedCourses: {
    key: string;
    value: ImportedCourseRecord;
  };
}
