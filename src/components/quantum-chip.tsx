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
      className={`inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent font-mono-q uppercase tracking-wider ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
      title={hookId}
    >
      <span className="size-1.5 rounded-full bg-accent" />
      {label}
      {tag && !compact && (
        <span className="text-muted-foreground normal-case tracking-normal">· {tag}</span>
      )}
    </span>
  );
}