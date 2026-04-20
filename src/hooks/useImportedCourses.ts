import { useEffect, useState } from "react";
import { buildImportedCourseViewModels } from "../lib/importedCourse";
import { courseRepository } from "../repositories/courseRepository";
import { learningRepository } from "../repositories/learningRepository";
import { extractEmbeddedPdf } from "../services/pdfExtraction";
import type { ImportedCourseViewModel } from "../types/importedCourse";

const createImportedCourseId = () => `imported-${Date.now()}`;

export function useImportedCourses() {
  const [courses, setCourses] = useState<ImportedCourseViewModel[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>();

  const refresh = async () => {
    try {
      const [records, metas, progressMap] = await Promise.all([
        courseRepository.listImportedCourses(),
        courseRepository.listCourseDocumentMetas(),
        learningRepository.loadCourseProgressMap()
      ]);

      setCourses(
        buildImportedCourseViewModels({
          records,
          metas: metas.filter((meta) => meta.sourceKind === "imported"),
          progressMap
        })
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "추가 PDF 목록을 불러오지 못했습니다.");
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const uploadPdf = async (file: File) => {
    setIsUploading(true);
    setError(undefined);
    const courseId = createImportedCourseId();
    const objectUrl = URL.createObjectURL(file);

    try {
      await courseRepository.saveImportedCourse({
        courseId,
        title: file.name.replace(/\.pdf$/i, ""),
        pdfName: file.name,
        pdfPath: objectUrl,
        createdAt: new Date().toISOString()
      });

      const extracted = await extractEmbeddedPdf({
        courseId,
        title: file.name,
        pdfPath: objectUrl
      });

      await courseRepository.saveExtractedDocument(extracted, {
        sourceKind: "imported",
        title: file.name.replace(/\.pdf$/i, ""),
        pdfPath: objectUrl,
        importedAt: new Date().toISOString()
      });
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "PDF 업로드 중 문제가 발생했습니다.");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsUploading(false);
    }
  };

  const hideCourse = async (courseId: string) => {
    await courseRepository.setImportedCourseHidden(courseId, true);
    await refresh();
  };

  const deleteCourse = async (courseId: string) => {
    await courseRepository.deleteImportedCourse(courseId);
    await refresh();
  };

  return {
    courses,
    isReady,
    isUploading,
    error,
    refresh,
    uploadPdf,
    hideCourse,
    deleteCourse
  };
}
