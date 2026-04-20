import type { ExtractedPage, ExtractedPageLine } from "../types/extraction";

const normalizeWhitespace = (value: string) =>
  value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isMostlySymbols = (value: string) => {
  const stripped = value.replace(/[\p{L}\p{N}\s]/gu, "");
  return value.length > 0 && stripped.length / value.length > 0.6;
};

const isLikelyNoiseLine = (value: string) => {
  const normalized = normalizeWhitespace(value);
  if (!normalized) {
    return true;
  }

  if (normalized.length <= 1) {
    return true;
  }

  if (isMostlySymbols(normalized)) {
    return true;
  }

  return false;
};

export const cleanExtractedPages = (pages: ExtractedPage[]) => {
  const lineFrequency = new Map<string, number>();

  pages.forEach((page) => {
    const uniqueLines = new Set(
      page.lines.map((line) => normalizeWhitespace(line.text)).filter((line) => line.length >= 2)
    );

    uniqueLines.forEach((line) => {
      lineFrequency.set(line, (lineFrequency.get(line) ?? 0) + 1);
    });
  });

  const repeatedLineCandidates = [...lineFrequency.entries()]
    .filter(([, count]) => count >= Math.max(2, Math.ceil(pages.length * 0.5)))
    .map(([line]) => line);

  let droppedLineCount = 0;

  const cleanedPages = pages.map((page) => {
    const cleanedLines: ExtractedPageLine[] = page.lines.filter((line) => {
      const normalized = normalizeWhitespace(line.text);
      const isRepeated = repeatedLineCandidates.includes(normalized);
      const remove = isLikelyNoiseLine(normalized) || isRepeated;
      if (remove) {
        droppedLineCount += 1;
      }
      return !remove;
    });

    const cleanedText = cleanedLines
      .map((line) => normalizeWhitespace(line.text))
      .filter(Boolean)
      .join("\n");

    return {
      ...page,
      cleanedText,
      lines: cleanedLines,
      textDensity: cleanedText.length
    };
  });

  return {
    pages: cleanedPages,
    repeatedLineCandidates,
    droppedLineCount
  };
};

export const splitIntoMeaningfulBlocks = (text: string) =>
  text
    .split(/\n{2,}|(?<=\.)\n|(?<=\?)\n|(?<=!)\n/g)
    .map((block) => normalizeWhitespace(block))
    .filter((block) => block.length >= 2);

export const splitSegmentForMobile = (segment: string) => {
  const normalized = normalizeWhitespace(segment);

  if (normalized.length <= 48) {
    return [normalized];
  }

  const candidates = normalized
    .split(/(?<=[.!?;:])\s+|,\s+|\s+và\s+|\s+nhưng\s+/gi)
    .map((part) => normalizeWhitespace(part))
    .filter((part) => part.length >= 2);

  if (candidates.length <= 1) {
    return [normalized];
  }

  const chunks: string[] = [];
  let buffer = "";

  candidates.forEach((part) => {
    const merged = buffer ? `${buffer} ${part}` : part;
    if (merged.length <= 54) {
      buffer = merged;
    } else {
      if (buffer) {
        chunks.push(buffer);
      }
      buffer = part;
    }
  });

  if (buffer) {
    chunks.push(buffer);
  }

  return chunks;
};

export const detectDialogueLine = (segment: string) =>
  /^[-–•]\s+/.test(segment) || /^[A-ZÀ-ỸĐ][^:]{0,18}:\s+/.test(segment);
