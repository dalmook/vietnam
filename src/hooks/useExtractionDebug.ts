import { useEffect, useMemo, useState } from "react";
import { embeddedPdfSources } from "../lib/embeddedSources";
import { loadExtractedDocument, saveExtractedDocument } from "../lib/extractionStorage";
import { extractEmbeddedPdf } from "../services/pdfExtraction";
import type { ExtractedCourseDocument, ExtractionStatus } from "../types/extraction";

type ExtractionMap = Record<string, ExtractedCourseDocument>;

const ensureDebugShape = (document: ExtractedCourseDocument): ExtractedCourseDocument => ({
  ...document,
  debug: {
    repeatedLineCandidates: document.debug?.repeatedLineCandidates ?? [],
    droppedLineCount: document.debug?.droppedLineCount ?? 0,
    sectionCount: document.debug?.sectionCount ?? 0,
    lessonCount: document.debug?.lessonCount ?? 0,
    lowTextDensity: document.debug?.lowTextDensity ?? true,
    fallbackApplied: document.debug?.fallbackApplied ?? false,
    pageTypeClassification: document.debug?.pageTypeClassification ?? [],
    vietnameseCandidateLines: document.debug?.vietnameseCandidateLines ?? [],
    attachedTranslationLines: document.debug?.attachedTranslationLines ?? [],
    excludedNoiseLines: document.debug?.excludedNoiseLines ?? [],
    finalLearningCards: document.debug?.finalLearningCards ?? []
  }
});

export function useExtractionDebug() {
  const [documents, setDocuments] = useState<ExtractionMap>({});
  const [statusMap, setStatusMap] = useState<Record<string, ExtractionStatus>>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string>(embeddedPdfSources[0]?.courseId ?? "");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const loadedEntries = await Promise.all(
        embeddedPdfSources.map(async (source) => [source.courseId, await loadExtractedDocument(source.courseId)] as const)
      );

      if (!mounted) {
        return;
      }

      const nextDocuments: ExtractionMap = {};
      const nextStatusMap: Record<string, ExtractionStatus> = {};

      loadedEntries.forEach(([courseId, document]) => {
        if (document) {
          nextDocuments[courseId] = ensureDebugShape(document);
          nextStatusMap[courseId] = document.status;
        } else {
          nextStatusMap[courseId] = "idle";
        }
      });

      setDocuments(nextDocuments);
      setStatusMap(nextStatusMap);
      setIsReady(true);
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedDocument = documents[selectedCourseId];

  const entries = useMemo(
    () =>
      embeddedPdfSources.map((source) => ({
        source,
        status: statusMap[source.courseId] ?? "idle",
        document: documents[source.courseId]
      })),
    [documents, statusMap]
  );

  const runExtraction = async (courseId: string) => {
    const source = embeddedPdfSources.find((item) => item.courseId === courseId);
    if (!source) {
      return;
    }

    setStatusMap((current) => ({ ...current, [courseId]: "loading" }));

    const document = ensureDebugShape(await extractEmbeddedPdf(source));
    await saveExtractedDocument(document);

    setDocuments((current) => ({
      ...current,
      [courseId]: document
    }));
    setStatusMap((current) => ({
      ...current,
      [courseId]: document.status
    }));
  };

  const runExtractAll = async () => {
    for (const source of embeddedPdfSources) {
      await runExtraction(source.courseId);
    }
  };

  return {
    isReady,
    entries,
    selectedCourseId,
    selectedDocument,
    setSelectedCourseId,
    runExtraction,
    runExtractAll
  };
}
