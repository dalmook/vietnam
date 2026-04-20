import { chunkLinesIntoCards } from "../domain/chunking";
import type {
  ChapterUnit,
  CourseData,
  CourseManifest,
  LessonCard,
  LessonUnit
} from "../domain/types";
import { parsePdfSource } from "./pdfParser";

const LESSON_SIZE = 6;

export const loadCourseFromManifest = async (manifest: CourseManifest) => {
  if (!manifest.pdfPath) {
    throw new Error("이 코스에는 연결된 PDF가 없습니다.");
  }

  const sourceUrl = new URL(manifest.pdfPath, window.location.href).toString();
  const lines = await parsePdfSource(sourceUrl);
  return createCourseData(manifest, chunkLinesIntoCards(lines, manifest.id));
};

export const loadCourseFromFile = async (manifest: CourseManifest, file: File) => {
  const lines = await parsePdfSource(file);
  return createCourseData(manifest, chunkLinesIntoCards(lines, manifest.id));
};

const createCourseData = (manifest: CourseManifest, cards: LessonCard[]): CourseData => {
  if (cards.length === 0) {
    throw new Error(`${manifest.title}에서 학습 카드로 바꿀 문장을 찾지 못했습니다.`);
  }

  const lessons: LessonUnit[] = [];

  for (let index = 0; index < cards.length; index += LESSON_SIZE) {
    lessons.push({
      id: `${manifest.id}-lesson-${lessons.length + 1}`,
      order: lessons.length + 1,
      title: `Lesson ${lessons.length + 1}`,
      cards: cards.slice(index, index + LESSON_SIZE)
    });
  }

  const chapter: ChapterUnit = {
    id: `${manifest.id}-chapter-1`,
    order: 1,
    title: manifest.title,
    lessons
  };

  return {
    id: manifest.id,
    manifest,
    chapters: [chapter],
    totalCards: cards.length
  };
};
