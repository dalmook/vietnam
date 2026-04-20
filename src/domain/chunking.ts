import type { LessonCard, ParsedLine } from "./types";

const KOREAN_REGEX = /[가-힣]/;
const VIETNAMESE_REGEX = /[A-Za-zÀ-ỹĐđ]/;

const normalize = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/[“”"]/g, "")
    .replace(/[(){}\[\]]/g, " ")
    .trim();

const looksVietnamese = (value: string) =>
  VIETNAMESE_REGEX.test(value) && !KOREAN_REGEX.test(value.slice(0, 8));

const looksGloss = (value: string) => KOREAN_REGEX.test(value) && value.length <= 120;

const splitFragments = (value: string) =>
  value
    .split(/(?<=[.!?;:])\s+|\s{2,}|\s*\/\s*/g)
    .flatMap((part) => part.split(/\s*[•·]\s*/g))
    .flatMap((part) => (part.length > 56 ? part.split(/,\s+|\s+và\s+|\s+nhưng\s+/gi) : [part]))
    .map((part) => normalize(part))
    .filter((part) => part.length >= 4 && part.length <= 84);

const focusWords = (value: string) =>
  Array.from(
    new Set(
      value
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((word) => word.length >= 2)
    )
  ).slice(0, 4);

const findGloss = (lines: ParsedLine[], index: number) => {
  const candidates = [lines[index + 1], lines[index - 1], lines[index + 2], lines[index - 2]]
    .filter(Boolean)
    .map((line) => normalize(line!.text))
    .filter(looksGloss);

  return candidates[0];
};

export const chunkLinesIntoCards = (lines: ParsedLine[], prefix: string) => {
  const cards: LessonCard[] = [];

  lines.forEach((line, index) => {
    const normalized = normalize(line.text);
    if (!normalized || !looksVietnamese(normalized)) {
      return;
    }

    const gloss = findGloss(lines, index);

    splitFragments(normalized).forEach((fragment) => {
      cards.push({
        id: `${prefix}-card-${cards.length + 1}`,
        page: line.page,
        order: cards.length,
        vietnamese: fragment,
        gloss,
        focusWords: focusWords(fragment),
        audioText: fragment
      });
    });
  });

  return cards;
};
