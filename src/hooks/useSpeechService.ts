import { useEffect, useMemo, useState } from "react";
import { BrowserSpeechService } from "../services/speechService";
import type { SpeechService, SpeechVoiceOption } from "../types/speech";

export const pickPreferredVoice = (voices: SpeechVoiceOption[], selectedVoiceId?: string) => {
  if (selectedVoiceId) {
    const selected = voices.find((voice) => voice.id === selectedVoiceId);
    if (selected) {
      return selected.id;
    }
  }

  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith("vi-vn"))?.id ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("vi"))?.id ??
    voices[0]?.id
  );
};

export function useSpeechService(service?: SpeechService) {
  const speechService = useMemo(() => service ?? new BrowserSpeechService(), [service]);
  const [voices, setVoices] = useState<SpeechVoiceOption[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);

  useEffect(() => {
    const resolveVoices = (nextVoices: SpeechVoiceOption[]) => {
      setVoices(nextVoices);
      setIsLoadingVoices(false);
    };

    const initialVoices = speechService.getVoices();
    if (initialVoices.length > 0) {
      resolveVoices(initialVoices);
    }

    const unsubscribe = speechService.subscribeVoicesChanged((nextVoices) => {
      resolveVoices(nextVoices);
    });

    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, [speechService]);

  return {
    speechService,
    voices,
    isLoadingVoices,
    isSupported: speechService.isSupported()
  };
}
