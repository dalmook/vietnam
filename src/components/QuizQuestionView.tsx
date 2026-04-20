import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion, QuizSubmission } from "../types/quiz";

interface QuizQuestionViewProps {
  question: QuizQuestion;
  submission?: QuizSubmission;
  onSubmit: (submission: QuizSubmission) => void;
  onReplayAudio: () => void;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export function QuizQuestionView({
  question,
  submission,
  onSubmit,
  onReplayAudio
}: QuizQuestionViewProps) {
  const [typingValue, setTypingValue] = useState("");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);

  useEffect(() => {
    setTypingValue("");
    setSelectedTokens([]);
  }, [question.id]);

  const isSubmitted = Boolean(submission);
  const availableTokens = useMemo(() => {
    if (!question.shuffledTokens) {
      return [];
    }

    const draft = [...selectedTokens];
    const source = [...question.shuffledTokens];
    draft.forEach((token) => {
      const index = source.findIndex((candidate) => candidate === token);
      if (index >= 0) {
        source.splice(index, 1);
      }
    });
    return source;
  }, [question.shuffledTokens, selectedTokens]);

  const submitChoice = (answer: string, isCorrect: boolean) => {
    if (isSubmitted) {
      return;
    }

    onSubmit({
      questionId: question.id,
      cardId: question.cardId,
      quizType: question.type,
      isCorrect,
      userAnswer: answer,
      correctAnswer: resolveCorrectAnswer(question),
      explanation: question.explanation,
      reviewTokens: question.reviewTokens ?? []
    });
  };

  const handleTypingSubmit = () => {
    const normalized = normalize(typingValue);
    const isCorrect = question.acceptedAnswers.includes(normalized);
    submitChoice(typingValue, isCorrect);
  };

  const handleOrderSubmit = () => {
    const answer = selectedTokens.join(" ");
    const isCorrect = question.acceptedAnswers.includes(normalize(answer));
    submitChoice(answer, isCorrect);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[32px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Quiz</p>
            <h4 className="display-font mt-2 text-2xl font-bold leading-tight text-ink">{question.prompt}</h4>
            <p className="mt-2 text-sm leading-6 text-ink/65">{question.instruction}</p>
          </div>
          <span className="rounded-full bg-shell px-3 py-1 text-xs font-semibold text-ink/55">
            Lv.{question.difficulty}
          </span>
        </div>

        {(question.type === "listening_choice" || question.audioText) && (
          <button
            type="button"
            onClick={onReplayAudio}
            className="mt-4 w-full rounded-[22px] bg-ink px-4 py-4 text-base font-semibold text-white"
          >
            다시 듣기
          </button>
        )}

        {(question.type === "meaning_choice" ||
          question.type === "listening_choice" ||
          question.type === "fill_blank" ||
          question.type === "true_false") &&
          question.choices && (
            <div className="mt-4 grid gap-3">
              {question.choices.map((choice) => {
                const isCorrectChoice = choice.id === question.correctChoiceId;
                const isSelected = submission?.userAnswer === choice.text;
                const tone = !submission
                  ? "bg-white text-ink"
                  : isCorrectChoice
                    ? "bg-mint text-ink"
                    : isSelected
                      ? "bg-coral text-white"
                      : "bg-white text-ink/45";

                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => submitChoice(choice.text, isCorrectChoice)}
                    className={`rounded-[22px] px-4 py-4 text-left text-base font-semibold shadow-soft ${tone}`}
                  >
                    {choice.text}
                  </button>
                );
              })}
            </div>
          )}

        {question.type === "word_order" && (
          <div className="mt-4 space-y-4">
            <div className="min-h-[88px] rounded-[22px] bg-shell p-4">
              <p className="text-xs font-medium text-ink/45">내가 만든 문장</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTokens.length > 0 ? (
                  selectedTokens.map((token, index) => (
                    <button
                      key={`${token}-${index}`}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() =>
                        setSelectedTokens((value) => value.filter((_, tokenIndex) => tokenIndex !== index))
                      }
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft"
                    >
                      {token}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-ink/45">토큰을 탭해서 문장을 완성해 보세요.</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTokens.map((token, index) => (
                <button
                  key={`${token}-${index}`}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setSelectedTokens((value) => [...value, token])}
                  className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft"
                >
                  {token}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleOrderSubmit}
              disabled={isSubmitted || selectedTokens.length === 0}
              className="w-full rounded-[22px] bg-ink px-4 py-4 text-base font-semibold text-white disabled:opacity-45"
            >
              순서 확인
            </button>
          </div>
        )}

        {question.type === "typing" && (
          <div className="mt-4 space-y-4">
            <input
              value={typingValue}
              onChange={(event) => setTypingValue(event.target.value)}
              disabled={isSubmitted}
              placeholder="짧게 입력해 보세요"
              className="w-full rounded-[22px] border-0 bg-shell px-4 py-4 text-base font-semibold text-ink outline-none"
            />
            <button
              type="button"
              onClick={handleTypingSubmit}
              disabled={isSubmitted || typingValue.trim().length === 0}
              className="w-full rounded-[22px] bg-ink px-4 py-4 text-base font-semibold text-white disabled:opacity-45"
            >
              입력 확인
            </button>
          </div>
        )}
      </section>

      <QuizFeedbackCard question={question} submission={submission} />
    </div>
  );
}

function QuizFeedbackCard({
  question,
  submission
}: {
  question: QuizQuestion;
  submission?: QuizSubmission;
}) {
  if (!submission) {
    return (
      <section className="rounded-[28px] bg-white p-4 shadow-soft">
        <p className="text-sm font-semibold text-ink">정답 즉시 피드백</p>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          답을 제출하면 정답 여부와 간단한 해설을 바로 확인할 수 있습니다.
        </p>
      </section>
    );
  }

  return (
    <section
      className={`rounded-[28px] p-4 shadow-soft ${
        submission.isCorrect ? "bg-mint/35" : "bg-coral/12"
      }`}
    >
      <p className="text-sm font-semibold text-ink">{submission.isCorrect ? "정답입니다" : "다시 보면 좋아요"}</p>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        정답: {submission.correctAnswer}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink/70">{question.explanation}</p>
    </section>
  );
}

function resolveCorrectAnswer(question: QuizQuestion) {
  if (question.correctTokens) {
    return question.correctTokens.join(" ");
  }

  if (question.correctChoiceId && question.choices) {
    return question.choices.find((choice) => choice.id === question.correctChoiceId)?.text ?? "";
  }

  return question.acceptedAnswers[0] ?? "";
}
