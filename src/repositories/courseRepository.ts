import { courseManifest } from "../data/courseManifest";
import { getAppDatabase } from "../lib/appDb";
import type { ExtractedCourseDocument } from "../types/extraction";
import type { ImportedCourseRecord, StoredCourseDocumentMeta } from "../types/persistence";

const buildDefaultMeta = (courseId: string, document: ExtractedCourseDocument): StoredCourseDocumentMeta => {
  const manifest = courseManifest.find((course) => course.id === courseId);

  return {
    courseId,
    title: manifest?.title ?? document.source.title,
    pdfPath: manifest?.pdfPath ?? document.source.pdfPath,
    sourceKind: "default",
    status: document.status,
    pageCount: document.pageCount,
    warningCount: document.warnings.length,
    extractedAt: document.extractedAt,
    errorMessage: document.errorMessage
  };
};

export class CourseRepository {
  async getExtractedDocument(courseId: string) {
    const database = await getAppDatabase();
    const stored = await database.get("courseExtractions", courseId);
    if (stored) {
      return stored;
    }

    const legacy = await database.get("extractions", courseId);
    if (legacy) {
      await this.saveExtractedDocument(legacy);
    }

    return legacy;
  }

  async saveExtractedDocument(document: ExtractedCourseDocument, meta?: Partial<StoredCourseDocumentMeta>) {
    const database = await getAppDatabase();
    const nextMeta: StoredCourseDocumentMeta = {
      ...buildDefaultMeta(document.courseId, document),
      ...meta
    };

    await Promise.all([
      database.put("courseExtractions", document),
      database.put("courseDocuments", nextMeta),
      database.put("extractions", document, document.courseId)
    ]);
  }

  async touchCourseMeta(courseId: string, meta: Partial<StoredCourseDocumentMeta>) {
    const database = await getAppDatabase();
    const previous = await database.get("courseDocuments", courseId);
    if (!previous) {
      return;
    }

    await database.put("courseDocuments", {
      ...previous,
      ...meta
    });
  }

  async listCourseDocumentMetas() {
    const database = await getAppDatabase();
    return database.getAll("courseDocuments");
  }

  async saveImportedCourse(record: ImportedCourseRecord) {
    const database = await getAppDatabase();
    await Promise.all([
      database.put("importedCourses", record),
      database.put("courseDocuments", {
        courseId: record.courseId,
        title: record.title,
        pdfPath: record.pdfPath,
        sourceKind: "imported",
        status: "idle",
        pageCount: 0,
        warningCount: 0,
        importedAt: record.createdAt
      })
    ]);
  }

  async listImportedCourses() {
    const database = await getAppDatabase();
    return database.getAll("importedCourses");
  }

  async setImportedCourseHidden(courseId: string, isHidden: boolean) {
    const database = await getAppDatabase();
    const record = await database.get("importedCourses", courseId);
    if (!record) {
      return;
    }

    await database.put("importedCourses", {
      ...record,
      isHidden
    });
  }

  async deleteImportedCourse(courseId: string) {
    const database = await getAppDatabase();
    const reviewQueueIds = await database.getAllKeysFromIndex("reviewQueue", "by-courseId", courseId);

    await Promise.all([
      database.delete("importedCourses", courseId),
      database.delete("courseDocuments", courseId),
      database.delete("courseExtractions", courseId),
      database.delete("courseProgress", courseId),
      ...reviewQueueIds.map((entryId) => database.delete("reviewQueue", entryId as string))
    ]);
  }
}

export const courseRepository = new CourseRepository();
