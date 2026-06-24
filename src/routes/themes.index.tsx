import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { THEMES, IDEAS_BY_THEME } from "@/data/ideas";

export const Route = createFileRoute("/themes/")({
  head: () => ({
    meta: [
      { title: "All themes · Creative Quantum" },
      { name: "description", content: "10 creative disciplines, 100 hackathon ideas each." },
      { property: "og:title", content: "All themes · Creative Quantum" },
      { property: "og:description", content: "10 creative disciplines, 100 hackathon ideas each." },
    ],
  }),
  component: ThemesIndex,
});

function ThemesIndex() {
  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-5 pt-8 sm:pt-14 pb-6 sm:pb-10">
        <span className="font-mono-q text-[11px] tracking-[0.2em] uppercase text-accent">// themes</span>
        <h1 className="font-display text-[32px] leading-[1.05] sm:text-5xl font-bold mt-2 sm:mt-3">Ten disciplines, one quantum playground.</h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl">
          Each theme has 100 ready-to-build ideas with a Lovable mega-prompt and a Guppy/Selene quantum kernel. Tap a discipline to open its dedicated page.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-5 pb-12 sm:pb-16 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {THEMES.map((t) => {
          const ideas = IDEAS_BY_THEME[t.slug];
          const sample = [ideas[0], ideas[37], ideas[74]].filter(Boolean);
          return (
            <Link
              key={t.slug}
              to="/themes/$theme"
              params={{ theme: t.slug }}
              className="group p-4 sm:p-6 rounded-lg border border-border bg-card hover:border-accent/60 transition flex flex-col gap-3 sm:gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl">{t.emoji}</div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold mt-2 sm:mt-3 group-hover:text-primary">{t.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{t.audience}</p>
                </div>
                <span className="font-mono-q text-[11px] text-muted-foreground">{ideas.length} ideas</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5 border-t border-border pt-3 sm:pt-4">
                {sample.map((i, idx) => (
                  <li key={i.id} className={`truncate ${idx === 2 ? "hidden sm:block" : ""}`}>· {i.title}</li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3 mt-auto">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold group-hover:bg-accent/15 group-hover:border-accent/50 group-hover:text-accent transition">
                  Open {t.name} page <span aria-hidden>→</span>
                </span>
                <span className="font-mono-q text-[10px] text-muted-foreground shrink-0">
                  {new Set(ideas.map((i) => i.quantumHookId)).size} hooks
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </SiteShell>
  );
}