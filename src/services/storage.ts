import { defaultShellState } from "../domain/progress";
import type { CourseData, ShellState } from "../domain/types";

const DB_NAME = "vietnam-flow-mobile";
const DB_VERSION = 1;
const SHELL_STORE = "shell";
const COURSE_STORE = "courses";
const SHELL_KEY = "shell-state";

let databasePromise: Promise<IDBDatabase> | undefined;

const getDatabase = () => {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(SHELL_STORE)) {
          db.createObjectStore(SHELL_STORE);
        }
        if (!db.objectStoreNames.contains(COURSE_STORE)) {
          db.createObjectStore(COURSE_STORE);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return databasePromise;
};

export const loadShellState = async () => {
  const db = await getDatabase();
  return new Promise<ShellState>((resolve, reject) => {
    const tx = db.transaction(SHELL_STORE, "readonly");
    const request = tx.objectStore(SHELL_STORE).get(SHELL_KEY);
    request.onsuccess = () => resolve(request.result ?? defaultShellState);
    request.onerror = () => reject(request.error);
  });
};

export const saveShellState = async (state: ShellState) => {
  const db = await getDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SHELL_STORE, "readwrite");
    tx.objectStore(SHELL_STORE).put(state, SHELL_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const loadCachedCourse = async (courseId: string) => {
  const db = await getDatabase();
  return new Promise<CourseData | undefined>((resolve, reject) => {
    const tx = db.transaction(COURSE_STORE, "readonly");
    const request = tx.objectStore(COURSE_STORE).get(courseId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveCachedCourse = async (course: CourseData) => {
  const db = await getDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(COURSE_STORE, "readwrite");
    tx.objectStore(COURSE_STORE).put(course, course.id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};
