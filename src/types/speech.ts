export interface SpeechVoiceOption {
  id: string;
  name: string;
  lang: string;
  isDefault: boolean;
  isLocalService: boolean;
}

export interface SpeechSegment {
  id: string;
  label: string;
  text: string;
}

export interface SpeechSpeakOptions {
  text: string;
  lang?: string;
  voiceId?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  autoRepeat?: boolean;
  repeatCount?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errorMessage: string) => void;
}

export interface SpeechService {
  isSupported(): boolean;
  getVoices(): SpeechVoiceOption[];
  subscribeVoicesChanged(callback: (voices: SpeechVoiceOption[]) => void): () => void;
  speak(options: SpeechSpeakOptions): void;
  stop(): void;
  isSpeaking(): boolean;
}
