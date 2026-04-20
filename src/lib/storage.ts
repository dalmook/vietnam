import { openDB } from "idb";
import type { CourseProgress } from "../types/course";

const DB_NAME = "vietnam-course-library";
const STORE_NAME = "progress";
const KEY = "course-progress";

const getDatabase = () =>
  openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    }
  });

export const loadProgressMap = async () => {
  const database = await getDatabase();
  return ((await database.get(STORE_NAME, KEY)) as Record<string, CourseProgress> | undefined) ?? {};
};

export const saveProgressMap = async (value: Record<string, CourseProgress>) => {
  const database = await getDatabase();
  await database.put(STORE_NAME, value, KEY);
};
