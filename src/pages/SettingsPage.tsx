import { useState } from "react";
import type { ReactNode } from "react";
import { clearAppDatabase } from "../lib/appDb";
import { useUserSettings } from "../hooks/useUserSettings";

export function SettingsPage() {
  const { settings, isReady, error, updateSettings } = useUserSettings();
  const [resetMessage, setResetMessage] = useState<string>();

  if (!isReady) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">설정을 불러오는 중입니다.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Settings</p>
        <h2 className="display-font mt-2 text-3xl font-bold text-ink">베트남어 학습 환경</h2>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          한국인 학습자가 보기 편하도록 듣기 기본값, 번역 보기, 정보 밀도를 조절할 수 있습니다.
        </p>
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        {resetMessage && <p className="mt-3 text-sm text-ocean">{resetMessage}</p>}
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <SettingRow
          label="학습 모드"
          description="입문자는 친절한 안내와 시각 강조를 더 많이, 중급자는 더 간결한 화면으로 봅니다."
          control={
            <select
              value={settings.learnerMode}
              onChange={(event) => {
                void updateSettings({ learnerMode: event.target.value as "beginner" | "intermediate" });
              }}
              className="rounded-full bg-shell px-4 py-2 text-sm font-semibold text-ink outline-none"
            >
              <option value="beginner">입문자</option>
              <option value="intermediate">중급자</option>
            </select>
          }
        />

        <SettingRow
          label="번역 보기"
          description="뜻 확인 단계에서 번역을 바로 볼지 결정합니다."
          control={
            <button
              type="button"
              onClick={() => {
                void updateSettings({ showTranslation: !settings.showTranslation });
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                settings.showTranslation ? "bg-mint text-ink" : "bg-shell text-ink/60"
              }`}
            >
              {settings.showTranslation ? "ON" : "OFF"}
            </button>
          }
        />

        <SettingRow
          label="반복 듣기 루프"
          description="듣기 재생 시 문장을 자동으로 한 번 더 반복합니다."
          control={
            <button
              type="button"
              onClick={() => {
                void updateSettings({ autoRepeat: !settings.autoRepeat });
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                settings.autoRepeat ? "bg-mint text-ink" : "bg-shell text-ink/60"
              }`}
            >
              {settings.autoRepeat ? "ON" : "OFF"}
            </button>
          }
        />

        <SettingRow
          label="느린 듣기 기본값"
          description="기본 재생 버튼도 느린 듣기 톤으로 시작하게 할지 설정합니다."
          control={
            <button
              type="button"
              onClick={() => {
                void updateSettings({ preferSlowListening: !settings.preferSlowListening });
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                settings.preferSlowListening ? "bg-mint text-ink" : "bg-shell text-ink/60"
              }`}
            >
              {settings.preferSlowListening ? "ON" : "OFF"}
            </button>
          }
        />

        <SettingRow
          label="기본 속도"
          description="느린 듣기와 일반 듣기 모두의 기준이 되는 기본 속도입니다."
          control={
            <select
              value={settings.speechRate}
              onChange={(event) => {
                void updateSettings({ speechRate: Number(event.target.value) });
              }}
              className="rounded-full bg-shell px-4 py-2 text-sm font-semibold text-ink outline-none"
            >
              <option value={0.72}>느리게</option>
              <option value={0.86}>보통보다 느리게</option>
              <option value={0.92}>기본</option>
              <option value={1}>빠르게</option>
            </select>
          }
        />
      </section>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <h3 className="text-lg font-bold text-ink">데이터 관리</h3>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          추출 결과, 진도, 퀴즈 기록, 복습 큐, XP, streak, 사용자 설정까지 모두 초기화합니다.
        </p>
        <button
          type="button"
          onClick={() => {
            void clearAppDatabase().then(() => {
              setResetMessage("저장된 데이터를 초기화했습니다. 앱을 새로고침하면 기본 상태로 돌아갑니다.");
            });
          }}
          className="mt-4 w-full rounded-[24px] bg-coral px-4 py-4 text-base font-semibold text-white"
        >
          저장 데이터 초기화
        </button>
      </section>
    </div>
  );
}

function SettingRow({
  label,
  description,
  control
}: {
  label: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/5 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-1 text-sm leading-6 text-ink/60">{description}</p>
      </div>
      {control}
    </div>
  );
}
