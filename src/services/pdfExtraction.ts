import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { buildLearningCards, buildLessonDrafts, buildSectionsFromPages } from "../lib/cardSegmentation";
import { cleanExtractedPages } from "../lib/textCleanup";
import { resolvePublicAssetUrl } from "../lib/assets";
import type {
  EmbeddedPdfSource,
  ExtractedCourseDocument,
  ExtractedPage,
  ExtractedPageLine
} from "../types/extraction";

GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfItem {
  str: string;
  transform: number[];
}

const emptyDebug = {
  repeatedLineCandidates: [],
  droppedLineCount: 0,
  sectionCount: 0,
  lessonCount: 0,
  lowTextDensity: true,
  fallbackApplied: false,
  pageTypeClassification: [],
  vietnameseCandidateLines: [],
  attachedTranslationLines: [],
  excludedNoiseLines: [],
  finalLearningCards: []
};

const buildUnsupportedDocument = (
  source: EmbeddedPdfSource,
  message: string
): ExtractedCourseDocument => ({
  courseId: source.courseId,
  source,
  status: "unsupported",
  pageCount: 0,
  pages: [],
  sections: [],
  lessons: [],
  cards: [],
  warnings: [],
  errorMessage: message,
  debug: { ...emptyDebug }
});

export const extractEmbeddedPdf = async (
  source: EmbeddedPdfSource
): Promise<ExtractedCourseDocument> => {
  try {
    const documentUrl = resolvePublicAssetUrl(source.pdfPath);
    const task = getDocument({ url: documentUrl });
    const pdf = await task.promise;
    const pages: ExtractedPage[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const rows = groupRows(
        content.items
          .map((item) => item as PdfItem)
          .filter((item) => item.str?.trim())
      );

      const lines: ExtractedPageLine[] = rows.map((row, index) => ({
        id: `p${pageNumber}-line-${index + 1}`,
        text: row.text,
        x: row.x,
        y: row.y
      }));

      const rawText = lines.map((line) => line.text).join("\n");

      pages.push({
        pageNumber,
        rawText,
        cleanedText: rawText,
        lines,
        textDensity: rawText.trim().length
      });
    }

    const { pages: cleanedPages, repeatedLineCandidates, droppedLineCount } = cleanExtractedPages(pages);
    const sections = buildSectionsFromPages(cleanedPages);
    const lessons = buildLessonDrafts(sections);
    const cardBuild = buildLearningCards({ pages: cleanedPages, courseId: source.courseId, lessons });
    const cards = cardBuild.cards;
    const warnings: string[] = [];
    const totalTextLength = cleanedPages.reduce((sum, page) => sum + page.cleanedText.length, 0);
    const lowTextDensity = totalTextLength < 120 || cleanedPages.every((page) => page.cleanedText.length < 40);

    if (lowTextDensity) {
      warnings.push("텍스트 밀도가 낮아 이미지 기반 PDF 또는 스캔 문서일 수 있습니다.");
    }

    if (cards.length === 0) {
      warnings.push("학습 카드 생성량이 적어 fallback 카드로 대체했습니다.");
    }

    return {
      courseId: source.courseId,
      source,
      status: cards.length > 0 ? "ready" : "failed",
      extractedAt: new Date().toISOString(),
      pageCount: cleanedPages.length,
      pages: cleanedPages,
      sections,
      lessons,
      cards,
      warnings,
      errorMessage: cards.length > 0 ? undefined : "텍스트를 충분히 추출하지 못했습니다.",
      debug: {
        repeatedLineCandidates,
        droppedLineCount,
        sectionCount: sections.length,
        lessonCount: lessons.length,
        lowTextDensity,
        fallbackApplied: cards.length === 0,
        pageTypeClassification: cardBuild.pageTypeClassification,
        vietnameseCandidateLines: cardBuild.vietnameseCandidateLines,
        attachedTranslationLines: cardBuild.attachedTranslationLines,
        excludedNoiseLines: cardBuild.excludedNoiseLines,
        finalLearningCards: cardBuild.finalLearningCards
      }
    };
  } catch (error) {
    const message = toExtractionErrorMessage(error);

    if (message.includes("암호") || message.includes("스캔") || message.includes("텍스트")) {
      return buildUnsupportedDocument(source, message);
    }

    return {
      courseId: source.courseId,
      source,
      status: "failed",
      pageCount: 0,
      pages: [],
      sections: [],
      lessons: [],
      cards: [],
      warnings: [],
      errorMessage: message,
      debug: { ...emptyDebug }
    };
  }
};

function groupRows(items: PdfItem[]) {
  const rows: Array<{ text: string; x: number; y: number }> = [];

  items
    .map((item) => ({
      text: item.str.replace(/\s+/g, " ").trim(),
      x: item.transform[4],
      y: item.transform[5]
    }))
    .filter((item) => item.text)
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .forEach((item) => {
      const row = rows.find((candidate) => Math.abs(candidate.y - item.y) < 3);
      if (!row) {
        rows.push({ ...item });
        return;
      }

      row.text = `${row.text} ${item.text}`.replace(/\s+/g, " ").trim();
    });

  return rows;
}

function toExtractionErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybe = error as { name?: string; message?: string; code?: number };

    if (maybe.name === "PasswordException" || maybe.code === 1 || maybe.code === 2) {
      return "암호화된 PDF라서 브라우저에서 바로 추출할 수 없습니다.";
    }

    if (maybe.message?.toLowerCase().includes("password")) {
      return "암호화된 PDF라서 브라우저에서 바로 추출할 수 없습니다.";
    }

    if (maybe.message?.toLowerCase().includes("invalid pdf")) {
      return "PDF 형식을 인식하지 못했습니다.";
    }
  }

  return error instanceof Error ? error.message : "PDF 추출 중 알 수 없는 오류가 발생했습니다.";
}
