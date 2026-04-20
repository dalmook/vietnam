import { useRef } from "react";
import { Link } from "react-router-dom";
import { CourseCard } from "../components/CourseCard";
import { useCourseLibrary } from "../hooks/useCourseLibrary";
import { useImportedCourses } from "../hooks/useImportedCourses";
import type { ImportedCourseViewModel } from "../types/importedCourse";

export function LibraryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isReady, courses, completedCount, totalCount } = useCourseLibrary();
  const {
    courses: importedCourses,
    isReady: isImportedReady,
    isUploading,
    error,
    uploadPdf,
    hideCourse,
    deleteCourse
  } = useImportedCourses();

  if (!isReady || !isImportedReady) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-ink">라이브러리를 불러오는 중입니다.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">Library</p>
            <h2 className="display-font mt-2 text-3xl font-bold text-ink">기본 내장 27개 코스</h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              메인 학습 흐름은 기본 코스가 중심입니다. 추후 업로드 PDF는 아래 보조 섹션에서 따로 관리됩니다.
            </p>
          </div>
          <div className="rounded-[22px] bg-shell px-4 py-3 text-center">
            <p className="text-xs font-medium text-ink/45">완료</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {completedCount}
              <span className="text-sm font-medium text-ink/45">/{totalCount}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {courses.map((course) => (
          <Link key={course.id} to={`/course/${course.id}`} className="block">
            <CourseCard course={course} actionLabel={course.isAvailable ? "상세 보기" : "잠금 코스"} />
          </Link>
        ))}
      </div>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Imported PDFs</p>
            <h3 className="display-font mt-2 text-2xl font-bold text-ink">보조 학습용 PDF 추가</h3>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              기본 코스를 해치지 않도록 라이브러리 하단에서만 관리합니다. 업로드한 PDF는 imported course로 분리됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-[22px] bg-shell px-4 py-3 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {isUploading ? "업로드 중..." : "PDF 업로드"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }
            void uploadPdf(file);
            event.currentTarget.value = "";
          }}
        />

        {error && <p className="mt-3 text-sm text-coral">{error}</p>}

        <div className="mt-5 space-y-4">
          {importedCourses.length > 0 ? (
            importedCourses.map((course) => (
              <ImportedCourseItem
                key={course.id}
                course={course}
                onHide={() => {
                  void hideCourse(course.id);
                }}
                onDelete={() => {
                  void deleteCourse(course.id);
                }}
              />
            ))
          ) : (
            <div className="rounded-[24px] bg-shell p-4">
              <p className="text-sm font-semibold text-ink">아직 추가한 PDF가 없습니다.</p>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                필요할 때만 PDF를 올려 imported course로 따로 관리할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ImportedCourseItem({
  course,
  onHide,
  onDelete
}: {
  course: ImportedCourseViewModel;
  onHide: () => void;
  onDelete: () => void;
}) {
  const isOpenable = course.importStatus === "ready";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">Imported</span>
          <span className="text-xs font-medium text-ink/55">{course.pdfName}</span>
        </div>
        <span className="rounded-full bg-shell px-3 py-1 text-xs font-semibold text-ink/60">
          {course.importStatus}
        </span>
      </div>

      {isOpenable ? (
        <Link to={`/course/${course.id}`} className="block">
          <CourseCard course={course} actionLabel="Imported 코스 열기" />
        </Link>
      ) : (
        <div className="rounded-[28px] border border-dashed border-coral/25 bg-white p-5 shadow-soft">
          <p className="text-lg font-bold text-ink">{course.title}</p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            {course.errorMessage ?? "추출 중이거나 카드 생성이 아직 끝나지 않았습니다."}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onHide}
          className="flex-1 rounded-2xl bg-shell px-4 py-3 text-sm font-semibold text-ink"
        >
          숨기기
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 rounded-2xl bg-coral/12 px-4 py-3 text-sm font-semibold text-coral"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
