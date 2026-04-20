import { getAppDatabase } from "../lib/appDb";
import type { UserSettings } from "../types/persistence";

const SETTINGS_KEY = "primary";

export const defaultUserSettings: UserSettings = {
  id: "primary",
  speechRate: 0.86,
  showTranslation: true,
  autoRepeat: true,
  preferSlowListening: true,
  learnerMode: "beginner",
  updatedAt: new Date(0).toISOString()
};

export class SettingsRepository {
  async getSettings() {
    const database = await getAppDatabase();
    return (await database.get("userSettings", SETTINGS_KEY)) ?? defaultUserSettings;
  }

  async saveSettings(partial: Partial<UserSettings>) {
    const database = await this.getDatabase();
    const previous = await this.getSettings();
    const nextSettings: UserSettings = {
      ...previous,
      ...partial,
      id: SETTINGS_KEY,
      updatedAt: new Date().toISOString()
    };

    await database.put("userSettings", nextSettings);
    return nextSettings;
  }

  private async getDatabase() {
    return getAppDatabase();
  }
}

export const settingsRepository = new SettingsRepository();
