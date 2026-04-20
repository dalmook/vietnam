import type { SpeechService, SpeechSpeakOptions, SpeechVoiceOption } from "../types/speech";

const toVoiceOption = (voice: SpeechSynthesisVoice): SpeechVoiceOption => ({
  id: voice.voiceURI,
  name: voice.name,
  lang: voice.lang,
  isDefault: voice.default,
  isLocalService: voice.localService
});

export class BrowserSpeechService implements SpeechService {
  private synthesis: SpeechSynthesis | undefined =
    typeof window !== "undefined" ? window.speechSynthesis : undefined;

  private activeRepeatRemaining = 0;
  private activeOptions: SpeechSpeakOptions | undefined;

  isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  }

  getVoices() {
    if (!this.isSupported() || !this.synthesis) {
      return [];
    }

    return this.synthesis.getVoices().map(toVoiceOption);
  }

  subscribeVoicesChanged(callback: (voices: SpeechVoiceOption[]) => void) {
    if (!this.isSupported() || !this.synthesis) {
      callback([]);
      return () => undefined;
    }

    const emitVoices = () => {
      callback(this.getVoices());
    };

    emitVoices();
    this.synthesis.addEventListener("voiceschanged", emitVoices);

    return () => {
      this.synthesis?.removeEventListener("voiceschanged", emitVoices);
    };
  }

  speak(options: SpeechSpeakOptions) {
    if (!this.isSupported() || !this.synthesis) {
      options.onError?.("이 브라우저에서는 음성 재생을 지원하지 않습니다.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(options.text);
    const voices = this.synthesis.getVoices();
    const selectedVoice = voices.find((voice) => voice.voiceURI === options.voiceId);

    this.stop();
    this.activeOptions = options;
    this.activeRepeatRemaining = options.autoRepeat ? Math.max((options.repeatCount ?? 2) - 1, 0) : 0;

    utterance.lang = options.lang ?? selectedVoice?.lang ?? "vi-VN";
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onerror = () => {
      this.activeRepeatRemaining = 0;
      options.onError?.("음성 재생 중 문제가 발생했습니다.");
    };

    utterance.onend = () => {
      if (this.activeRepeatRemaining > 0 && this.activeOptions) {
        this.activeRepeatRemaining -= 1;
        this.speak({
          ...this.activeOptions,
          autoRepeat: false
        });
        return;
      }

      options.onEnd?.();
    };

    this.synthesis.speak(utterance);
  }

  stop() {
    this.activeRepeatRemaining = 0;
    this.activeOptions = undefined;
    this.synthesis?.cancel();
  }

  isSpeaking() {
    return Boolean(this.synthesis?.speaking);
  }
}

export class PremiumTTSService implements SpeechService {
  isSupported() {
    return false;
  }

  getVoices() {
    return [];
  }

  subscribeVoicesChanged(callback: (voices: SpeechVoiceOption[]) => void) {
    callback([]);
    return () => undefined;
  }

  speak(options: SpeechSpeakOptions) {
    options.onError?.("Premium TTS 서비스는 아직 연결되지 않았습니다.");
  }

  stop() {}

  isSpeaking() {
    return false;
  }
}
