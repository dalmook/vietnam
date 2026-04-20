import type { CourseLevel, CoverTheme, CourseViewModel } from "../types/course";
import type { ImportedCourseViewModel } from "../types/importedCourse";
import type { ImportedCourseRecord, PersistedCourseProgress, StoredCourseDocumentMeta } from "../types/persistence";

const importedThemes: CoverTheme[] = ["sunset", "ocean", "gold", "mint", "indigo", "coral"];
const importedLevels: CourseLevel[] = ["Starter", "Core", "Builder", "Advanced"];

export const buildImportedCourseViewModels = ({
  records,
  metas,
  progressMap
}: {
  records: ImportedCourseRecord[];
  metas: StoredCourseDocumentMeta[];
  progressMap: Record<string, PersistedCourseProgress>;
}): ImportedCourseViewModel[] => {
  const metaMap = new Map(metas.map((meta) => [meta.courseId, meta]));

  return records
    .filter((record) => !record.isHidden)
    .map((record, index) => {
      const meta = metaMap.get(record.courseId);
      const progress = progressMap[record.courseId];
      const completionRate = Math.max(0, Math.min(1, progress?.completionRate ?? 0));
      const course: CourseViewModel = {
        id: record.courseId,
        title: record.title,
        subtitle: "추가 업로드 PDF",
        description: "사용자가 직접 올린 PDF에서 생성된 보조 코스입니다.",
        level: importedLevels[index % importedLevels.length],
        estimatedMinutes: 12,
        tags: ["imported", "pdf"],
        order: 100 + index + 1,
        coverTheme: importedThemes[index % importedThemes.length],
        pdfPath: record.pdfPath,
        recommended: false,
        isLocked: false,
        prerequisiteCourseIds: [],
        completionRate,
        isCompleted: completionRate >= 1,
        isAvailable: true,
        lastStudiedAt: progress?.lastStudiedAt
      };

      return {
        ...course,
        sourceKind: "imported",
        importStatus: meta?.status ?? "idle",
        pdfName: record.pdfName,
        isHidden: record.isHidden,
        warningCount: meta?.warningCount ?? 0,
        errorMessage: meta?.errorMessage
      } satisfies ImportedCourseViewModel;
    });
};
