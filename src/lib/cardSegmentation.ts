import {
  classifyPageContent,
  cleanBulletPrefixes,
  isDecorativeHeading,
  isLikelyTranslationLine,
  isLikelyVietnamese,
  mergeWrappedLines,
  normalizeVietnameseSpacing,
  repairBrokenDiacriticsIfPossible,
  stripDecorativeDuplications
} from "./languageExtraction";
import type {
  DebugLineWithReason,
  ExtractedPage,
  LearningCard,
  LearningCardType,
  LessonDraft,
  ParsedSection
} from "../types/extraction";

interface BuildCardResult {
  cards: LearningCard[];
  vietnameseCandidateLines: DebugLineWithReason[];
  attachedTranslationLines: DebugLineWithReason[];
  excludedNoiseLines: DebugLineWithReason[];
  finalLearningCards: Array<{ id: string; type: LearningCardType; reason: string; pageNumber: number }>;
  pageTypeClassification: Array<{ pageNumber: number; pageType: NonNullable<ExtractedPage["pageType"]>; reason: string }>;
}

const speakerPattern = /^([A-Z][a-zA-Z]{1,12})\s*[:：]\s*(.+)$/;

const estimateDifficulty = (text: string, type: LearningCardType): 1 | 2 | 3 | 4 | 5 => {
  const words = text.split(/\s+/).filter(Boolean).length;
  if (type === "vocabulary") return 1;
  if (type === "phrase") return 2;
  if (type === "note") return 2;
  if (type === "dialogue") return words > 7 ? 4 : 3;
  if (words >= 12) return 5;
  if (words >= 8) return 4;
  return 3;
};

const splitViKoPair = (line: string) => {
  const normalized = normalizeVietnameseSpacing(line);
  const match = normalized.match(/^(.+?)\s{1,}([가-힣].+)$/);
  if (!match) {
    return { vietnamese: normalized, korean: undefined };
  }

  const [, vi, ko] = match;
  return {
    vietnamese: normalizeVietnameseSpacing(vi),
    korean: normalizeVietnameseSpacing(ko)
  };
};

const classifyCardType = (text: string, pageType?: ExtractedPage["pageType"]): LearningCardType => {
  if (pageType === "dialogue") {
    return "dialogue";
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 2) return "vocabulary";
  if (wordCount <= 6) return "phrase";
  return "sentence";
};

export const buildSectionsFromPages = (pages: ExtractedPage[]) => {
  const sections: ParsedSection[] = [];

  pages.forEach((page) => {
    if (!page.cleanedText.trim()) {
      return;
    }

    const titleLine =
      page.lines.map((line) => normalizeVietnameseSpacing(line.text)).find((line) => !isDecorativeHeading(line)) ??
      `Page ${page.pageNumber}`;

    sections.push({
      id: `section-${page.pageNumber}`,
      title: titleLine,
      pageStart: page.pageNumber,
      pageEnd: page.pageNumber,
      content: page.cleanedText.split(/\n+/).map((line) => line.trim()).filter(Boolean)
    });
  });

  return sections;
};

export const buildLessonDrafts = (sections: ParsedSection[]) =>
  sections.map((section, index) => ({
    id: `lesson-draft-${index + 1}`,
    sectionId: section.id,
    title: section.title,
    summary: section.content.slice(0, 2).join(" ").slice(0, 120),
    sourcePageNumbers: [section.pageStart],
    rawSegments: section.content
  } satisfies LessonDraft));

