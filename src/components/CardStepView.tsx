import { useState } from "react";
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
  const [showMeaning, setShowMeaning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const mainVietnamese = card.vietnamese || card.front;
  const phraseChunks = splitIntoPhraseChunks(mainVietnamese);
  const tokens = buildHighlightTokens(mainVietnamese);
  const isBeginner = learnerMode === "beginner";

  if (step === "quiz" && quizQuestion) {
    return (
      <QuizQuestionView
        question={{ ...quizQuestion, prompt: mainVietnamese }}
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
          <div className="mt-2 rounded-2xl bg-shell px-3 py-2 text-2xl font-bold text-ink">{mainVietnamese}</div>
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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ocean">베트남어 중심 분절</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {phraseChunks.map((chunk, index) => (
              <span key={`${chunk}-${index}`} className="rounded-2xl bg-mint/30 px-3 py-2 text-sm font-semibold text-ink">
                {chunk}
              </span>
            ))}
          </div>
        </div>

        {step === "listen" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-ink/68">TTS는 베트남어 원문만 재생합니다.</p>
            <button type="button" onClick={onPlayAudio} className="w-full rounded-[22px] bg-ink px-4 py-4 text-base font-semibold text-white">
              이 카드 다시 듣기
            </button>
          </div>
        )}

        {step === "repeat" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-ink/68">베트남어를 구 단위로 따라 읽어 보세요.</p>
            {isBeginner && card.explanation ? (
              <button
                type="button"
                onClick={() => setShowExplanation((value) => !value)}
                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink"
              >
                {showExplanation ? "설명 닫기" : "설명 보기"}
              </button>
            ) : null}
            {showExplanation && card.explanation ? <p className="text-sm text-ink/65">{card.explanation}</p> : null}
          </div>
        )}

        {step === "meaning" && (
          <div className="mt-4 space-y-4">
            <button
              type="button"
              onClick={() => setShowMeaning((value) => !value)}
              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink"
            >
              {showMeaning ? "뜻 숨기기" : "뜻 보기"}
            </button>
            {showMeaning && showTranslation ? (
              <div className="rounded-[22px] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">뜻 확인</p>
                <p className="mt-2 text-base leading-7 text-ink">{buildMeaningText(card)}</p>
              </div>
            ) : null}
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
