import { Link } from "@tanstack/react-router";
import type { Idea } from "@/data/ideas";
import { QuantumChip } from "./quantum-chip";

export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link
      to="/ideas/$id"
      params={{ id: idea.id }}
      className="group relative flex flex-col gap-3 p-5 rounded-lg border border-border bg-card hover:border-accent/60 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {idea.title}
        </h3>
        <span className="font-mono-q text-[10px] text-muted-foreground shrink-0 pt-1.5">
          #{idea.id.slice(-3)}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{idea.pitch}</p>
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <QuantumChip hookId={idea.quantumHookId} label={idea.quantumHook} tag={idea.quantumTag} compact />
        <span className="text-[11px] text-muted-foreground capitalize">{idea.subDiscipline}</span>
      </div>
    </Link>
  );
}