export const buildLearningCards = ({
  pages,
  courseId,
  lessons
}: {
  pages: ExtractedPage[];
  courseId: string;
  lessons: LessonDraft[];
}): BuildCardResult => {
  const cards: LearningCard[] = [];
  const vietnameseCandidateLines: DebugLineWithReason[] = [];
  const attachedTranslationLines: DebugLineWithReason[] = [];
  const excludedNoiseLines: DebugLineWithReason[] = [];
  const finalLearningCards: Array<{ id: string; type: LearningCardType; reason: string; pageNumber: number }> = [];
  const pageTypeClassification: Array<{ pageNumber: number; pageType: NonNullable<ExtractedPage["pageType"]>; reason: string }> = [];

  pages.forEach((page) => {
    const lessonId = lessons.find((lesson) => lesson.sourcePageNumbers.includes(page.pageNumber))?.id ?? `lesson-page-${page.pageNumber}`;

    const preparedLines = stripDecorativeDuplications(
      mergeWrappedLines(page.lines.map((line) => repairBrokenDiacriticsIfPossible(cleanBulletPrefixes(line.text))))
    );

    const pageSummary = classifyPageContent(preparedLines.join("\n"), { pageNumber: page.pageNumber });
    page.pageType = pageSummary.pageType;
    page.pageTypeReason = pageSummary.reason;
    pageTypeClassification.push({ pageNumber: page.pageNumber, pageType: pageSummary.pageType, reason: pageSummary.reason });

    if (pageSummary.pageType === "cover") {
      excludedNoiseLines.push({ line: "cover-page", reason: "excluded because decorative heading", pageNumber: page.pageNumber });
      return;
    }

    if (pageSummary.pageType === "culture_note") {
      const noteLine = preparedLines.find((line) => line.length > 10) ?? "문화 노트";
      cards.push({
        id: `card-${cards.length + 1}`,
        type: "note",
        front: noteLine,
        back: undefined,
        hint: "뜻 보기로 설명을 확인하세요.",
        difficultyEstimate: 2,
        sourceText: noteLine,
        sourcePageNumber: page.pageNumber,
        lessonDraftId: lessonId,
        vietnamese: preparedLines.find((line) => isLikelyVietnamese(line)) ?? "",
        koreanMeaning: preparedLines.filter((line) => isLikelyTranslationLine(line)).join(" "),
        explanation: "문화 노트는 optional reading으로 분리됩니다.",
        sourcePage: page.pageNumber,
        sourceCourseId: courseId,
        lessonId,
        difficulty: 2,
        tags: ["culture-note", "optional"],
        audioText: preparedLines.find((line) => isLikelyVietnamese(line)) ?? "",
        hiddenByDefaultFields: ["koreanMeaning", "explanation"]
      });
      finalLearningCards.push({ id: cards[cards.length - 1].id, type: "note", reason: "grouped as culture note", pageNumber: page.pageNumber });
      return;
    }

    if (pageSummary.pageType === "dialogue") {
      const turns = preparedLines
        .map((line) => {
          const matched = line.match(speakerPattern);
          if (!matched) return undefined;
          const [, speaker, utterance] = matched;
          const pair = splitViKoPair(utterance);
          if (!isLikelyVietnamese(pair.vietnamese)) {
            return undefined;
          }

          vietnameseCandidateLines.push({ line: pair.vietnamese, reason: "kept as vietnamese dialogue", pageNumber: page.pageNumber });
          if (pair.korean) {
            attachedTranslationLines.push({ line: pair.korean, reason: "attached as koreanMeaning", pageNumber: page.pageNumber });
          }

          return {
            speaker,
            vietnamese: pair.vietnamese,
            koreanMeaning: pair.korean
          };
        })
        .filter((turn): turn is NonNullable<typeof turn> => Boolean(turn));

      if (turns.length > 0) {
        const vietnameseText = turns.map((turn) => `${turn.speaker}: ${turn.vietnamese}`).join(" ");
        const koreanText = turns.map((turn) => turn.koreanMeaning).filter(Boolean).join(" ");
        cards.push({
          id: `card-${cards.length + 1}`,
          type: "dialogue",
          front: vietnameseText,
          back: koreanText || undefined,
          hint: "역할별 따라 읽기를 지원합니다.",
          difficultyEstimate: 3,
          sourceText: vietnameseText,
          sourcePageNumber: page.pageNumber,
          lessonDraftId: lessonId,
          vietnamese: vietnameseText,
          koreanMeaning: koreanText || undefined,
          explanation: "한 줄씩 듣기 / 전체 대화 듣기 / 역할별 따라 읽기",
          sourcePage: page.pageNumber,
          sourceCourseId: courseId,
          lessonId,
          difficulty: 3,
          tags: ["dialogue", "speaker-turn"],
          audioText: turns.map((turn) => turn.vietnamese).join(" "),
          hiddenByDefaultFields: ["koreanMeaning", "explanation"],
          turns
        });
        finalLearningCards.push({ id: cards[cards.length - 1].id, type: "dialogue", reason: "grouped as dialogue turn", pageNumber: page.pageNumber });
      }

      return;
    }

    preparedLines.forEach((line) => {
      if (!line || isDecorativeHeading(line)) {
        excludedNoiseLines.push({ line, reason: "excluded because decorative heading", pageNumber: page.pageNumber });
        return;
      }

      const pair = splitViKoPair(line);

      if (!isLikelyVietnamese(pair.vietnamese)) {
        excludedNoiseLines.push({ line, reason: "excluded because mostly Korean", pageNumber: page.pageNumber });
        return;
      }

      vietnameseCandidateLines.push({ line: pair.vietnamese, reason: "kept as vietnamese sentence", pageNumber: page.pageNumber });

      if (pair.korean) {
        attachedTranslationLines.push({ line: pair.korean, reason: "attached as koreanMeaning", pageNumber: page.pageNumber });
      }

      const type = classifyCardType(pair.vietnamese, pageSummary.pageType);
      const difficulty = estimateDifficulty(pair.vietnamese, type);
      cards.push({
        id: `card-${cards.length + 1}`,
        type,
        front: pair.vietnamese,
        back: pair.korean,
        hint: "뜻 보기 버튼으로 한국어를 확인하세요.",
        difficultyEstimate: difficulty,
        sourceText: line,
        sourcePageNumber: page.pageNumber,
        lessonDraftId: lessonId,
        vietnamese: pair.vietnamese,
        koreanMeaning: pair.korean,
        explanation:
          pageSummary.pageType === "grammar_vocab"
            ? "핵심 어휘/문법 항목"
            : pageSummary.pageType === "grammar_usage"
              ? "문법 사용 예시"
              : undefined,
        sourcePage: page.pageNumber,
        sourceCourseId: courseId,
        lessonId,
        difficulty,
        tags: [pageSummary.pageType ?? "unknown", type],
        audioText: pair.vietnamese,
        hiddenByDefaultFields: ["koreanMeaning", "explanation"]
      });
      finalLearningCards.push({ id: cards[cards.length - 1].id, type, reason: "vietnamese main content", pageNumber: page.pageNumber });
    });
  });

  return {
    cards,
    vietnameseCandidateLines,
    attachedTranslationLines,
    excludedNoiseLines,
    finalLearningCards,
    pageTypeClassification
  };
};
