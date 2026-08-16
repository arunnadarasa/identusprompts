import { MODES, type AgentMode } from "@/data/modes";

export function ModeSelector({
  value,
  onChange,
}: {
  value: AgentMode["id"];
  onChange: (id: AgentMode["id"]) => void;
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-px bg-border">
      {MODES.map((m) => {
        const active = m.id === value;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            aria-pressed={active}
            className={`text-left p-5 transition-colors duration-300 ${
              active ? "bg-primary text-primary-foreground" : "bg-card hover:bg-background text-foreground"
            }`}
          >
            <span
              className={`block text-[10px] tracking-[0.28em] uppercase font-semibold ${
                active ? "opacity-80" : "text-primary"
              }`}
            >
              {m.tag}
            </span>
            <span className="font-display text-xl italic mt-2 block">{m.name}</span>
            <span
              className={`block text-xs mt-2 font-light leading-relaxed ${
                active ? "opacity-85" : "text-muted-foreground"
              }`}
            >
              {m.blurb}
            </span>
          </button>
        );
      })}
    </div>
  );
}
