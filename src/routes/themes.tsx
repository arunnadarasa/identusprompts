import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { THEMES, IDEAS_BY_THEME } from "@/data/ideas";

export const Route = createFileRoute("/themes")({
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
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-10">
        <span className="font-mono-q text-[11px] tracking-[0.2em] uppercase text-accent">// themes</span>
        <h1 className="font-display text-5xl font-bold mt-3">Ten disciplines, one quantum playground.</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Each theme has 100 ready-to-build ideas with a Lovable mega-prompt and a Guppy/Selene quantum kernel.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-5 pb-16 grid grid-cols-1 md:grid-cols-2 gap-4">
        {THEMES.map((t) => {
          const ideas = IDEAS_BY_THEME[t.slug];
          // Pick 3 ideas from different sub-disciplines and hooks for variety
          const sample = [ideas[0], ideas[37], ideas[74]].filter(Boolean);
          return (
            <Link
              key={t.slug}
              to="/themes/$theme"
              params={{ theme: t.slug }}
              className="group p-6 rounded-lg border border-border bg-card hover:border-accent/60 transition flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl">{t.emoji}</div>
                  <h2 className="font-display text-2xl font-semibold mt-3 group-hover:text-primary">{t.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1.5">{t.audience}</p>
                </div>
                <span className="font-mono-q text-[11px] text-muted-foreground">{ideas.length} ideas</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5 border-t border-border pt-4">
                {sample.map((i) => (
                  <li key={i.id} className="truncate">· {i.title}</li>
                ))}
              </ul>
            </Link>
          );
        })}
      </section>
    </SiteShell>
  );
}