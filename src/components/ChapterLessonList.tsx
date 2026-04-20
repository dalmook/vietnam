import type { ChapterListItem, LessonListItem } from "../types/course";
import { LessonListItemCard } from "./LessonListItemCard";

interface ChapterLessonListProps {
  chapters: ChapterListItem[];
  currentLessonId?: string;
  onOpenLesson: (lesson: LessonListItem) => void;
}

export function ChapterLessonList({
  chapters,
  currentLessonId,
  onOpenLesson
}: ChapterLessonListProps) {
  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <section key={chapter.id} className="overflow-hidden rounded-[30px] bg-white shadow-soft">
          <div className="border-b border-black/5 bg-[linear-gradient(180deg,_rgba(144,231,233,0.12),_rgba(255,255,255,0))] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">
                  Chapter {chapter.order}
                </p>
                <h3 className="display-font mt-1 text-2xl font-bold text-ink">{chapter.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{chapter.description}</p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  chapter.isUnlocked ? "bg-sand text-ink/75" : "bg-ink text-white"
                }`}
              >
                {chapter.isUnlocked ? `${chapter.completedLessons}/${chapter.totalLessons}` : "잠금"}
              </span>
            </div>

            <div className="mt-4 h-2 rounded-full bg-shell">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ocean via-mint to-coral transition-all"
                style={{ width: `${Math.round(chapter.completionRate * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 p-4">
            {chapter.lessons.map((lesson) => (
              <LessonListItemCard
                key={lesson.id}
                lesson={lesson}
                isCurrent={lesson.id === currentLessonId}
                onOpen={onOpenLesson}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
