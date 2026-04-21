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

export type ExtractedPageType =
  | "cover"
  | "dialogue"
  | "grammar_vocab"
  | "grammar_usage"
  | "culture_note"
  | "unknown";

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
  pageType?: ExtractedPageType;
  pageTypeReason?: string;
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

export interface DialogueTurn {
  speaker: string;
  vietnamese: string;
  koreanMeaning?: string;
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
  vietnamese: string;
  koreanMeaning?: string;
  explanation?: string;
  sourcePage: number;
  sourceCourseId: string;
  lessonId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  audioText: string;
  hiddenByDefaultFields: Array<"koreanMeaning" | "explanation">;
  turns?: DialogueTurn[];
}

export interface DebugLineWithReason {
  line: string;
  reason: string;
  pageNumber: number;
}

export interface ExtractionDebugInfo {
  repeatedLineCandidates: string[];
  droppedLineCount: number;
  sectionCount: number;
  lessonCount: number;
  lowTextDensity: boolean;
  fallbackApplied: boolean;
  pageTypeClassification: Array<{ pageNumber: number; pageType: ExtractedPageType; reason: string }>;
  vietnameseCandidateLines: DebugLineWithReason[];
  attachedTranslationLines: DebugLineWithReason[];
  excludedNoiseLines: DebugLineWithReason[];
  finalLearningCards: Array<{ id: string; type: LearningCardType; reason: string; pageNumber: number }>;
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
