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
}

export interface CourseViewModel extends CourseManifest {
  completionRate: number;
  isCompleted: boolean;
  isAvailable: boolean;
  lastStudiedAt?: string;
}
