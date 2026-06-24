import { Link } from "@tanstack/react-router";
import type { Idea } from "@/data/ideas";

export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link
      to="/ideas/$id"
      params={{ id: idea.id }}
      className="group relative flex flex-col gap-4 p-6 sm:p-7 bg-card border border-border hover:border-primary/60 transition-all duration-500"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow capitalize tracking-[0.28em] text-primary">
          {idea.subDiscipline}
        </span>
        <span className="font-display text-xs italic text-primary/60 shrink-0">№ {idea.id.slice(-3)}</span>
      </div>
      <h3 className="font-display text-2xl sm:text-[26px] leading-[1.1] text-foreground transition-colors duration-500">
        {idea.title}
      </h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 font-light">
        {idea.pitch}
      </p>
      <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-border/70">
        <span className="eyebrow text-muted-foreground group-hover:text-primary transition-colors duration-500">
          {idea.quantumHook}
        </span>
        <span className="w-7 h-7 rounded-full border border-primary/40 flex items-center justify-center text-primary text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">→</span>
      </div>
    </Link>
  );
}