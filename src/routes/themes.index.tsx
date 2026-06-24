import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { THEMES, IDEAS_BY_THEME } from "@/data/ideas";

export const Route = createFileRoute("/themes/")({
  head: () => ({
    meta: [
      { title: "All themes · Creative Blockchain" },
      { name: "description", content: "10 creative disciplines, 100 onchain hackathon ideas each." },
      { property: "og:title", content: "All themes · Creative Blockchain" },
      { property: "og:description", content: "10 creative disciplines, 100 onchain hackathon ideas each." },
    ],
  }),
  component: ThemesIndex,
});

function ThemesIndex() {
  return (
    <SiteShell>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-12 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-border pb-8 gap-6">
          <div className="max-w-3xl">
            <span className="eyebrow block mb-4">Chapter I · The Index</span>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.95] text-foreground">
              Ten <span className="italic text-primary">disciplines</span>,
              <br />
              one onchain playground.
            </h1>
            <p className="mt-7 text-base sm:text-lg text-muted-foreground max-w-xl font-light leading-relaxed">
              Each house holds one hundred buildable entries — every entry paired with a Lovable mega-prompt and a verifiable Sepolia primitive.
            </p>
          </div>
          <div className="flex gap-10 font-display">
            <div>
              <div className="text-4xl italic text-primary leading-none">10</div>
              <div className="eyebrow text-muted-foreground mt-2">Houses</div>
            </div>
            <div>
              <div className="text-4xl italic text-primary leading-none">1k</div>
              <div className="eyebrow text-muted-foreground mt-2">Entries</div>
            </div>
          </div>
        </header>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20 grid grid-cols-1 md:grid-cols-4 auto-rows-[260px] gap-4 md:gap-5">
        {THEMES.map((t, idx) => {
          const ideas = IDEAS_BY_THEME[t.slug];
          const hookCount = new Set(ideas.map((i) => i.quantumHookId)).size;
          const isFeature = idx === 0;
          const isWide = idx === 5;
          const isGold = idx === 3;
          const span = isFeature
            ? "md:col-span-2 md:row-span-2"
            : isWide
              ? "md:col-span-2"
              : "";
          if (isGold) {
            return (
              <Link
                key={t.slug}
                to="/themes/$theme"
                params={{ theme: t.slug }}
                className="group bg-primary text-primary-foreground p-7 flex flex-col justify-between relative overflow-hidden hover:bg-foreground transition-colors duration-500"
              >
                <span className="text-4xl">{t.emoji}</span>
                <div>
                  <span className="text-[10px] tracking-[0.32em] uppercase font-semibold opacity-80">House {String(idx + 1).padStart(2, "0")} / 10</span>
                  <h2 className="font-display text-3xl mt-2 leading-tight">{t.name}</h2>
                  <div className="mt-4 flex items-center gap-3 text-[10px] tracking-[0.28em] uppercase font-semibold">
                    <span>{ideas.length} entries</span>
                    <span className="opacity-50">·</span>
                    <span>{hookCount} primitives</span>
                  </div>
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={t.slug}
              to="/themes/$theme"
              params={{ theme: t.slug }}
              className={`group relative overflow-hidden bg-card border border-border p-7 sm:p-8 flex flex-col justify-between hover:border-primary/60 transition-all duration-500 ${span}`}
            >
              {isFeature && (
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full gold-bloom blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              )}
              <div className="relative z-10 flex items-baseline justify-between">
                <span className="text-3xl">{t.emoji}</span>
                <span className="font-display italic text-primary/50 text-xs">House {String(idx + 1).padStart(2, "0")} / 10</span>
              </div>
              <div className="relative z-10">
                <span className="eyebrow">{ideas.length} entries · {hookCount} primitives</span>
                <h2 className={`font-display mt-2 leading-tight text-foreground ${isFeature ? "text-4xl sm:text-5xl italic" : "text-2xl"}`}>
                  {t.name}
                </h2>
                {isFeature && (
                  <p className="mt-4 text-sm text-muted-foreground max-w-md font-light leading-relaxed line-clamp-2">{t.audience}</p>
                )}
              </div>
              <div className="relative z-10 flex items-center gap-3 border-t border-border pt-4">
                <div className="w-8 h-px bg-primary" />
                <span className="eyebrow text-primary">Open the house</span>
              </div>
            </Link>
          );
        })}
      </section>
    </SiteShell>
  );
}
