import { openDB } from "idb";
import type { ExtractedCourseDocument } from "../types/extraction";

const DB_NAME = "vietnam-course-library";
const STORE_NAME = "extractions";

const getDatabase = () =>
  openDB(DB_NAME, 2, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("progress")) {
        database.createObjectStore("progress");
      }
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    }
  });

export const loadExtractedDocument = async (courseId: string) => {
  const database = await getDatabase();
  return (await database.get(STORE_NAME, courseId)) as ExtractedCourseDocument | undefined;
};

export const saveExtractedDocument = async (document: ExtractedCourseDocument) => {
  const database = await getDatabase();
  await database.put(STORE_NAME, document, document.courseId);
};
