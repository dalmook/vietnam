import { detectDialogueLine, splitIntoMeaningfulBlocks, splitSegmentForMobile } from "./textCleanup";
import type {
  ExtractedPage,
  LearningCard,
  LearningCardType,
  LessonDraft,
  ParsedSection
} from "../types/extraction";

const isVietnameseLike = (value: string) => /[A-Za-zÀ-ỹ]/.test(value);
const isKoreanLike = (value: string) => /[가-힣]/.test(value);

const classifyCardType = (text: string): LearningCardType => {
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (detectDialogueLine(text)) {
    return "dialogue";
  }

  if (text.includes(":") && wordCount <= 10) {
    return "note";
  }

  if (wordCount <= 3) {
    return "vocabulary";
  }

  if (wordCount <= 7) {
    return "phrase";
  }

  return "sentence";
};

const estimateDifficulty = (text: string, type: LearningCardType): 1 | 2 | 3 | 4 | 5 => {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasPunctuation = /[,.!?;:]/.test(text);

  if (type === "vocabulary") {
    return wordCount <= 1 ? 1 : 2;
  }

  if (type === "phrase") {
    return wordCount <= 4 ? 2 : 3;
  }

  if (type === "dialogue") {
    return hasPunctuation || wordCount > 7 ? 4 : 3;
  }

  if (type === "note") {
    return 2;
  }

  if (wordCount >= 10) {
    return 5;
  }

  if (wordCount >= 7) {
    return 4;
  }

  return 3;
};

const buildSectionTitle = (page: ExtractedPage, blocks: string[]) => {
  const title = blocks.find((block) => block.length <= 28) ?? page.lines[0]?.text ?? `Page ${page.pageNumber}`;
  return title.trim();
};

export const buildSectionsFromPages = (pages: ExtractedPage[]) => {
  const sections: ParsedSection[] = [];

  pages.forEach((page) => {
    const blocks = splitIntoMeaningfulBlocks(page.cleanedText);
    if (blocks.length === 0) {
      return;
    }

    sections.push({
      id: `section-${page.pageNumber}`,
      title: buildSectionTitle(page, blocks),
      pageStart: page.pageNumber,
      pageEnd: page.pageNumber,
      content: blocks
    });
  });

  return sections;
};

export const buildLessonDrafts = (sections: ParsedSection[]) =>
  sections.map((section, index) => {
    const summary = section.content.slice(0, 2).join(" ").slice(0, 140);
    return {
      id: `lesson-draft-${index + 1}`,
      sectionId: section.id,
      title: section.title || `Lesson ${index + 1}`,
      summary,
      sourcePageNumbers: [section.pageStart],
      rawSegments: section.content
    } satisfies LessonDraft;
  });

export const buildLearningCards = (lessons: LessonDraft[]) => {
  const cards: LearningCard[] = [];

  lessons.forEach((lesson) => {
    lesson.rawSegments.forEach((segment) => {
      splitSegmentForMobile(segment).forEach((chunk) => {
        const normalized = chunk.trim();
        if (!normalized || normalized.length < 2) {
          return;
        }

        if (!isVietnameseLike(normalized) && !isKoreanLike(normalized)) {
          return;
        }

        const type = classifyCardType(normalized);

        cards.push({
          id: `card-${cards.length + 1}`,
          type,
          front: normalized,
          back: isKoreanLike(normalized) ? undefined : undefined,
          hint: normalized.length > 32 ? "천천히 따라 읽기" : undefined,
          difficultyEstimate: estimateDifficulty(normalized, type),
          sourceText: segment,
          sourcePageNumber: lesson.sourcePageNumbers[0] ?? 1,
          lessonDraftId: lesson.id
        });
      });
    });
  });

  return cards;
};
