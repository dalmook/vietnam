import type { CourseManifest, CourseProgress, CourseViewModel } from "../types/course";

export const TOTAL_LESSONS_PER_COURSE = 5;

export const getDefaultProgress = (courseId: string): CourseProgress => ({
  courseId,
  completionRate: 0,
  completedLessons: 0,
  totalLessons: TOTAL_LESSONS_PER_COURSE
});

export const resolveAvailability = (
  course: CourseManifest,
  progressMap: Record<string, CourseProgress>
) => {
  if (course.isLocked) {
    return false;
  }

  if (course.prerequisiteCourseIds.length === 0) {
    return true;
  }

  return course.prerequisiteCourseIds.every((prerequisiteId) => {
    const prerequisite = progressMap[prerequisiteId];
    return (prerequisite?.completionRate ?? 0) >= 1;
  });
};

export const buildCourseViewModels = (
  manifest: CourseManifest[],
  progressMap: Record<string, CourseProgress>
): CourseViewModel[] =>
  manifest.map((course) => {
    const progress = progressMap[course.id] ?? getDefaultProgress(course.id);
    const completionRate = Math.max(0, Math.min(1, progress.completionRate));

    return {
      ...course,
      completionRate,
      isCompleted: completionRate >= 1,
      isAvailable: resolveAvailability(course, progressMap),
      lastStudiedAt: progress.lastStudiedAt
    };
  });

export const pickContinueCourse = (courses: CourseViewModel[]) =>
  courses.find((course) => course.completionRate > 0 && course.completionRate < 1 && course.isAvailable) ??
  courses.find((course) => course.isAvailable && !course.isCompleted) ??
  courses[0];

export const pickRecommendedCourses = (courses: CourseViewModel[]) =>
  courses.filter((course) => course.recommended && course.isAvailable).slice(0, 2);

export const getCompletedCount = (courses: CourseViewModel[]) =>
  courses.filter((course) => course.isCompleted).length;
