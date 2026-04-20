import type { CourseViewModel } from "./course";
import type { ExtractionStatus } from "./extraction";

export interface ImportedCourseViewModel extends CourseViewModel {
  sourceKind: "imported";
  importStatus: ExtractionStatus;
  pdfName: string;
  isHidden?: boolean;
  warningCount: number;
  errorMessage?: string;
}
