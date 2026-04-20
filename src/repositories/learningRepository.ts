import { getAppDatabase } from "../lib/appDb";
import type { LessonSessionResult, LessonRewardStats } from "../types/lessonPlayer";
import type { AppStateRecord, PersistedCourseProgress, ReviewQueueEntry } from "../types/persistence";
import type { CourseProgress } from "../types/course";
import type { LearningCard } from "../types/extraction";

const APP_STATE_KEY = "primary";
const LEGACY_PROGRESS_KEY = "course-progress";

const defaultRewards: LessonRewardStats = {
  totalXp: 0,
  streak: 0,
  completedCount: 0
};

const defaultAppState: AppStateRecord = {
  id: "primary",
  rewards: defaultRewards,
  updatedAt: new Date(0).toISOString()
};

export const buildDefaultCourseProgress = (courseId: string): PersistedCourseProgress => ({
  courseId,
  sourceKind: "default",
  completionRate: 0,
  completedLessons: 0,
  totalLessons: 0,
  completedLessonIds: [],
  completedCardIds: [],
  quizSubmissions: [],
  reviewQueue: [],
  weakCardIds: []
});

const createReviewQueue = (
  courseId: string,
  lessonId: string,
  cards: LearningCard[],
  result: LessonSessionResult
): ReviewQueueEntry[] =>
  result.submissions
    .filter((submission) => !submission.isCorrect)
    .map((submission) => {
      const card = cards.find((item) => item.id === submission.cardId);

      return {
        id: `${courseId}:${submission.cardId}:${submission.questionId}`,
        courseId,
        cardId: submission.cardId,
        front: card?.front ?? "",
        sourcePageNumber: card?.sourcePageNumber ?? 0,
        questionId: submission.questionId,
        quizType: submission.quizType,
        createdAt: new Date().toISOString(),
        wrongCount: 1,
        lessonId
      };
    });

export class LearningRepository {
  async loadAllCourseProgress() {
    const database = await getAppDatabase();
    const progressList = await database.getAll("courseProgress");

    if (progressList.length > 0) {
      return progressList;
    }

    const legacyMap = ((await database.get("progress", LEGACY_PROGRESS_KEY)) as Record<string, CourseProgress> | undefined) ?? {};
    const migrated: PersistedCourseProgress[] = Object.entries(legacyMap).map(([courseId, progress]) => ({
      ...buildDefaultCourseProgress(courseId),
      ...progress,
      completedLessonIds: progress.completedLessonIds ?? [],
      sourceKind: "default"
    }));

    if (migrated.length > 0) {
      await Promise.all(migrated.map((progress) => database.put("courseProgress", progress)));
    }

    return migrated;
  }

  async loadCourseProgressMap(): Promise<Record<string, PersistedCourseProgress>> {
    const all = await this.loadAllCourseProgress();
    return Object.fromEntries(all.map((progress) => [progress.courseId, progress]));
  }

  async getCourseProgress(courseId: string) {
    const database = await getAppDatabase();
    return (await database.get("courseProgress", courseId)) ?? buildDefaultCourseProgress(courseId);
  }

  async saveCourseProgress(progress: PersistedCourseProgress) {
    const database = await getAppDatabase();
    const all = await this.loadCourseProgressMap();
    const nextMap = {
      ...all,
      [progress.courseId]: progress
    };

    await Promise.all([
      database.put("courseProgress", progress),
      database.put("progress", nextMap, LEGACY_PROGRESS_KEY)
    ]);
  }

  async recordLessonEntry(input: {
    courseId: string;
    lessonId: string;
    totalLessons: number;
    sourceKind?: PersistedCourseProgress["sourceKind"];
  }) {
    const previous = await this.getCourseProgress(input.courseId);
    const next: PersistedCourseProgress = {
      ...previous,
      sourceKind: input.sourceKind ?? previous.sourceKind,
      totalLessons: input.totalLessons,
      currentLessonId: input.lessonId,
      lastStudiedAt: new Date().toISOString()
    };

    await this.saveCourseProgress(next);
  }

