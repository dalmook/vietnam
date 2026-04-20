import { openDB } from "idb";
import type { VietnamFlowDB } from "../types/persistence";

const DB_NAME = "vietnam-course-library";
const DB_VERSION = 3;

let databasePromise: ReturnType<typeof openDB<VietnamFlowDB>> | undefined;

export const getAppDatabase = () => {
  if (!databasePromise) {
    databasePromise = openDB<VietnamFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains("progress")) {
          database.createObjectStore("progress");
        }

        if (!database.objectStoreNames.contains("extractions")) {
          database.createObjectStore("extractions");
        }

        if (!database.objectStoreNames.contains("courseProgress")) {
          database.createObjectStore("courseProgress", { keyPath: "courseId" });
        }

        if (!database.objectStoreNames.contains("courseExtractions")) {
          database.createObjectStore("courseExtractions", { keyPath: "courseId" });
        }

        if (!database.objectStoreNames.contains("courseDocuments")) {
          database.createObjectStore("courseDocuments", { keyPath: "courseId" });
        }

        if (!database.objectStoreNames.contains("reviewQueue")) {
          const reviewStore = database.createObjectStore("reviewQueue", { keyPath: "id" });
          reviewStore.createIndex("by-courseId", "courseId");
          reviewStore.createIndex("by-createdAt", "createdAt");
        }

        if (!database.objectStoreNames.contains("userSettings")) {
          database.createObjectStore("userSettings", { keyPath: "id" });
        }

        if (!database.objectStoreNames.contains("appState")) {
          database.createObjectStore("appState", { keyPath: "id" });
        }

        if (!database.objectStoreNames.contains("importedCourses")) {
          database.createObjectStore("importedCourses", { keyPath: "courseId" });
        }
      }
    });
  }

  return databasePromise;
};

export const clearAppDatabase = async () => {
  const database = await getAppDatabase();
  const transaction = database.transaction(
    [
      "courseProgress",
      "courseExtractions",
      "courseDocuments",
      "reviewQueue",
      "userSettings",
      "appState",
      "importedCourses",
      "progress",
      "extractions"
    ],
    "readwrite"
  );

  await Promise.all([
    transaction.objectStore("courseProgress").clear(),
    transaction.objectStore("courseExtractions").clear(),
    transaction.objectStore("courseDocuments").clear(),
    transaction.objectStore("reviewQueue").clear(),
    transaction.objectStore("userSettings").clear(),
    transaction.objectStore("appState").clear(),
    transaction.objectStore("importedCourses").clear(),
    transaction.objectStore("progress").clear(),
    transaction.objectStore("extractions").clear()
  ]);

  await transaction.done;
};
