import { useEffect, useMemo, useState } from "react";
import { courseManifest } from "../data/courseManifest";
import {
  buildCourseViewModels,
  getCompletedCount,
  pickContinueCourse,
  pickRecommendedCourses
} from "../lib/courseProgress";
import { loadProgressMap, saveProgressMap } from "../lib/storage";
import type { CourseProgress } from "../types/course";

export function useCourseLibrary() {
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadProgressMap()
      .then((stored) => setProgressMap(stored))
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void saveProgressMap(progressMap);
  }, [isReady, progressMap]);

  const courses = useMemo(
    () => buildCourseViewModels(courseManifest, progressMap).sort((a, b) => a.order - b.order),
    [progressMap]
  );

  const continueCourse = useMemo(() => pickContinueCourse(courses), [courses]);
  const recommendedCourses = useMemo(() => pickRecommendedCourses(courses), [courses]);
  const completedCount = useMemo(() => getCompletedCount(courses), [courses]);

  return {
    isReady,
    courses,
    continueCourse,
    recommendedCourses,
    completedCount,
    totalCount: courses.length
  };
}
