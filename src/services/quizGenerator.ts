import { buildMeaningText } from "../lib/lessonPlayer";
import type { LearningCard } from "../types/extraction";
import type { QuizChoice, QuizGenerator, QuizQuestion, QuizType } from "../types/quiz";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string) => value.split(/\s+/).filter(Boolean);

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(((index + 3) * 17) % (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

const pickDistractorCards = (card: LearningCard, lessonCards: LearningCard[]) =>
  lessonCards
    .filter((candidate) => candidate.id !== card.id)
    .sort(
      (left, right) =>
        Math.abs(left.difficultyEstimate - card.difficultyEstimate) -
        Math.abs(right.difficultyEstimate - card.difficultyEstimate)
    )
    .slice(0, 4);

const buildChoicePool = (card: LearningCard, lessonCards: LearningCard[]) => {
  const correct = buildMeaningText(card);
  const distractors = pickDistractorCards(card, lessonCards)
    .map((candidate) => buildMeaningText(candidate))
    .filter((value) => normalize(value) !== normalize(correct))
    .slice(0, 3);

  return shuffle([
    { id: `${card.id}-correct`, text: correct },
    ...distractors.map((text, index) => ({
      id: `${card.id}-distractor-${index + 1}`,
      text
    }))
  ]);
};

const buildBlankedSentence = (card: LearningCard) => {
  const tokens = tokenize(card.front);
  const middleIndex = Math.min(Math.floor(tokens.length / 2), Math.max(tokens.length - 1, 0));
  const hidden = tokens[middleIndex] ?? tokens[0] ?? card.front;
  const blankedText = tokens.map((token, index) => (index === middleIndex ? "____" : token)).join(" ");

  return {
    blankedText,
    hidden
  };
};

const buildWordOrderTokens = (card: LearningCard) => {
  const tokens = tokenize(card.front).slice(0, 6);
  return {
    correctTokens: tokens,
    shuffledTokens: shuffle(tokens)
  };
};

const buildTrueFalseStatement = (card: LearningCard, lessonCards: LearningCard[]) => {
  const correctMeaning = buildMeaningText(card);
  const distractorCard = pickDistractorCards(card, lessonCards)[0];
  const useCorrect = card.difficultyEstimate <= 2 || card.id.length % 2 === 0;
  const statement = useCorrect ? correctMeaning : buildMeaningText(distractorCard ?? card);

  return {
    statement: `이 표현의 뜻은 "${statement}"이다.`,
    answer: useCorrect ? "O" : "X"
  };
};

const pickQuizType = (card: LearningCard, cardIndex: number): QuizType => {
  const weightedTypes: QuizType[] =
    card.difficultyEstimate <= 2
      ? ["meaning_choice", "listening_choice", "true_false"]
      : card.difficultyEstimate === 3
        ? ["listening_choice", "fill_blank", "meaning_choice", "true_false"]
        : card.difficultyEstimate === 4
          ? ["fill_blank", "word_order", "listening_choice", "typing"]
          : ["word_order", "typing", "fill_blank", "listening_choice"];

  return weightedTypes[cardIndex % weightedTypes.length];
};

export class RuleBasedQuizGenerator implements QuizGenerator {
  generateQuiz({
    card,
    lessonCards,
    cardIndex
  }: {
    card: LearningCard;
    lessonCards: LearningCard[];
    cardIndex: number;
  }): QuizQuestion {
    const type = pickQuizType(card, cardIndex);
    const explanation = `${buildMeaningText(card)} · 난이도 ${card.difficultyEstimate}에 맞춘 규칙 기반 문제입니다.`;

    switch (type) {
      case "meaning_choice": {
        const choices = buildChoicePool(card, lessonCards);
        return {
          id: `${card.id}-${type}`,
          cardId: card.id,
          type,
          difficulty: card.difficultyEstimate,
          prompt: card.front,
          instruction: "가장 가까운 뜻을 고르세요.",
          explanation,
          card,
          choices,
          correctChoiceId: `${card.id}-correct`,
          acceptedAnswers: [normalize(buildMeaningText(card))],
          reviewTokens: tokenize(card.front)
        };
      }
      case "listening_choice": {
        const choices = buildChoicePool(card, lessonCards);
        return {
          id: `${card.id}-${type}`,
          cardId: card.id,
          type,
          difficulty: card.difficultyEstimate,
          prompt: "문장을 듣고 뜻을 고르세요.",
          instruction: "다시 듣기 버튼으로 여러 번 들어도 됩니다.",
          explanation,
          card,
          choices,
          correctChoiceId: `${card.id}-correct`,
          acceptedAnswers: [normalize(buildMeaningText(card))],
          audioText: card.front,
          reviewTokens: tokenize(card.front)
        };
      }
      case "fill_blank": {
        const { blankedText, hidden } = buildBlankedSentence(card);
        const distractorWords = unique(
          pickDistractorCards(card, lessonCards)
            .flatMap((candidate) => tokenize(candidate.front).slice(0, 1))
            .filter((token) => normalize(token) !== normalize(hidden))
            .slice(0, 3)
        );
        const choices: QuizChoice[] = shuffle([
          { id: `${card.id}-correct`, text: hidden },
          ...distractorWords.map((text, index) => ({
            id: `${card.id}-word-${index + 1}`,
            text
          }))
        ]);

        return {
          id: `${card.id}-${type}`,
          cardId: card.id,
          type,
          difficulty: card.difficultyEstimate,
          prompt: blankedText,
          instruction: "빈칸에 들어갈 표현을 고르세요.",
          explanation,
          card,
          blankedText,
          choices,
          correctChoiceId: `${card.id}-correct`,
          acceptedAnswers: [normalize(hidden)],
          reviewTokens: [hidden]
        };
      }
      case "word_order": {
        const { correctTokens, shuffledTokens } = buildWordOrderTokens(card);
        return {
          id: `${card.id}-${type}`,
          cardId: card.id,
          type,
          difficulty: card.difficultyEstimate,
          prompt: "단어 순서를 올바르게 맞추세요.",
          instruction: "아래 토큰을 탭해서 문장을 완성하세요.",
          explanation,
          card,
          shuffledTokens,
          correctTokens,
          acceptedAnswers: [normalize(correctTokens.join(" "))],
          reviewTokens: correctTokens
        };
      }
      case "typing": {
        const answer = tokenize(card.front).slice(0, 4).join(" ");
        return {
          id: `${card.id}-${type}`,
          cardId: card.id,
          type,
          difficulty: card.difficultyEstimate,
          prompt: buildMeaningText(card),
          instruction: "짧게 베트남어로 입력해 보세요.",
          explanation,
          card,
          acceptedAnswers: [normalize(answer), normalize(card.front)],
          reviewTokens: tokenize(answer)
        };
      }
      case "true_false": {
        const { statement, answer } = buildTrueFalseStatement(card, lessonCards);
        return {
          id: `${card.id}-${type}`,
          cardId: card.id,
          type,
          difficulty: card.difficultyEstimate,
          prompt: statement,
          instruction: "이해한 내용이 맞으면 O, 아니면 X를 고르세요.",
          explanation,
          card,
          statement,
          choices: [
            { id: `${card.id}-true`, text: "O" },
            { id: `${card.id}-false`, text: "X" }
          ],
          correctChoiceId: answer === "O" ? `${card.id}-true` : `${card.id}-false`,
          acceptedAnswers: [answer],
          reviewTokens: tokenize(card.front)
        };
      }
    }
  }
}

export class AIQuizGenerator implements QuizGenerator {
  generateQuiz(_: { card: LearningCard; lessonCards: LearningCard[]; cardIndex: number }): QuizQuestion {
    throw new Error("AIQuizGenerator is not connected yet.");
  }
}
