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
            <h2 className="display-font mt-2 text-3xl font-bold text-ink">내장 PDF 추출 파이프라인</h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              PDF 목록, 추출 상태, 페이지 수, 카드 수, 샘플 카드를 확인할 수 있는 개발용 화면입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void runExtractAll()}
            className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
          >
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
                  <p className={`mt-1 text-xs ${selectedCourseId === source.courseId ? "text-white/70" : "text-ink/55"}`}>
                    {source.courseId}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    selectedCourseId === source.courseId ? "bg-white/15 text-white" : "bg-sand text-ink"
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <MiniMetric label="페이지" value={`${document?.pageCount ?? 0}`} invert={selectedCourseId === source.courseId} />
                <MiniMetric label="카드" value={`${document?.cards.length ?? 0}`} invert={selectedCourseId === source.courseId} />
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourseId(source.courseId)}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold ${
                    selectedCourseId === source.courseId ? "bg-white text-ink" : "bg-sand text-ink"
                  }`}
                >
                  상세 보기
                </button>
                <button
                  type="button"
                  onClick={() => void runExtraction(source.courseId)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                    selectedCourseId === source.courseId ? "bg-white text-ink" : "bg-ink text-white"
                  }`}
                >
                  추출
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-4">
          {selectedDocument ? (
            <>
              <section className="rounded-[28px] bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Selected</p>
                    <h3 className="display-font mt-1 text-2xl font-bold text-ink">
                      {selectedDocument.source.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">
                    {selectedDocument.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PanelMetric label="페이지 수" value={`${selectedDocument.pageCount}`} />
                  <PanelMetric label="섹션 수" value={`${selectedDocument.sections.length}`} />
                  <PanelMetric label="레슨 수" value={`${selectedDocument.lessons.length}`} />
                  <PanelMetric label="카드 수" value={`${selectedDocument.cards.length}`} />
                </div>

                {selectedDocument.errorMessage && (
                  <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-ink">
                    {selectedDocument.errorMessage}
                  </p>
                )}

                {selectedDocument.warnings.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedDocument.warnings.map((warning) => (
                      <p key={warning} className="rounded-2xl bg-gold/20 px-4 py-3 text-sm text-ink">
                        {warning}
                      </p>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-[28px] bg-white p-5 shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Sample Cards</p>
                <div className="mt-4 grid gap-3">
                  {selectedDocument.cards.slice(0, 8).map((card) => (
                    <article key={card.id} className="rounded-2xl bg-shell p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-ocean">
                          {card.type}
                        </span>
                        <span className="text-xs font-medium text-ink/45">p.{card.sourcePageNumber}</span>
                      </div>
                      <p className="mt-3 text-base font-semibold leading-7 text-ink">{card.front}</p>
                      {card.hint && <p className="mt-2 text-sm text-ink/55">{card.hint}</p>}
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] bg-white p-5 shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Debug Info</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <PanelMetric label="제거된 라인" value={`${selectedDocument.debug.droppedLineCount}`} />
                  <PanelMetric label="Fallback" value={selectedDocument.debug.fallbackApplied ? "ON" : "OFF"} />
                  <PanelMetric label="저밀도 텍스트" value={selectedDocument.debug.lowTextDensity ? "YES" : "NO"} />
                  <PanelMetric label="반복 헤더 후보" value={`${selectedDocument.debug.repeatedLineCandidates.length}`} />
                </div>

                <div className="mt-4 rounded-2xl bg-shell p-4">
                  <p className="text-sm font-medium text-ink/55">반복 헤더/푸터 후보</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedDocument.debug.repeatedLineCandidates.slice(0, 12).map((line) => (
                      <span key={line} className="rounded-full bg-white px-3 py-1 text-xs text-ink/70">
                        {line}
                      </span>
                    ))}
                    {selectedDocument.debug.repeatedLineCandidates.length === 0 && (
                      <span className="text-sm text-ink/45">없음</span>
                    )}
                  </div>
                </div>
              </section>
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

function PanelMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-shell p-4">
      <p className="text-xs font-medium text-ink/45">{label}</p>
      <p className="mt-2 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  invert
}: {
  label: string;
  value: string;
  invert?: boolean;
}) {
  return (
    <div className={`rounded-xl px-3 py-2 ${invert ? "bg-white/10 text-white" : "bg-shell text-ink"}`}>
      <p className={`text-[11px] ${invert ? "text-white/65" : "text-ink/45"}`}>{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
