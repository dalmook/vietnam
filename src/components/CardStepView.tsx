import { QuizQuestionView } from "./QuizQuestionView";
import { buildMeaningText } from "../lib/lessonPlayer";
import { buildHighlightTokens, splitIntoPhraseChunks } from "../lib/vietnameseText";
import type { LearningCard } from "../types/extraction";
import type { LessonPlayerAnswer, LessonPlayerStep } from "../types/lessonPlayer";
import type { QuizQuestion } from "../types/quiz";

interface CardStepViewProps {
  card: LearningCard;
  step: LessonPlayerStep;
  answer?: LessonPlayerAnswer;
  quizQuestion?: QuizQuestion;
  isSpeaking?: boolean;
  showTranslation?: boolean;
  learnerMode?: "beginner" | "intermediate";
  onPlayAudio: () => void;
  onAnswer: (answer: LessonPlayerAnswer) => void;
}

export function CardStepView({
  card,
  step,
  answer,
  quizQuestion,
  isSpeaking = false,
  showTranslation = true,
  learnerMode = "beginner",
  onPlayAudio,
  onAnswer
}: CardStepViewProps) {
  const phraseChunks = splitIntoPhraseChunks(card.front);
  const tokens = buildHighlightTokens(card.front);
  const isBeginner = learnerMode === "beginner";

  if (step === "quiz" && quizQuestion) {
    return (
      <QuizQuestionView
        question={quizQuestion}
        submission={answer}
        onSubmit={onAnswer}
        onReplayAudio={onPlayAudio}
      />
    );
  }

  return (
    <section
      className={`rounded-[32px] p-5 shadow-soft transition ${
        isSpeaking
          ? "border border-coral/30 bg-[linear-gradient(180deg,_rgba(255,122,89,0.1),_rgba(255,255,255,1))]"
          : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">{getStepTitle(step)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tokens.map((token, index) => (
              <span
                key={`${token.text}-${index}`}
                className={`rounded-full px-3 py-2 text-lg font-semibold leading-none ${
                  token.hasTone
                    ? "bg-coral/12 text-coral"
                    : token.isKey
                      ? "bg-gold/24 text-ink"
                      : "bg-shell text-ink/72"
                }`}
              >
                {token.text}
              </span>
            ))}
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isSpeaking ? "bg-coral text-white" : "bg-shell text-ink/60"
          }`}
        >
          {isSpeaking ? "발음 재생 중" : card.type}
        </span>
      </div>

      <div className="mt-5 rounded-[26px] bg-shell p-5">
        <div className="rounded-[22px] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ocean">구 단위 분절</p>
            <span className="rounded-full bg-shell px-3 py-1 text-[11px] font-semibold text-ink/55">
              {learnerMode === "beginner" ? "입문자 보기" : "중급자 보기"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {phraseChunks.map((chunk, index) => (
              <span
                key={`${chunk}-${index}`}
                className="rounded-2xl bg-mint/30 px-3 py-2 text-sm font-semibold text-ink"
              >
                {chunk}
              </span>
            ))}
          </div>
        </div>

        {step === "listen" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-ink/68">
              먼저 문장 전체를 여러 번 들어 보세요. 성조가 들어간 핵심 음절은 색으로 강조되어 더 잘 보이게 했습니다.
            </p>
            {isBeginner && (
              <div className="rounded-[22px] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">듣기 포인트</p>
                <p className="mt-2 text-sm leading-6 text-ink/68">
                  노란색은 핵심 단어, 산호색은 성조가 잘 드러나는 부분입니다. 처음에는 뜻보다 소리 덩어리를 구분해 보세요.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={onPlayAudio}
              className="w-full rounded-[22px] bg-ink px-4 py-4 text-base font-semibold text-white"
            >
              이 카드 다시 듣기
            </button>
          </div>
        )}

        {step === "repeat" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-ink/68">
              문장을 한 번에 읽기보다 위에 보이는 구 단위로 끊어 따라 읽으면 훨씬 안정적입니다.
            </p>
            <div className="rounded-[22px] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">따라 읽기 추천</p>
              <div className="mt-3 space-y-2">
                {phraseChunks.map((chunk, index) => (
                  <div key={`${chunk}-${index}`} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-ink">{chunk}</p>
                  </div>
                ))}
              </div>
              {card.hint && <p className="mt-3 text-sm leading-6 text-ink/55">{card.hint}</p>}
            </div>
          </div>
        )}

        {step === "meaning" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-ink/68">
              뜻과 쓰임을 확인하는 단계입니다. 화면이 복잡해지지 않도록 번역은 한 덩어리로만 보여 줍니다.
            </p>
            <div className="rounded-[22px] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">뜻 확인</p>
              <p className="mt-2 text-base leading-7 text-ink">
                {showTranslation ? buildMeaningText(card) : "번역 보기 옵션이 꺼져 있습니다. 문맥과 발음을 기준으로 먼저 의미를 떠올려 보세요."}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function getStepTitle(step: LessonPlayerStep) {
  switch (step) {
    case "listen":
      return "듣기";
    case "repeat":
      return "따라 읽기";
    case "meaning":
      return "뜻 확인";
    case "quiz":
      return "퀴즈";
  }
}
