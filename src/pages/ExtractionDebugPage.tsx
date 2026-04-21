import { useExtractionDebug } from "../hooks/useExtractionDebug";

export function ExtractionDebugPage() {
  const {
    isReady,
    entries,
    selectedCourseId,
    selectedDocument,
    setSelectedCourseId,
    runExtraction,
    runExtractAll
  } = useExtractionDebug();

  if (!isReady) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">추출 디버그 데이터를 준비하는 중...</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Debug Extract</p>
            <h2 className="display-font mt-2 text-3xl font-bold text-ink">베트남어 학습 콘텐츠 정제 파이프라인</h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">Raw → 분류 → 후보 → 번역 연결 → 노이즈 제거 → 최종 카드 과정을 확인합니다.</p>
          </div>
          <button type="button" onClick={() => void runExtractAll()} className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
            전체 추출
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-3">
          {entries.map(({ source, status, document }) => (
            <article
              key={source.courseId}
              className={`w-full rounded-[24px] p-4 text-left shadow-soft ${
                selectedCourseId === source.courseId ? "bg-ink text-white" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{source.title}</p>
                  <p className={`mt-1 text-xs ${selectedCourseId === source.courseId ? "text-white/70" : "text-ink/55"}`}>{source.courseId}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${selectedCourseId === source.courseId ? "bg-white/15 text-white" : "bg-sand text-ink"}`}>
                  {status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <MiniMetric label="페이지" value={`${document?.pageCount ?? 0}`} invert={selectedCourseId === source.courseId} />
                <MiniMetric label="카드" value={`${document?.cards.length ?? 0}`} invert={selectedCourseId === source.courseId} />
              </div>

              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setSelectedCourseId(source.courseId)} className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold ${selectedCourseId === source.courseId ? "bg-white text-ink" : "bg-sand text-ink"}`}>
                  상세 보기
                </button>
                <button type="button" onClick={() => void runExtraction(source.courseId)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${selectedCourseId === source.courseId ? "bg-white text-ink" : "bg-ink text-white"}`}>
                  추출
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-4">
          {selectedDocument ? (
            <>
              <DebugSection
                title="1. Raw extracted text"
                items={selectedDocument.pages.slice(0, 3).map((page) => ({
                  label: `p.${page.pageNumber}`,
                  reason: "raw",
                  value: page.rawText.slice(0, 220)
                }))}
              />

              <DebugSection
                title="2. Page type classification"
                items={selectedDocument.debug.pageTypeClassification.map((item) => ({
                  label: `p.${item.pageNumber}`,
                  reason: item.reason,
                  value: item.pageType ?? "unknown"
                }))}
              />

              <DebugSection
                title="3. Vietnamese candidate lines"
                items={selectedDocument.debug.vietnameseCandidateLines.map((item) => ({
                  label: `p.${item.pageNumber}`,
                  reason: item.reason,
                  value: item.line
                }))}
              />

              <DebugSection
                title="4. Attached Korean translation lines"
                items={selectedDocument.debug.attachedTranslationLines.map((item) => ({
                  label: `p.${item.pageNumber}`,
                  reason: item.reason,
                  value: item.line
                }))}
              />

              <DebugSection
                title="5. Excluded headings/noise"
                items={selectedDocument.debug.excludedNoiseLines.map((item) => ({
                  label: `p.${item.pageNumber}`,
                  reason: item.reason,
                  value: item.line
                }))}
              />

              <DebugSection
                title="6. Final learning cards"
                items={selectedDocument.debug.finalLearningCards.map((item) => ({
                  label: `p.${item.pageNumber}`,
                  reason: item.reason,
                  value: `${item.type} · ${selectedDocument.cards.find((card) => card.id === item.id)?.vietnamese ?? ""}`
                }))}
              />
            </>
          ) : (
            <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
              <p className="text-lg font-semibold text-ink">왼쪽에서 PDF를 선택해 주세요.</p>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

function DebugSection({
  title,
  items
}: {
  title: string;
  items: Array<{ label: string; reason: string; value: string }>;
}) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.slice(0, 24).map((item, index) => (
            <article key={`${item.label}-${index}`} className="rounded-xl bg-shell p-3">
              <p className="text-xs font-semibold text-ocean">{item.label}</p>
              <p className="mt-1 text-xs text-coral">reason: {item.reason}</p>
              <p className="mt-1 text-sm text-ink">{item.value}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-ink/55">데이터가 없습니다.</p>
        )}
      </div>
    </section>
  );
}

function MiniMetric({ label, value, invert }: { label: string; value: string; invert?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${invert ? "bg-white/10 text-white" : "bg-shell text-ink"}`}>
      <p className={`text-[11px] ${invert ? "text-white/65" : "text-ink/45"}`}>{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
