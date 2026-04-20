import { useEffect, useState } from "react";
import { learningRepository } from "../repositories/learningRepository";
import type { ReviewQueueEntry } from "../types/persistence";

interface ReviewCenterState {
  reviewEntries: ReviewQueueEntry[];
  weakCards: ReviewQueueEntry[];
  recentStudy: ReviewQueueEntry[];
}

export function useReviewCenter() {
  const [state, setState] = useState<ReviewCenterState>({
    reviewEntries: [],
    weakCards: [],
    recentStudy: []
  });
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string>();

  const refresh = async () => {
    try {
      const reviewEntries = await learningRepository.getReviewEntries();
      const weakCards = [...reviewEntries].sort((left, right) => right.wrongCount - left.wrongCount).slice(0, 6);
      const recentStudy = [...reviewEntries].slice(0, 6);

      setState({
        reviewEntries,
        weakCards,
        recentStudy
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "복습 데이터를 복구하지 못했습니다.");
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const dismissReviewEntry = async (entryId: string) => {
    await learningRepository.dismissReviewEntry(entryId);
    await refresh();
  };

  return {
    ...state,
    isReady,
    error,
    refresh,
    dismissReviewEntry
  };
}
