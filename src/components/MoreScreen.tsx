import { useRef } from "react";
import type { SettingsState } from "../domain/types";

interface MoreScreenProps {
  settings: SettingsState;
  isBusy: boolean;
  onImport: (files: FileList | File[]) => Promise<void>;
  onUpdateSettings: (settings: SettingsState) => void;
}

export function MoreScreen({
  settings,
  isBusy,
  onImport,
  onUpdateSettings
}: MoreScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-white/92 p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">More</p>
        <h2 className="display-font mt-2 text-3xl font-bold text-ink">설정과 추가 자료</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          핵심은 내장 27개 코스이지만, 필요할 때 개인 PDF도 보조 코스로 추가할 수 있습니다.
        </p>
      </section>

      <section className="rounded-[28px] bg-white/90 p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">Speech</p>
            <h3 className="mt-2 text-xl font-bold text-ink">느리게 듣기 기본값</h3>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              베트남어 성조와 철자 확인이 중요하므로 기본 재생 속도를 천천히 둘 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...settings, slowMode: !settings.slowMode })}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              settings.slowMode ? "bg-ocean text-white" : "bg-sand text-ink"
            }`}
          >
            {settings.slowMode ? "ON" : "OFF"}
          </button>
        </div>
      </section>

      <section className="rounded-[28px] bg-white/90 p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">Extra PDF</p>
        <h3 className="mt-2 text-xl font-bold text-ink">추가 PDF 업로드</h3>
        <p className="mt-2 text-sm leading-6 text-ink/68">
          보조 기능입니다. 업로드한 PDF도 같은 카드형 코스로 변환해 코스 목록 하단에 추가합니다.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          className="mt-4 w-full rounded-2xl bg-ink px-4 py-4 text-base font-semibold text-white disabled:opacity-50"
        >
          {isBusy ? "PDF 처리 중..." : "개인 PDF 추가하기"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) {
              void onImport(event.target.files);
            }
            event.target.value = "";
          }}
        />
      </section>
    </div>
  );
}
