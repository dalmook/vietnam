import { useEffect, useMemo, useState } from "react";
import {
  buildQuizQuestion,
  flattenCourseCards,
  getCourseCompletion,
  getDefaultCourseProgress,
  getStudyCursor
} from "../domain/progress";
import type { CourseData, CourseProgress, LessonCard, LessonStep } from "../domain/types";
import { useSpeechControls } from "../hooks/useSpeechControls";

const steps: LessonStep[] = ["listen", "speak", "meaning", "quiz", "review"];
const stepLabel: Record<LessonStep, string> = {
  listen: "듣기",
  speak: "따라 읽기",
  meaning: "뜻 확인",
  quiz: "퀴즈",
  review: "복습"
};

interface StudyScreenProps {
  course: CourseData;
  progress?: CourseProgress;
  slowMode: boolean;
  onBack: () => void;
  onReviewCard: (card: LessonCard, mastered: boolean) => void;
}

export function StudyScreen({
  course,
  progress,
  slowMode,
  onBack,
  onReviewCard
}: StudyScreenProps) {
  const speech = useSpeechControls();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string>();
  const [quizChecked, setQuizChecked] = useState(false);

  const safeProgress = progress ?? getDefaultCourseProgress(course.id);
  const cursor = getStudyCursor(course, safeProgress);
  const lesson = course.chapters[0]?.lessons[cursor.lessonIndex];
  const card = lesson?.cards[cursor.cardIndex];
  const allCards = useMemo(() => flattenCourseCards(course), [course]);
  const quiz = useMemo(() => (card ? buildQuizQuestion(card, allCards) : undefined), [allCards, card]);
  const completion = Math.round(getCourseCompletion(course, safeProgress) * 100);

  useEffect(() => {
    setStepIndex(0);
    setSelectedChoice(undefined);
    setQuizChecked(false);
  }, [card?.id]);

  useEffect(() => {
    return () => speech.stop();
  }, [speech]);

  if (!card || !lesson) {
    return (
      <div className="min-h-screen bg-shell px-4 pb-8 pt-4">
        <button type="button" onClick={onBack} className="text-sm font-semibold text-ink/60">
          홈으로
        </button>
      </div>
    );
  }

  const currentStep = steps[stepIndex];
  const speakNow = (rate?: number) => speech.speak(card.audioText, { rate, lang: "vi-VN" });

  return (
    <div className="min-h-screen bg-shell px-4 pb-8 pt-4">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft"
        >
          홈
        </button>
        <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft">
          {completion}%
        </div>
      </header>

      <section className="mt-4 rounded-[30px] bg-ink p-5 text-white shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">{course.manifest.theme}</p>
        <h1 className="display-font mt-2 text-2xl font-bold">{course.manifest.title}</h1>
        <p className="mt-2 text-sm text-white/70">
          Chapter 1 · {lesson.title} · 카드 {cursor.cardIndex + 1}/{lesson.cards.length}
        </p>
      </section>

      <div className="scrollbar-hidden mt-4 flex gap-2 overflow-x-auto pb-1">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              index === stepIndex
                ? "bg-coral text-white"
                : index < stepIndex
                  ? "bg-mint text-ink"
                  : "bg-white text-ink/50"
            }`}
          >
            {stepLabel[step]}
          </div>
        ))}
      </div>

      <section className="mt-4 rounded-[34px] bg-white/92 p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ocean">
            Page {card.page}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
            Tone Focus
          </span>
        </div>

        <p className="display-font mt-4 text-[2rem] font-bold leading-tight tracking-[-0.04em] text-ink">
          {card.vietnamese}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {card.focusWords.map((word) => (
            <span
              key={word}
              className="rounded-full border border-ocean/15 bg-sand px-3 py-1 text-sm font-semibold text-ocean"
            >
              {word}
            </span>
          ))}
        </div>

        {currentStep === "listen" && (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ActionButton label="문장 듣기" onClick={() => speakNow(slowMode ? 0.75 : 1)} solid />
              <ActionButton label="느리게 반복" onClick={() => speakNow(0.65)} />
            </div>
            <HintCard text="먼저 전체 문장을 듣고, 다시 천천히 들으면서 성조가 올라가고 내려가는 지점을 귀에 붙이세요." />
            <PrimaryNext onClick={() => setStepIndex(1)} />
          </div>
        )}

        {currentStep === "speak" && (
          <div className="mt-5 space-y-3">
            <HintCard text="두 번 따라 읽고, 마지막에는 철자와 성조 표시를 보며 소리 길이를 맞춰 보세요." />
            <div className="grid grid-cols-3 gap-3">
              <ActionButton label="다시 듣기" onClick={() => speakNow(slowMode ? 0.75 : 1)} solid />
              <ActionButton label="느리게" onClick={() => speakNow(0.65)} />
              <ActionButton label="따라 읽음" onClick={() => setStepIndex(2)} accent />
            </div>
          </div>
        )}

        {currentStep === "meaning" && (
          <div className="mt-5 space-y-3">
            <HintCard
              text={card.gloss ?? "가까운 한국어 뜻 줄을 찾지 못했습니다. 먼저 문맥을 추측하고 다음 단계로 넘어가세요."}
            />
            <PrimaryNext onClick={() => setStepIndex(3)} />
          </div>
        )}

        {currentStep === "quiz" && quiz && (
          <div className="mt-5 space-y-3">
            <HintCard text={quiz.prompt} title="빈칸 퀴즈" />
            <div className="grid grid-cols-2 gap-3">
              {quiz.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setSelectedChoice(choice)}
                  className={`rounded-2xl px-4 py-4 text-base font-semibold ${
                    selectedChoice === choice ? "bg-ocean text-white" : "bg-sand text-ink"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!selectedChoice}
              onClick={() => {
                setQuizChecked(true);
                window.setTimeout(() => setStepIndex(4), 420);
              }}
              className="w-full rounded-2xl bg-ink px-4 py-4 text-base font-semibold text-white disabled:opacity-45"
            >
              정답 확인
            </button>
            {quizChecked && (
              <p className={`text-sm font-semibold ${selectedChoice === quiz.answer ? "text-ocean" : "text-coral"}`}>
                {selectedChoice === quiz.answer ? "좋아요. 정확합니다." : `정답은 ${quiz.answer}입니다.`}
              </p>
            )}
          </div>
        )}

        {currentStep === "review" && (
          <div className="mt-5 space-y-3">
            <HintCard text="익숙하면 완료, 헷갈리면 복습 큐에 남겨 둡니다. 짧게 반복하는 것이 핵심입니다." />
            <div className="grid grid-cols-2 gap-3">
              <ActionButton label="아직 헷갈림" onClick={() => onReviewCard(card, false)} />
              <ActionButton label="익혔어요" onClick={() => onReviewCard(card, true)} accent />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  solid,
  accent
}: {
  label: string;
  onClick: () => void;
  solid?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-4 text-sm font-semibold ${
        accent
          ? "bg-coral text-white"
          : solid
            ? "bg-ink text-white"
            : "bg-sand text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function HintCard({ title, text }: { title?: string; text: string }) {
  return (
    <div className="rounded-2xl bg-sand p-4">
      {title && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">{title}</p>}
      <p className={`text-sm leading-6 text-ink/75 ${title ? "mt-2" : ""}`}>{text}</p>
    </div>
  );
}

function PrimaryNext({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-ink px-4 py-4 text-base font-semibold text-white"
    >
      다음 단계
    </button>
  );
}
