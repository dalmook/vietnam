import { courseManifest } from "../data/courseManifest";
import type { EmbeddedPdfSource } from "../types/extraction";

export const embeddedPdfSources: EmbeddedPdfSource[] = courseManifest.map((course) => ({
  courseId: course.id,
  title: course.title,
  pdfPath: course.pdfPath
}));
