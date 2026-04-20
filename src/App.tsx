import { CourseCatalog } from "./components/CourseCatalog";
import { HomeScreen } from "./components/HomeScreen";
import { MoreScreen } from "./components/MoreScreen";
import { ReviewScreen } from "./components/ReviewScreen";
import { StudyScreen } from "./components/StudyScreen";
import { useStudyApp } from "./hooks/useStudyApp";

function App() {
  const {
    isReady,
    isBusy,
    error,
    catalog,
    courseCache,
    shellState,
    activeCourse,
    recommendedCourseId,
    getProgress,
    openCourse,
    closeCourse,
    setActiveTab,
    reviewCard,
    importFiles,
    updateSettings
  } = useStudyApp();

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-shell px-4">
        <div className="rounded-[30px] bg-white px-6 py-8 text-center shadow-soft">
          <p className="display-font text-2xl font-bold text-ink">코스 데이터를 준비하는 중...</p>
        </div>
      </main>
    );
  }

  if (activeCourse) {
    return (
      <StudyScreen
        course={activeCourse}
        progress={getProgress(activeCourse.id)}
        slowMode={shellState.settings.slowMode}
        onBack={closeCourse}
        onReviewCard={reviewCard}
      />
    );
  }

  return (
    <main className="safe-pb min-h-screen bg-shell px-4 pb-24 pt-4">
      <header className="rounded-[32px] bg-ink px-5 py-6 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-mint">Vietnam Flow</p>
        <h1 className="display-font mt-2 text-4xl font-bold leading-tight">
          27개 기본 PDF로 배우는 모바일 베트남어 코스
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/72">
          홈에서 바로 이어하고, 추천 코스를 열고, 복습까지 이어지는 순서형 학습 앱입니다.
        </p>
      </header>

      {error && (
        <section className="mt-4 rounded-[26px] border border-coral/20 bg-coral/10 px-4 py-4 text-sm text-ink">
          {error}
        </section>
      )}

      {isBusy && (
        <section className="mt-4 rounded-[26px] bg-white/90 px-4 py-4 text-sm font-medium text-ink shadow-soft">
          PDF를 학습 코스로 변환하는 중입니다...
        </section>
      )}

      <section className="mt-4">
        {shellState.activeTab === "home" && (
          <HomeScreen
            catalog={catalog}
            progressByCourse={shellState.progressByCourse}
            activeCourseId={shellState.activeCourseId}
            recommendedCourseId={recommendedCourseId}
            courseCache={courseCache}
            onOpenCourse={openCourse}
          />
        )}

        {shellState.activeTab === "courses" && (
          <CourseCatalog
            catalog={catalog}
            progressByCourse={shellState.progressByCourse}
            courseCache={courseCache}
            onOpenCourse={openCourse}
          />
        )}

        {shellState.activeTab === "review" && (
          <ReviewScreen
            catalog={catalog}
            progressByCourse={shellState.progressByCourse}
            courseCache={courseCache}
            onOpenCourse={openCourse}
          />
        )}

        {shellState.activeTab === "more" && (
          <MoreScreen
            settings={shellState.settings}
            isBusy={isBusy}
            onImport={importFiles}
            onUpdateSettings={updateSettings}
          />
        )}
      </section>

      <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full bg-white/95 px-3 py-3 shadow-soft backdrop-blur">
        <TabButton active={shellState.activeTab === "home"} label="홈" onClick={() => setActiveTab("home")} />
        <TabButton active={shellState.activeTab === "courses"} label="코스" onClick={() => setActiveTab("courses")} />
        <TabButton active={shellState.activeTab === "review"} label="복습" onClick={() => setActiveTab("review")} />
        <TabButton active={shellState.activeTab === "more"} label="더보기" onClick={() => setActiveTab("more")} />
      </nav>
    </main>
  );
}

function TabButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active ? "bg-ink text-white" : "text-ink/55"
      }`}
    >
      {label}
    </button>
  );
}

export default App;
