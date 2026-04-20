import type { LearningCard } from "../types/extraction";
import type { SpeechSegment, SpeechVoiceOption } from "../types/speech";

interface SpeechControlPanelProps {
  card: LearningCard;
  voices: SpeechVoiceOption[];
  selectedVoiceId?: string;
  isVoiceLoading: boolean;
  isSupported: boolean;
  isSpeaking: boolean;
  activeCardId?: string;
  autoRepeat: boolean;
  preferSlowListening: boolean;
  onSelectVoice: (voiceId: string) => void;
  onToggleAutoRepeat: () => void;
  onTogglePreferSlowListening: () => void;
  onPlayFull: () => void;
  onPlaySlow: () => void;
  onReplay: () => void;
  onStop: () => void;
  onPlaySegment: (segment: SpeechSegment) => void;
  fallbackMessage?: string;
}

export function SpeechControlPanel({
  card,
  voices,
  selectedVoiceId,
  isVoiceLoading,
  isSupported,
  isSpeaking,
  activeCardId,
  autoRepeat,
  preferSlowListening,
  onSelectVoice,
  onToggleAutoRepeat,
  onTogglePreferSlowListening,
  onPlayFull,
  onPlaySlow,
  onReplay,
  onStop,
  onPlaySegment,
  fallbackMessage
}: SpeechControlPanelProps) {
  const speechSegments = buildSegments(card);
  const isActive = activeCardId === card.id;

  return (
    <section
      className={`overflow-hidden rounded-[32px] p-5 shadow-soft transition ${
        isActive
          ? "border border-ocean/30 bg-[linear-gradient(180deg,_rgba(15,139,141,0.14),_rgba(255,255,255,1))]"
          : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Listening Focus</p>
          <h3 className="display-font mt-2 text-3xl font-bold leading-tight text-ink">{card.front}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            듣기가 이 앱의 중심입니다. 문장을 여러 번 듣고, 느린 듣기로 음절을 잡은 뒤 따라 읽기로 넘어가세요.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isSpeaking && isActive ? "bg-coral text-white" : "bg-shell text-ink/60"
          }`}
        >
          {isSpeaking && isActive ? "재생 중" : "대기"}
        </span>
      </div>

      <div className="mt-5 rounded-[26px] bg-ink p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-mint">음성 선택</p>
            <p className="mt-1 text-sm text-white/72">
              {isSupported
                ? isVoiceLoading
                  ? "음성 목록을 불러오는 중입니다."
                  : voices.length > 0
                    ? "vi-VN 음성을 우선으로 추천합니다."
                    : "사용 가능한 음성을 찾지 못했습니다."
                : "이 브라우저나 기기에서는 음성 재생이 지원되지 않습니다."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TogglePill active={preferSlowListening} label="느린 듣기 기본" onClick={onTogglePreferSlowListening} />
            <TogglePill active={autoRepeat} label="반복 루프" onClick={onToggleAutoRepeat} />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-white/55" htmlFor={`voice-${card.id}`}>
            베트남어 음성
          </label>
          <select
            id={`voice-${card.id}`}
            value={selectedVoiceId ?? ""}
            disabled={!isSupported || voices.length === 0}
            onChange={(event) => onSelectVoice(event.target.value)}
            className="mt-2 w-full rounded-[20px] border-0 bg-white px-4 py-4 text-base font-semibold text-ink outline-none"
          >
            {voices.length === 0 ? (
              <option value="">사용 가능한 음성 없음</option>
            ) : (
              voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} · {voice.lang}
                </option>
              ))
            )}
          </select>
        </div>

        {!isSupported || voices.length === 0 ? (
          <div className="mt-4 rounded-[20px] bg-white/10 p-4 text-sm leading-6 text-white/78">
            {fallbackMessage ??
              "이 기기에서는 음성이 제공되지 않을 수 있습니다. 이 경우에는 구 단위 분절과 따라 읽기 UI를 중심으로 학습을 계속할 수 있습니다."}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <AudioButton label="재생" tone="primary" onClick={onPlayFull} />
          <AudioButton label="정지" tone="secondary" onClick={onStop} />
          <AudioButton label="다시 듣기" tone="secondary" onClick={onReplay} />
          <AudioButton label="느리게 듣기" tone="secondary" onClick={onPlaySlow} />
        </div>
      </div>

      <div className="mt-4 rounded-[24px] bg-shell p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">구 단위 반복 듣기</p>
            <p className="mt-1 text-sm text-ink/58">문장 길이에 따라 끊어서 반복 재생할 수 있게 준비했습니다.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/55">
            {speechSegments.length} segments
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {speechSegments.map((segment) => (
            <button
              key={segment.id}
              type="button"
              onClick={() => onPlaySegment(segment)}
              className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft"
            >
              {segment.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudioButton({
  label,
  onClick,
  tone
}: {
  label: string;
  onClick: () => void;
  tone: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] px-4 py-4 text-base font-semibold ${
        tone === "primary" ? "bg-coral text-white" : "bg-white text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function TogglePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active ? "bg-mint text-ink" : "bg-white/10 text-white"
      }`}
    >
      {label}
    </button>
  );
}

function buildSegments(card: LearningCard): SpeechSegment[] {
  const candidates = card.front
    .split(/[,.!?;:\n]/g)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (candidates.length === 0) {
    return [
      {
        id: `${card.id}-full`,
        label: "전체",
        text: card.front
      }
    ];
  }

  return candidates.slice(0, 3).map((segment, index) => ({
    id: `${card.id}-segment-${index + 1}`,
    label: candidates.length === 1 ? "전체" : `구간 ${index + 1}`,
    text: segment
  }));
}
