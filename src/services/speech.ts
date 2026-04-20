export interface SpeechProvider {
  supported: boolean;
  speak(text: string, options?: { rate?: number; lang?: string }): void;
  stop(): void;
}

const DEFAULT_LANG = "vi-VN";

export const createSpeechProvider = (): SpeechProvider => {
  if (!("speechSynthesis" in window)) {
    return {
      supported: false,
      speak: () => undefined,
      stop: () => undefined
    };
  }

  const synth = window.speechSynthesis;

  const pickVoice = (lang: string) =>
    synth.getVoices().find((voice) => voice.lang.toLowerCase().startsWith(lang.toLowerCase()));

  return {
    supported: true,
    speak(text, options) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang ?? DEFAULT_LANG;
      utterance.rate = options?.rate ?? 1;
      const voice = pickVoice(utterance.lang);
      if (voice) {
        utterance.voice = voice;
      }
      synth.speak(utterance);
    },
    stop() {
      synth.cancel();
    }
  };
};
