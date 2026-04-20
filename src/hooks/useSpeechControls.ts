import { useEffect, useMemo } from "react";
import { createSpeechProvider } from "../services/speech";

export const useSpeechControls = () => {
  const provider = useMemo(() => createSpeechProvider(), []);

  useEffect(() => {
    return () => provider.stop();
  }, [provider]);

  return provider;
};
