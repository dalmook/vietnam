interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean">Fallback</p>
      <h2 className="mt-2 text-xl font-bold text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink/70">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
