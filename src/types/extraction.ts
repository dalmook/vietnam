export type ExtractionStatus =
  | "idle"
  | "loading"
  | "ready"
  | "failed"
  | "unsupported";

export type LearningCardType =
  | "vocabulary"
  | "phrase"
  | "sentence"
  | "dialogue"
  | "note";

export interface EmbeddedPdfSource {
  courseId: string;
  title: string;
  pdfPath: string;
}

export interface ExtractedPageLine {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface ExtractedPage {
  pageNumber: number;
  rawText: string;
  cleanedText: string;
  lines: ExtractedPageLine[];
  textDensity: number;
}

export interface ParsedSection {
  id: string;
  title: string;
  pageStart: number;
  pageEnd: number;
  content: string[];
}

export interface LessonDraft {
  id: string;
  sectionId: string;
  title: string;
  summary: string;
  sourcePageNumbers: number[];
  rawSegments: string[];
}

export interface LearningCard {
  id: string;
  type: LearningCardType;
  front: string;
  back?: string;
  hint?: string;
  difficultyEstimate: 1 | 2 | 3 | 4 | 5;
  sourceText: string;
  sourcePageNumber: number;
  lessonDraftId: string;
}

export interface ExtractionDebugInfo {
  repeatedLineCandidates: string[];
  droppedLineCount: number;
  sectionCount: number;
  lessonCount: number;
  lowTextDensity: boolean;
  fallbackApplied: boolean;
}

export interface ExtractedCourseDocument {
  courseId: string;
  source: EmbeddedPdfSource;
  status: ExtractionStatus;
  extractedAt?: string;
  pageCount: number;
  pages: ExtractedPage[];
  sections: ParsedSection[];
  lessons: LessonDraft[];
  cards: LearningCard[];
  warnings: string[];
  errorMessage?: string;
  debug: ExtractionDebugInfo;
}
