export type LessonStep = "listen" | "speak" | "meaning" | "quiz" | "review";
export type TabId = "home" | "courses" | "review" | "more";
export type CourseSourceType = "built-in" | "upload";

export interface ParsedLine {
  id: string;
  page: number;
  text: string;
}

export interface CourseManifest {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  theme: string;
  level: string;
  estimatedMinutes: number;
  sourceType: CourseSourceType;
  pdfPath?: string;
}

export interface LessonCard {
  id: string;
  page: number;
  order: number;
  vietnamese: string;
  gloss?: string;
  focusWords: string[];
  audioText: string;
}

export interface LessonUnit {
  id: string;
  order: number;
  title: string;
  cards: LessonCard[];
}

export interface ChapterUnit {
  id: string;
  order: number;
  title: string;
  lessons: LessonUnit[];
}

export interface CourseData {
  id: string;
  manifest: CourseManifest;
  chapters: ChapterUnit[];
  totalCards: number;
}

export interface CardProgress {
  cardId: string;
  mastery: number;
  incorrectCount: number;
  lastReviewedAt?: string;
}

export interface CourseProgress {
  courseId: string;
  startedAt: string;
  updatedAt: string;
  currentLessonIndex: number;
  currentCardIndex: number;
  completed: boolean;
  completedLessons: string[];
  cardProgressById: Record<string, CardProgress>;
}

export interface SettingsState {
  slowMode: boolean;
}

export interface ShellState {
  activeCourseId?: string;
  activeTab: TabId;
  customCatalog: CourseManifest[];
  progressByCourse: Record<string, CourseProgress>;
  settings: SettingsState;
}

export interface QuizQuestion {
  prompt: string;
  answer: string;
  choices: string[];
}

export interface StudyCursor {
  lessonIndex: number;
  cardIndex: number;
}
