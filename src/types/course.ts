export type CourseLevel = "Starter" | "Core" | "Builder" | "Advanced";

export type CoverTheme =
  | "mint"
  | "coral"
  | "gold"
  | "ocean"
  | "indigo"
  | "sunset";

export interface CourseManifest {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  estimatedMinutes: number;
  tags: string[];
  order: number;
  coverTheme: CoverTheme;
  pdfPath: string;
  recommended: boolean;
  isLocked: boolean;
  prerequisiteCourseIds: string[];
}

export interface CourseProgress {
  courseId: string;
  completionRate: number;
  completedLessons: number;
  totalLessons: number;
  lastStudiedAt?: string;
  currentLessonId?: string;
  completedLessonIds?: string[];
}

export interface CourseViewModel extends CourseManifest {
  completionRate: number;
  isCompleted: boolean;
  isAvailable: boolean;
  lastStudiedAt?: string;
}

export interface LessonListItem {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  coreTopic: string;
  representativeSentence: string;
  cardsCount: number;
  canListen: boolean;
  canQuiz: boolean;
  completionRate: number;
  isLocked: boolean;
  isCompleted: boolean;
  status: "locked" | "available" | "in_progress" | "completed";
}

export interface ChapterListItem {
  id: string;
  order: number;
  title: string;
  description: string;
  completionRate: number;
  completedLessons: number;
  totalLessons: number;
  isUnlocked: boolean;
  lessons: LessonListItem[];
}

export interface CourseDetailViewModel extends CourseViewModel {
  chapterCount: number;
  lessonCount: number;
  totalCards: number;
  chapters: ChapterListItem[];
  currentLesson?: LessonListItem;
  nextLesson?: LessonListItem;
  reviewLesson?: LessonListItem;
  continueLesson?: LessonListItem;
  completedLessons: number;
  estimatedHoursText: string;
}
