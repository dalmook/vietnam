export const buildCourseDetailPath = (courseId: string) => `/course/${courseId}`;

export const buildLessonPath = (courseId: string, lessonId: string) =>
  `/course/${courseId}/lesson/${lessonId}`;