  async recordLessonCompletion(input: {
    courseId: string;
    lessonId: string;
    totalLessons: number;
    cards: LearningCard[];
    result: LessonSessionResult;
    sourceKind?: PersistedCourseProgress["sourceKind"];
  }) {
    const database = await getAppDatabase();
    const previous = await this.getCourseProgress(input.courseId);
    const completedLessonIds = Array.from(new Set([...previous.completedLessonIds, input.lessonId]));
    const completedCardIds = Array.from(new Set([...previous.completedCardIds, ...input.cards.map((card) => card.id)]));
    const reviewQueue = dedupeReviewQueue([
      ...previous.reviewQueue.filter((entry) => entry.cardId !== input.lessonId),
      ...createReviewQueue(input.courseId, input.lessonId, input.cards, input.result)
    ]);
    const weakCardIds = Array.from(new Set(reviewQueue.map((entry) => entry.cardId)));
    const nextProgress: PersistedCourseProgress = {
      ...previous,
      sourceKind: input.sourceKind ?? previous.sourceKind,
      totalLessons: input.totalLessons,
      completedLessons: completedLessonIds.length,
      completedLessonIds,
      completedCardIds,
      quizSubmissions: [...previous.quizSubmissions, ...input.result.submissions].slice(-300),
      reviewQueue,
      weakCardIds,
      completionRate: completedLessonIds.length / Math.max(input.totalLessons, 1),
      currentLessonId: input.lessonId,
      lastStudiedAt: new Date().toISOString(),
      lastSessionAt: new Date().toISOString(),
      lastSessionAccuracy: input.result.accuracy
    };

    const appState = await this.getAppState();
    const nextState: AppStateRecord = {
      id: APP_STATE_KEY,
      rewards: {
        totalXp: input.result.xpEarned + appState.rewards.totalXp,
        streak: input.result.streak,
        completedCount: input.result.completedCount,
        lastCompletedOn: new Date().toISOString().slice(0, 10),
        lastCompletedLessonId: input.lessonId
      },
      lastStudiedCourseId: input.courseId,
      lastStudiedLessonId: input.lessonId,
      updatedAt: new Date().toISOString()
    };

    await Promise.all([
      this.saveCourseProgress(nextProgress),
      database.put("appState", nextState),
      this.replaceReviewQueueEntries(input.courseId, reviewQueue)
    ]);
  }

  async getAppState() {
    const database = await getAppDatabase();
    return (await database.get("appState", APP_STATE_KEY)) ?? defaultAppState;
  }

  async getReviewEntries() {
    const database = await getAppDatabase();
    const entries = await database.getAll("reviewQueue");
    return entries.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async dismissReviewEntry(entryId: string) {
    const database = await getAppDatabase();
    await database.delete("reviewQueue", entryId);
  }

  private async replaceReviewQueueEntries(courseId: string, entries: ReviewQueueEntry[]) {
    const database = await getAppDatabase();
    const transaction = database.transaction(["reviewQueue"], "readwrite");
    const store = transaction.objectStore("reviewQueue");
    const currentIds = await store.index("by-courseId").getAllKeys(courseId);

    await Promise.all(currentIds.map((entryId) => store.delete(entryId as string)));
    await Promise.all(entries.map((entry) => store.put(entry)));
    await transaction.done;
  }
}

function dedupeReviewQueue(entries: ReviewQueueEntry[]) {
  const map = new Map<string, ReviewQueueEntry>();

  entries.forEach((entry) => {
    const previous = map.get(entry.cardId);
    if (!previous) {
      map.set(entry.cardId, entry);
      return;
    }

    map.set(entry.cardId, {
      ...entry,
      wrongCount: previous.wrongCount + entry.wrongCount
    });
  });

  return Array.from(map.values());
}

export const learningRepository = new LearningRepository();
