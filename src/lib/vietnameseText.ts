const vietnameseVowelPattern = /[aăâeêioôơuưyáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
const toneMarkPattern = /[áàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

export interface HighlightToken {
  text: string;
  isKey: boolean;
  hasTone: boolean;
}

export const splitIntoPhraseChunks = (text: string) => {
  const punctuationChunks = text
    .split(/([,.!?;:])/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const merged: string[] = [];
  for (let index = 0; index < punctuationChunks.length; index += 1) {
    const current = punctuationChunks[index];
    if (/^[,.!?;:]$/.test(current) && merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]}${current}`;
      continue;
    }

    const words = current.split(/\s+/);
    if (words.length <= 4) {
      merged.push(current);
      continue;
    }

    for (let wordIndex = 0; wordIndex < words.length; wordIndex += 4) {
      merged.push(words.slice(wordIndex, wordIndex + 4).join(" "));
    }
  }

  return merged;
};

export const buildHighlightTokens = (text: string): HighlightToken[] => {
  const words = text.split(/\s+/).filter(Boolean);

  return words.map((word, index) => {
    const clean = word.replace(/[,.!?;:]/g, "");
    const hasTone = toneMarkPattern.test(clean);
    const isKey =
      hasTone ||
      clean.length >= 5 ||
      (index === 0 && vietnameseVowelPattern.test(clean)) ||
      clean.includes("kh") ||
      clean.includes("ng");

    return {
      text: word,
      isKey,
      hasTone
    };
  });
};
