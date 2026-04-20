import { useEffect, useMemo, useState } from "react";
import { courseManifest } from "../data/courseManifest";
import { buildCourseViewModels } from "../lib/courseProgress";
import { buildCourseDetailViewModel } from "../lib/courseOutline";
import { embeddedPdfSources } from "../lib/embeddedSources";
import { buildImportedCourseViewModels } from "../lib/importedCourse";
import { courseRepository } from "../repositories/courseRepository";
import { buildDefaultCourseProgress, learningRepository } from "../repositories/learningRepository";
import { extractEmbeddedPdf } from "../services/pdfExtraction";
import type { CourseDetailViewModel, CourseViewModel, LessonListItem } from "../types/course";
import type { ExtractedCourseDocument, LearningCard } from "../types/extraction";
import type { ImportedCourseViewModel } from "../types/importedCourse";
import type { LessonSessionResult } from "../types/lessonPlayer";
import type { PersistedCourseProgress } from "../types/persistence";

export function useCourseDetail(courseId: string | undefined) {
  const [progressMap, setProgressMap] = useState<Record<string, PersistedCourseProgress>>({});
  const [document, setDocument] = useState<ExtractedCourseDocument>();
  const [importedCourses, setImportedCourses] = useState<ImportedCourseViewModel[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (!courseId) {
        setIsReady(true);
        return;
      }

      try {
        const [storedProgress, cachedDocument, importedRecords, metas] = await Promise.all([
          learningRepository.loadCourseProgressMap(),
          courseRepository.getExtractedDocument(courseId),
          courseRepository.listImportedCourses(),
          courseRepository.listCourseDocumentMetas()
        ]);

        if (!mounted) {
          return;
        }

        setProgressMap(storedProgress);
        setImportedCourses(
          buildImportedCourseViewModels({
            records: importedRecords,
            metas,
            progressMap: storedProgress
          })
        );
        if (cachedDocument) {
          setDocument(cachedDocument);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "코스 데이터를 준비하지 못했습니다.");
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [courseId]);

  const course = useMemo<CourseViewModel | undefined>(() => {
    if (!courseId) {
      return undefined;
    }

    const defaultCourse = buildCourseViewModels(courseManifest, progressMap).find((item) => item.id === courseId);
    if (defaultCourse) {
      return defaultCourse;
    }

    return importedCourses.find((item) => item.id === courseId);
  }, [courseId, importedCourses, progressMap]);

  useEffect(() => {
    let mounted = true;

    const ensureExtraction = async () => {
      if (!courseId || document || !course) {
        return;
      }

      const source = embeddedPdfSources.find((item) => item.courseId === courseId);
      if (!source) {
        return;
      }

      setIsExtracting(true);
      try {
        const extracted = await extractEmbeddedPdf(source);
        await courseRepository.saveExtractedDocument(extracted);
        if (mounted) {
          setDocument(extracted);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "코스 추출에 실패했습니다.");
        }
      } finally {
        if (mounted) {
          setIsExtracting(false);
        }
      }
    };

    void ensureExtraction();

    return () => {
      mounted = false;
    };
  }, [course, courseId, document]);

  const progress = courseId ? progressMap[courseId] ?? buildDefaultCourseProgress(courseId) : undefined;

  const detail = useMemo<CourseDetailViewModel | undefined>(() => {
    if (!course || !document || document.status !== "ready") {
      return undefined;
    }

    return buildCourseDetailViewModel(course, document, progress);
  }, [course, document, progress]);

  const syncProgress = async (nextProgress: PersistedCourseProgress) => {
    setProgressMap((current) => ({
      ...current,
      [nextProgress.courseId]: nextProgress
    }));
    await learningRepository.saveCourseProgress(nextProgress);
  };

  const startCourse = async () => {
    if (!detail || !courseId) {
      return detail?.currentLesson;
    }

    const firstLesson = detail.chapters[0]?.lessons[0];
    if (!firstLesson) {
      return undefined;
    }

    await markLessonEntered(firstLesson);
    return firstLesson;
  };

  const continueCourse = async () => {
    if (!detail || !courseId) {
      return undefined;
    }

    const target = detail.continueLesson ?? detail.nextLesson ?? detail.chapters[0]?.lessons[0];
    if (!target) {
      return undefined;
    }

    await markLessonEntered(target);
    return target;
  };

  const reviewCourse = async () => {
    if (!detail?.reviewLesson) {
      return undefined;
    }

    await markLessonEntered(detail.reviewLesson);
    return detail.reviewLesson;
  };

  const markLessonEntered = async (lesson: LessonListItem) => {
    if (!courseId || !detail) {
      return;
    }

    const sourceKind = courseId.startsWith("imported-") ? "imported" : "default";

    await learningRepository.recordLessonEntry({
      courseId,
      lessonId: lesson.id,
      totalLessons: detail.lessonCount,
      sourceKind
    });

    const nextProgress: PersistedCourseProgress = {
      ...(progress ?? buildDefaultCourseProgress(courseId)),
      totalLessons: detail.lessonCount,
      currentLessonId: lesson.id,
      lastStudiedAt: new Date().toISOString(),
      sourceKind
    };
    await syncProgress(nextProgress);
    await courseRepository.touchCourseMeta(courseId, {
      lastOpenedAt: new Date().toISOString()
    });
  };

  const markLessonCompleted = async (lessonId: string, result: LessonSessionResult, cards: LearningCard[]) => {
    if (!courseId || !detail) {
      return;
    }

    await learningRepository.recordLessonCompletion({
      courseId,
      lessonId,
      totalLessons: detail.lessonCount,
      cards,
      result,
      sourceKind: courseId.startsWith("imported-") ? "imported" : "default"
    });

    const refreshedMap = await learningRepository.loadCourseProgressMap();
    setProgressMap(refreshedMap);
  };

  return {
    isReady,
    isExtracting,
    error,
    course,
    document,
    detail,
    progress,
    startCourse,
    continueCourse,
    reviewCourse,
    markLessonEntered,
    markLessonCompleted,
    hasUnsupportedDocument: document?.status === "unsupported",
    hasFailedDocument: document?.status === "failed"
  };
}
