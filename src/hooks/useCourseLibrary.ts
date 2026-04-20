import { useEffect, useMemo, useState } from "react";
import { courseManifest } from "../data/courseManifest";
import {
  buildCourseViewModels,
  getCompletedCount,
  pickContinueCourse,
  pickRecommendedCourses
} from "../lib/courseProgress";
import { learningRepository } from "../repositories/learningRepository";
import type { PersistedCourseProgress } from "../types/persistence";

export function useCourseLibrary() {
  const [progressMap, setProgressMap] = useState<Record<string, PersistedCourseProgress>>({});
  const [lastStudiedCourseId, setLastStudiedCourseId] = useState<string>();
  const [rewards, setRewards] = useState({ totalXp: 0, streak: 0, completedCount: 0 });
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [storedProgressMap, appState] = await Promise.all([
          learningRepository.loadCourseProgressMap(),
          learningRepository.getAppState()
        ]);
        setProgressMap(storedProgressMap);
        setLastStudiedCourseId(appState.lastStudiedCourseId);
        setRewards(appState.rewards);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "코스 상태를 복구하지 못했습니다.");
      } finally {
        setIsReady(true);
      }
    };

    void bootstrap();
  }, []);

  const courses = useMemo(
    () => buildCourseViewModels(courseManifest, progressMap).sort((a, b) => a.order - b.order),
    [progressMap]
  );

  const continueCourse = useMemo(() => {
    if (lastStudiedCourseId) {
      return courses.find((course) => course.id === lastStudiedCourseId) ?? pickContinueCourse(courses);
    }

    return pickContinueCourse(courses);
  }, [courses, lastStudiedCourseId]);

  const continueLessonId = continueCourse ? progressMap[continueCourse.id]?.currentLessonId : undefined;

  const recentCourses = useMemo(
    () =>
      [...courses]
        .filter((course) => course.lastStudiedAt)
        .sort((a, b) => (b.lastStudiedAt ?? "").localeCompare(a.lastStudiedAt ?? ""))
        .slice(0, 3),
    [courses]
  );

  const recommendedCourses = useMemo(() => pickRecommendedCourses(courses), [courses]);
  const completedCount = useMemo(() => getCompletedCount(courses), [courses]);

  return {
    isReady,
    error,
    courses,
    continueCourse,
    continueLessonId,
    recentCourses,
    recommendedCourses,
    completedCount,
    totalCount: courses.length,
    rewards
  };
}
