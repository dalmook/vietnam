import type { ExtractedPageType } from "../types/extraction";

const VIETNAMESE_DIACRITICS_REGEX = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
const HANGUL_REGEX = /[가-힣]/g;
const LATIN_REGEX = /[A-Za-zÀ-ỹ]/g;

const DECORATIVE_KEYWORDS = [
  "lesson",
  "lecture",
  "입에서 톡 터지는 베트남어",
  "오늘의 회화",
  "베트남어의",
  "종별사",
  "베트남 문화 이야기",
  "기초를 탄탄하게"
];

const COVER_HINT_REGEX = /lesson\s*\d+|lecture\s*\d+|입에서\s*톡\s*터지는\s*베트남어|today|오늘의|강의|교안/i;

export const normalizeVietnameseSpacing = (text: string) =>
  text
    .replace(/\u00a0/g, " ")
    .replace(/\s*([,.!?;:])\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();

export const repairBrokenDiacriticsIfPossible = (text: string) =>
  text
    .replace(/d\s*đ/g, "đ")
    .replace(/a\s*ˆ/g, "â")
    .replace(/o\s*ˆ/g, "ô")
    .replace(/u\s*˘/g, "ư")
    .replace(/\s+/g, " ")
    .trim();

export const mergeWrappedLines = (lines: string[]) => {
  const merged: string[] = [];

  lines.forEach((rawLine) => {
    const line = normalizeVietnameseSpacing(rawLine);
    if (!line) {
      return;
    }

    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push(line);
      return;
    }

    if (!/[.!?]$/.test(previous) && /^[a-zà-ỹ0-9]/i.test(line)) {
      merged[merged.length - 1] = `${previous} ${line}`;
      return;
    }

    merged.push(line);
  });

  return merged;
};

export const cleanBulletPrefixes = (text: string) => text.replace(/^[-•·▪︎◦]\s*/, "").trim();

export const stripDecorativeDuplications = (lines: string[]) => {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = line.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const isLikelyVietnamese = (text: string) => {
  const normalized = normalizeVietnameseSpacing(text);
  if (!normalized) {
    return false;
  }

  if (VIETNAMESE_DIACRITICS_REGEX.test(normalized)) {
    return true;
  }

  const latinCount = (normalized.match(LATIN_REGEX) ?? []).length;
  const hangulCount = (normalized.match(HANGUL_REGEX) ?? []).length;

  return latinCount >= 6 && hangulCount <= Math.floor(latinCount * 0.5);
};

export const isMostlyKorean = (text: string) => {
  const normalized = normalizeVietnameseSpacing(text);
  if (!normalized) {
    return false;
  }

  const hangulCount = (normalized.match(HANGUL_REGEX) ?? []).length;
  const latinCount = (normalized.match(LATIN_REGEX) ?? []).length;

  return hangulCount > 0 && hangulCount >= latinCount;
};

export const isDecorativeHeading = (text: string) => {
  const normalized = normalizeVietnameseSpacing(text).toLowerCase();

  if (!normalized || normalized.length <= 2) {
    return true;
  }

  if (/^\d+\/?\d*$/.test(normalized)) {
    return true;
  }

  if (COVER_HINT_REGEX.test(normalized)) {
    return true;
  }

  return DECORATIVE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export const isLikelyTranslationLine = (text: string) => {
  const normalized = normalizeVietnameseSpacing(text);
  return isMostlyKorean(normalized) && normalized.length >= 2;
};

export const classifyPageContent = (text: string, pageContext: { pageNumber: number }) => {
  const normalized = normalizeVietnameseSpacing(text);
  const lines = normalized.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  const dialogueLineCount = lines.filter((line) => /^[A-Z][a-zA-Z]{1,12}\s*[:：]/.test(line)).length;
  const vocabPatternCount = lines.filter((line) => isLikelyVietnamese(line) && isLikelyTranslationLine(line)).length;
  const koreanDominantCount = lines.filter((line) => isMostlyKorean(line)).length;
  const coverHints = lines.filter((line) => isDecorativeHeading(line) || COVER_HINT_REGEX.test(line)).length;

  if (coverHints >= Math.max(2, Math.ceil(lines.length * 0.4))) {
    return { pageType: "cover" as ExtractedPageType, reason: `cover heading ratio high (p.${pageContext.pageNumber})` };
  }

  if (dialogueLineCount >= 2) {
    return { pageType: "dialogue" as ExtractedPageType, reason: `dialogue speaker lines=${dialogueLineCount}` };
  }

  if (vocabPatternCount >= 3) {
    return { pageType: "grammar_vocab" as ExtractedPageType, reason: `vietnamese+korean pair lines=${vocabPatternCount}` };
  }

  if (koreanDominantCount >= Math.max(4, Math.ceil(lines.length * 0.65)) && lines.some((line) => /문화|전통|이야기/.test(line))) {
    return { pageType: "culture_note" as ExtractedPageType, reason: "mostly korean culture explanation" };
  }

  if (lines.some((line) => isLikelyVietnamese(line)) && lines.some((line) => /예:|예문|사용법|결합/.test(line))) {
    return { pageType: "grammar_usage" as ExtractedPageType, reason: "usage examples with vietnamese lines" };
  }

  return { pageType: "unknown" as ExtractedPageType, reason: "no strong pattern" };
};
