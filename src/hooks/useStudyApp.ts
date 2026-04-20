import { useEffect, useMemo, useState } from "react";
import { builtInCatalog } from "../data/builtInCatalog";
import {
  applyCardReview,
  defaultShellState,
  getDefaultCourseProgress,
  getRecommendedCourseId
} from "../domain/progress";
import type {
  CourseData,
  CourseManifest,
  CourseProgress,
  LessonCard,
  SettingsState,
  ShellState,
  TabId
} from "../domain/types";
import {
  loadCachedCourse,
  loadShellState,
  saveCachedCourse,
  saveShellState
} from "../services/storage";

const sortCatalog = (items: CourseManifest[]) => [...items].sort((a, b) => a.order - b.order);

export const useStudyApp = () => {
  const [shellState, setShellState] = useState<ShellState>(defaultShellState);
  const [courseCache, setCourseCache] = useState<Record<string, CourseData>>({});
  const [studyCourseId, setStudyCourseId] = useState<string>();
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadShellState()
      .then((stored) => setShellState(stored))
      .catch(() => setError("저장된 학습 상태를 불러오지 못했습니다."))
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void saveShellState(shellState);
  }, [isReady, shellState]);

  const catalog = useMemo(
    () => sortCatalog([...builtInCatalog, ...shellState.customCatalog]),
    [shellState.customCatalog]
  );

  const activeManifest = useMemo(
    () => catalog.find((course) => course.id === studyCourseId),
    [catalog, studyCourseId]
  );

  const activeCourse = activeManifest ? courseCache[activeManifest.id] : undefined;
  const recommendedCourseId = getRecommendedCourseId(catalog, shellState.progressByCourse);

  const ensureCourseLoaded = async (manifest: CourseManifest) => {
    if (courseCache[manifest.id]) {
      return courseCache[manifest.id];
    }

    const cached = await loadCachedCourse(manifest.id);
    if (cached) {
      setCourseCache((current) => ({ ...current, [cached.id]: cached }));
      return cached;
    }

    const { loadCourseFromManifest } = await import("../services/courseLoader");
    const loaded = await loadCourseFromManifest(manifest);
    await saveCachedCourse(loaded);
    setCourseCache((current) => ({ ...current, [loaded.id]: loaded }));
    return loaded;
  };

  const openCourse = async (courseId: string) => {
    const manifest = catalog.find((item) => item.id === courseId);
    if (!manifest) {
      return;
    }

    setIsBusy(true);
    setError(undefined);
    try {
      await ensureCourseLoaded(manifest);
      setStudyCourseId(courseId);
      setShellState((current) => ({
        ...current,
        activeCourseId: courseId
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "코스를 여는 중 오류가 발생했습니다.");
    } finally {
      setIsBusy(false);
    }
  };

  const closeCourse = () => {
    setStudyCourseId(undefined);
    setShellState((current) => ({
      ...current,
      activeTab: "home"
    }));
  };

  const setActiveTab = (tab: TabId) =>
    setShellState((current) => ({
      ...current,
      activeTab: tab
    }));

  const getProgress = (courseId: string): CourseProgress | undefined => shellState.progressByCourse[courseId];

  const saveCourseProgress = (courseId: string, progress: CourseProgress) =>
    setShellState((current) => ({
      ...current,
      progressByCourse: {
        ...current.progressByCourse,
        [courseId]: progress
      }
    }));

  const reviewCard = (card: LessonCard, mastered: boolean) => {
    if (!activeCourse) {
      return;
    }

    const currentProgress =
      shellState.progressByCourse[activeCourse.id] ?? getDefaultCourseProgress(activeCourse.id);
    const next = applyCardReview(activeCourse, currentProgress, card, mastered);
    saveCourseProgress(activeCourse.id, next);
  };

  const importFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) {
      return;
    }

    setIsBusy(true);
    setError(undefined);

    try {
      const newManifests: CourseManifest[] = [];
      const loadedCourses: CourseData[] = [];
      const { loadCourseFromFile } = await import("../services/courseLoader");

      for (const file of list) {
        const manifest: CourseManifest = {
          id: `upload-${crypto.randomUUID()}`,
          order: builtInCatalog.length + shellState.customCatalog.length + newManifests.length + 1,
          title: file.name.replace(/\.pdf$/i, ""),
          subtitle: "추가 업로드한 개인 학습 PDF",
          theme: "추가 자료",
          level: "Custom",
          estimatedMinutes: 10,
          sourceType: "upload"
        };

        const loaded = await loadCourseFromFile(manifest, file);
        newManifests.push(manifest);
        loadedCourses.push(loaded);
      }

      for (const course of loadedCourses) {
        await saveCachedCourse(course);
      }

      setCourseCache((current) => {
        const next = { ...current };
        loadedCourses.forEach((course) => {
          next[course.id] = course;
        });
        return next;
      });

      setShellState((current) => ({
        ...current,
        customCatalog: sortCatalog([...current.customCatalog, ...newManifests]),
        activeTab: "courses"
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "추가 PDF를 불러오지 못했습니다.");
    } finally {
      setIsBusy(false);
    }
  };

  const updateSettings = (nextSettings: SettingsState) =>
    setShellState((current) => ({
      ...current,
      settings: nextSettings
    }));

  return {
    isReady,
    isBusy,
    error,
    catalog,
    courseCache,
    shellState,
    activeManifest,
    activeCourse,
    recommendedCourseId,
    getProgress,
    openCourse,
    closeCourse,
    setActiveTab,
    reviewCard,
    importFiles,
    updateSettings
  };
};
