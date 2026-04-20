export function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`surface-card skeleton rounded-[28px] p-5 ${compact ? "min-h-[120px]" : "min-h-[220px]"}`} />
  );
}
