import { useEffect, useMemo, useState } from "react";
import { CardStepView } from "./CardStepView";
import { ResultSummary } from "./ResultSummary";
import { SessionProgressBar } from "./SessionProgressBar";
import { SpeechControlPanel } from "./SpeechControlPanel";
import { pickPreferredVoice, useSpeechService } from "../hooks/useSpeechService";
import { useUserSettings } from "../hooks/useUserSettings";
import { buildSessionResult, calculateStepProgress, getStepLabel, lessonStepOrder } from "../lib/lessonPlayer";
import { RuleBasedQuizGenerator } from "../services/quizGenerator";
import type { LessonListItem } from "../types/course";
import type { LearningCard } from "../types/extraction";
import type { LessonPlayerAnswer, LessonPlayerPhase, LessonSessionResult } from "../types/lessonPlayer";
import type { QuizQuestion } from "../types/quiz";
import type { SpeechSegment } from "../types/speech";

interface LessonPlayerProps {
  lesson: LessonListItem;
  cards: LearningCard[];
  onComplete: (result: LessonSessionResult, cards: LearningCard[]) => Promise<void> | void;
  onExit: () => void;
}

export function LessonPlayer({ lesson, cards, onComplete, onExit }: LessonPlayerProps) {
  const quizGenerator = useMemo(() => new RuleBasedQuizGenerator(), []);
  const [phase, setPhase] = useState<LessonPlayerPhase>("intro");
  const [sessionMode, setSessionMode] = useState<"main" | "review">("main");
  const [activeCards, setActiveCards] = useState(cards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LessonPlayerAnswer>>({});
  const [result, setResult] = useState<LessonSessionResult>();
  const [hasPersistedCompletion, setHasPersistedCompletion] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingCardId, setActiveSpeakingCardId] = useState<string>();
  const [speechFeedback, setSpeechFeedback] = useState<string>();
  const { speechService, voices, isLoadingVoices, isSupported } = useSpeechService();
  const { settings, isReady: areSettingsReady, updateSettings } = useUserSettings();

  useEffect(() => {
    setActiveCards(cards);
    setCurrentCardIndex(0);
    setCurrentStepIndex(0);
    setAnswers({});
    setResult(undefined);
    setPhase("intro");
    setSessionMode("main");
    setHasPersistedCompletion(false);
    setSpeechFeedback(undefined);
    setIsSpeaking(false);
    setActiveSpeakingCardId(undefined);
  }, [cards, lesson.id]);

  useEffect(() => {
    speechService.stop();
    setIsSpeaking(false);
    setActiveSpeakingCardId(undefined);

    return () => {
      speechService.stop();
    };
  }, [currentCardIndex, currentStepIndex, phase, speechService]);

  useEffect(() => {
    if (!areSettingsReady || voices.length === 0) {
      return;
    }

    const preferredVoiceId = pickPreferredVoice(voices, settings.selectedVoiceId);
    if (preferredVoiceId && preferredVoiceId !== settings.selectedVoiceId) {
      void updateSettings({ selectedVoiceId: preferredVoiceId });
    }
  }, [areSettingsReady, settings.selectedVoiceId, updateSettings, voices]);

  const quizQuestions = useMemo<QuizQuestion[]>(
    () =>
      activeCards.map((card, index) =>
        quizGenerator.generateQuiz({
          card,
          lessonCards: activeCards,
          cardIndex: index
        })
      ),
    [activeCards, quizGenerator]
  );

  const currentCard = activeCards[currentCardIndex];
  const currentStep = lessonStepOrder[currentStepIndex];
  const currentQuiz = quizQuestions[currentCardIndex];
  const totalCards = Math.max(activeCards.length, 1);
  const lessonProgressRate = (currentCardIndex + (phase === "summary" ? 1 : 0)) / totalCards;
  const progressRate =
    phase === "playing"
      ? calculateStepProgress(currentCardIndex, currentStepIndex, activeCards.length)
      : phase === "summary"
        ? 1
        : 0;

  const currentAnswer = currentCard ? answers[currentCard.id] : undefined;
  const canMoveNext = phase === "playing" && (currentStep !== "quiz" || Boolean(currentAnswer));

  const startLesson = () => {
    setPhase("playing");
    setCurrentCardIndex(0);
    setCurrentStepIndex(0);
  };

  const movePrevious = () => {
    if (phase !== "playing") {
      return;
    }

    if (currentStepIndex > 0) {
      setCurrentStepIndex((value) => value - 1);
      return;
    }

    if (currentCardIndex > 0) {
      setCurrentCardIndex((value) => value - 1);
      setCurrentStepIndex(lessonStepOrder.length - 1);
    }
  };

  const moveNext = async () => {
    if (phase !== "playing") {
      return;
    }

    if (currentStepIndex < lessonStepOrder.length - 1) {
      setCurrentStepIndex((value) => value + 1);
      return;
    }

    if (currentCardIndex < activeCards.length - 1) {
      setCurrentCardIndex((value) => value + 1);
      setCurrentStepIndex(0);
      return;
    }

    const submissions = Object.values(answers);
    const nextResult = buildSessionResult({
      lessonId: lesson.id,
      cards: activeCards,
      answers: submissions,
      previousRewards: {
        totalXp: 0,
        streak: 0,
        completedCount: 0
      }
    });

    setResult(nextResult);
    setPhase("summary");

    if (sessionMode === "main" && !hasPersistedCompletion) {
      await onComplete(nextResult, activeCards);
      setHasPersistedCompletion(true);
    }
  };

  const handleAnswer = (answer: LessonPlayerAnswer) => {
    setAnswers((value) => ({
      ...value,
      [answer.cardId]: answer
    }));
  };

  const handleReviewWrongAnswers = () => {
    if (!result || result.wrongCards.length === 0) {
      return;
    }

    setActiveCards(result.wrongCards);
    setCurrentCardIndex(0);
    setCurrentStepIndex(0);
    setAnswers({});
    setResult(undefined);
    setSessionMode("review");
    setPhase("playing");
    setSpeechFeedback("틀린 카드만 다시 보는 복습 모드로 전환했습니다.");
  };

  const speakCard = (text: string, options?: { rate?: number }) => {
    if (!currentCard) {
      return;
    }

    const baseRate = settings.preferSlowListening ? Math.min(settings.speechRate, 0.82) : settings.speechRate;

    speechService.speak({
      text,
      lang: "vi-VN",
      voiceId: settings.selectedVoiceId,
      rate: options?.rate ?? baseRate,
      autoRepeat: settings.autoRepeat,
      repeatCount: 2,
      onStart: () => {
        setIsSpeaking(true);
        setActiveSpeakingCardId(currentCard.id);
        setSpeechFeedback(undefined);
      },
      onEnd: () => {
        setIsSpeaking(false);
      },
      onError: (errorMessage) => {
        setIsSpeaking(false);
        setActiveSpeakingCardId(undefined);
        setSpeechFeedback(errorMessage);
      }
    });
  };

  const playFullAudio = () => {
    if (currentCard) {
      speakCard(currentCard.front);
    }
  };

  const replayAudio = () => {
    if (currentCard) {
      speakCard(currentCard.front);
    }
  };

  const playSlowAudio = () => {
    if (currentCard) {
      speakCard(currentCard.front, { rate: Math.max(0.6, settings.speechRate - 0.2) });
    }
  };

  const stopAudio = () => {
    speechService.stop();
    setIsSpeaking(false);
    setActiveSpeakingCardId(undefined);
  };

  const playSegment = (segment: SpeechSegment) => {
    speakCard(segment.text, { rate: Math.max(0.6, settings.speechRate - 0.08) });
  };

  if (cards.length === 0) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">이 lesson에는 아직 재생할 카드가 없습니다.</p>
      </section>
    );
  }

  return (
    <div className="pb-36">
      {phase === "intro" && (
        <section className="rounded-[32px] bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Lesson Start</p>
          <h3 className="display-font mt-2 text-3xl font-bold leading-tight text-ink">{lesson.coreTopic}</h3>
          <p className="mt-3 text-sm leading-6 text-ink/68">{lesson.representativeSentence}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoCard label="카드 수" value={`${cards.length}`} />
            <InfoCard label="학습 모드" value={settings.learnerMode === "beginner" ? "입문자" : "중급자"} />
            <InfoCard label="듣기 기본값" value={settings.preferSlowListening ? "느리게" : "기본 속도"} />
            <InfoCard label="번역 보기" value={settings.showTranslation ? "표시" : "숨김"} />
          </div>
        </section>
      )}

      {phase === "playing" && currentCard && (
        <div className="space-y-4">
          <SessionProgressBar
            progressRate={progressRate}
            lessonProgressRate={lessonProgressRate}
            currentCardNumber={currentCardIndex + 1}
            totalCards={activeCards.length}
            currentStepNumber={currentStepIndex + 1}
            totalSteps={lessonStepOrder.length}
            stepLabel={getStepLabel(currentStep)}
          />
          <SpeechControlPanel
            card={currentCard}
            voices={voices}
            selectedVoiceId={settings.selectedVoiceId}
            isVoiceLoading={isLoadingVoices}
            isSupported={isSupported}
            isSpeaking={isSpeaking}
            activeCardId={activeSpeakingCardId}
            autoRepeat={settings.autoRepeat}
            preferSlowListening={settings.preferSlowListening}
            onSelectVoice={(voiceId) => {
              void updateSettings({ selectedVoiceId: voiceId });
            }}
            onToggleAutoRepeat={() => {
              void updateSettings({ autoRepeat: !settings.autoRepeat });
            }}
            onTogglePreferSlowListening={() => {
              void updateSettings({ preferSlowListening: !settings.preferSlowListening });
            }}
            onPlayFull={playFullAudio}
            onPlaySlow={playSlowAudio}
            onReplay={replayAudio}
            onStop={stopAudio}
            onPlaySegment={playSegment}
            fallbackMessage={speechFeedback}
          />
          <CardStepView
            card={currentCard}
            step={currentStep}
            answer={currentAnswer}
            quizQuestion={currentQuiz}
            isSpeaking={isSpeaking && activeSpeakingCardId === currentCard.id}
            showTranslation={settings.showTranslation}
            learnerMode={settings.learnerMode}
            onPlayAudio={playFullAudio}
            onAnswer={handleAnswer}
          />
        </div>
      )}

      {phase === "summary" && result && <ResultSummary result={result} totalXp={result.xpEarned} />}

      <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[28px] bg-white/95 p-3 shadow-float backdrop-blur">
        {phase === "intro" && (
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <button
              type="button"
              onClick={onExit}
              className="rounded-[22px] bg-shell px-4 py-4 text-base font-semibold text-ink"
            >
              나가기
            </button>
            <button
              type="button"
              onClick={startLesson}
              className="rounded-[22px] bg-ink px-6 py-4 text-base font-semibold text-white"
            >
              lesson 시작
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={movePrevious}
              disabled={currentCardIndex === 0 && currentStepIndex === 0}
              className="rounded-[22px] bg-shell px-4 py-4 text-base font-semibold text-ink disabled:opacity-45"
            >
              이전
            </button>
            <button
              type="button"
              onClick={() => {
                void moveNext();
              }}
              disabled={!canMoveNext}
              className="rounded-[22px] bg-ink px-4 py-4 text-base font-semibold text-white disabled:opacity-45"
            >
              {currentCardIndex === activeCards.length - 1 && currentStepIndex === lessonStepOrder.length - 1
                ? "결과 보기"
                : "다음"}
            </button>
          </div>
        )}

        {phase === "summary" && (
          <div className={`grid gap-3 ${result?.reviewCardIds.length ? "grid-cols-2" : "grid-cols-1"}`}>
            {result?.reviewCardIds.length ? (
              <button
                type="button"
                onClick={handleReviewWrongAnswers}
                className="rounded-[22px] bg-shell px-4 py-4 text-base font-semibold text-ink"
              >
                오답 복습
              </button>
            ) : null}
            <button
              type="button"
              onClick={onExit}
              className="rounded-[22px] bg-ink px-4 py-4 text-base font-semibold text-white"
            >
              코스로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-shell p-4">
      <p className="text-xs font-medium text-ink/45">{label}</p>
      <p className="mt-2 text-base font-semibold text-ink">{value}</p>
    </div>
  );
}
