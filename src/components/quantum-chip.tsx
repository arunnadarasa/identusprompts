export function QuantumChip({
  hookId,
  label,
  tag,
  compact = false,
}: {
  hookId: string;
  label: string;
  tag?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 border border-primary/40 bg-transparent text-primary font-medium uppercase tracking-[0.28em] ${
        compact ? "px-2.5 py-1 text-[9px]" : "px-3.5 py-1.5 text-[10px]"
      }`}
      title={hookId}
    >
      <span className="size-1 rounded-full bg-primary" />
      {label}
      {tag && !compact && (
        <span className="text-muted-foreground normal-case tracking-normal">· {tag}</span>
      )}
    </span>
  );
}