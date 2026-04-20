import { useEffect, useState } from "react";
import { courseManifest } from "../data/courseManifest";
import { resolvePublicAssetPath } from "../lib/assets";

const FEATURE_LABELS = {
  pdf: "PDF",
  indexedDb: "IndexedDB",
  speech: "Speech API",
  manifest: "Manifest"
} as const;

type RuntimeFeatureKey = keyof typeof FEATURE_LABELS;

export function useRuntimeFeatureFlags() {
  const [unavailableFeatures, setUnavailableFeatures] = useState<RuntimeFeatureKey[]>([]);

  useEffect(() => {
    const checks: Promise<RuntimeFeatureKey | null>[] = [
      checkPdfMetadata(),
      checkIndexedDb(),
      checkSpeechApi(),
      checkManifest()
    ];

    Promise.all(checks)
      .then((result) => {
        setUnavailableFeatures(result.filter((feature): feature is RuntimeFeatureKey => feature !== null));
      })
      .catch(() => {
        setUnavailableFeatures(["manifest"]);
      });
  }, []);

  return {
    unavailableFeatures,
    hasWarning: unavailableFeatures.length > 0,
    message:
      unavailableFeatures.length > 0
        ? `일부 기능을 사용할 수 없습니다: ${unavailableFeatures.map((feature) => FEATURE_LABELS[feature]).join(", ")}`
        : undefined
  };
}

async function checkPdfMetadata(): Promise<RuntimeFeatureKey | null> {
  try {
    if (!courseManifest.length) {
      return "pdf";
    }

    const hasInvalidPath = courseManifest.some((course) => !course.pdfPath || !resolvePublicAssetPath(course.pdfPath));
    return hasInvalidPath ? "pdf" : null;
  } catch {
    return "pdf";
  }
}

async function checkIndexedDb(): Promise<RuntimeFeatureKey | null> {
  try {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return "indexedDb";
    }

    await new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open("vietnam-flow-health-check", 1);

      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("health");
      };
      request.onsuccess = () => {
        request.result.close();
        window.indexedDB.deleteDatabase("vietnam-flow-health-check");
        resolve();
      };
    });

    return null;
  } catch {
    return "indexedDb";
  }
}

async function checkSpeechApi(): Promise<RuntimeFeatureKey | null> {
  try {
    if (typeof window === "undefined") {
      return "speech";
    }

    const isSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    return isSupported ? null : "speech";
  } catch {
    return "speech";
  }
}

async function checkManifest(): Promise<RuntimeFeatureKey | null> {
  try {
    const response = await fetch(resolvePublicAssetPath("site.webmanifest"), { cache: "no-store" });
    if (!response.ok) {
      return "manifest";
    }

    const manifest = (await response.json()) as { name?: string };
    return manifest.name ? null : "manifest";
  } catch {
    return "manifest";
  }
}
