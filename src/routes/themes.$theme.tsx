import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { IdeaCard } from "@/components/idea-card";
import { getTheme, IDEAS_BY_THEME, HOOKS } from "@/data/ideas";

export const Route = createFileRoute("/themes/$theme")({
  head: ({ params }) => {
    const theme = getTheme(params.theme);
    const title = theme ? `${theme.name} · 100 quantum hackathon ideas` : "Theme · Creative Quantum";
    const desc = theme
      ? `100 buildable hackathon ideas for ${theme.audience} using Lovable + Quantinuum Guppy/Selene.`
      : "Browse ideas by discipline.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const theme = getTheme(params.theme);
    if (!theme) throw notFound();
    return { theme };
  },
  notFoundComponent: ThemeNotFound,
  errorComponent: ThemeError,
  component: ThemePage,
});

function ThemePage() {
  const { theme } = Route.useLoaderData();
  const ideas = IDEAS_BY_THEME[theme.slug];
  const [q, setQ] = useState("");
  const [hookFilter, setHookFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ideas.filter((i) => {
      if (hookFilter && i.quantumHookId !== hookFilter) return false;
      if (!needle) return true;
      return (
        i.title.toLowerCase().includes(needle) ||
        i.pitch.toLowerCase().includes(needle) ||
        i.subDiscipline.toLowerCase().includes(needle)
      );
    });
  }, [ideas, q, hookFilter]);

  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-5 pt-6 sm:pt-12 pb-3 sm:pb-6">
        <div className="flex items-center gap-2 font-mono-q text-[11px] uppercase tracking-wider">
          <Link to="/themes" className="text-muted-foreground hover:text-foreground">Themes</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-accent">{theme.slug}</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-3xl sm:text-4xl shrink-0">{theme.emoji}</span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold min-w-0">{theme.name}</h1>
        </div>
        <p className="font-mono-q text-[11px] text-muted-foreground mt-2">
          {ideas.length} ideas · {new Set(ideas.map((i) => i.quantumHookId)).size} quantum hooks · for {theme.audience}
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-5 sticky top-[68px] z-30 bg-background/85 backdrop-blur-md py-2.5 sm:py-4 border-y border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 md:gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ideas in this theme…"
            className="flex-1 px-4 py-2 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-accent"
          />
          <div className="flex md:flex-wrap gap-1.5 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 md:overflow-visible">
            <FilterChip active={hookFilter === null} onClick={() => setHookFilter(null)}>
              All hooks
            </FilterChip>
            {HOOKS.map((h) => (
              <FilterChip key={h.id} active={hookFilter === h.id} onClick={() => setHookFilter(h.id)}>
                {h.name}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-8">
        <p className="text-xs text-muted-foreground font-mono-q mb-4">
          {filtered.length} / {ideas.length} ideas shown
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((i) => (
            <IdeaCard key={i.id} idea={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No ideas match. Clear filters?</div>
        )}
      </section>
    </SiteShell>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-mono-q uppercase tracking-wider border transition ${
        active
          ? "bg-accent text-accent-foreground border-accent"
          : "border-border text-muted-foreground hover:text-foreground hover:border-accent/50"
      }`}
    >
      {children}
    </button>
  );
}

function ThemeNotFound() {
  const params = Route.useParams();
  return (
    <SiteShell>
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Theme not found</h1>
        <p className="mt-3 text-muted-foreground">"{params.theme}" isn't one of our 10 disciplines.</p>
        <Link to="/themes" className="inline-block mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          Browse all themes
        </Link>
      </div>
    </SiteShell>
  );
}

function ThemeError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">This theme didn't load.</h1>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    </SiteShell>
  );
}