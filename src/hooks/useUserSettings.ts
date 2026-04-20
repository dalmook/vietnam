import { useEffect, useState } from "react";
import { settingsRepository, defaultUserSettings } from "../repositories/settingsRepository";
import type { UserSettings } from "../types/persistence";

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultUserSettings);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    settingsRepository
      .getSettings()
      .then((stored) => setSettings(stored))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "설정을 불러오지 못했습니다."))
      .finally(() => setIsReady(true));
  }, []);

  const updateSettings = async (partial: Partial<UserSettings>) => {
    const nextSettings = await settingsRepository.saveSettings(partial);
    setSettings(nextSettings);
    return nextSettings;
  };

  return {
    settings,
    isReady,
    error,
    updateSettings
  };
}
