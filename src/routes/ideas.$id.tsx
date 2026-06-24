import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CopyButton } from "@/components/copy-button";
import { QuantumChip } from "@/components/quantum-chip";
import { getIdea, getTheme, getHook, IDEAS_BY_THEME } from "@/data/ideas";
import { getPlainProposition } from "@/lib/plain-language";

export const Route = createFileRoute("/ideas/$id")({
  head: ({ params }) => {
    const idea = getIdea(params.id);
    const title = idea ? `${idea.title} · Creative Quantum idea` : "Idea · Creative Quantum";
    const desc = idea ? idea.pitch : "A hackathon idea.";
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
    const idea = getIdea(params.id);
    if (!idea) throw notFound();
    const theme = getTheme(idea.theme)!;
    const hook = getHook(idea.quantumHookId);
    return { idea, theme, hook };
  },
  notFoundComponent: IdeaNotFound,
  errorComponent: IdeaError,
  component: IdeaPage,
});

function IdeaPage() {
  const { idea, theme, hook } = Route.useLoaderData();
  const related = IDEAS_BY_THEME[theme.slug]
    .filter((i) => i.id !== idea.id && (i.subDiscipline === idea.subDiscipline || i.quantumHookId === idea.quantumHookId))
    .slice(0, 4);

  return (
    <SiteShell>
      <article className="max-w-4xl mx-auto px-5 pt-12 pb-16">
        <nav className="text-xs font-mono-q text-muted-foreground flex items-center gap-2">
          <Link to="/themes" className="hover:text-foreground">themes</Link>
          <span>/</span>
          <Link to="/themes/$theme" params={{ theme: theme.slug }} className="hover:text-foreground">{theme.slug}</Link>
          <span>/</span>
          <span className="text-foreground">{idea.id.slice(-3)}</span>
        </nav>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-mono-q text-muted-foreground uppercase tracking-wider">
              {theme.emoji} {theme.name} · {idea.subDiscipline}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[0.95] tracking-tight">{idea.title}</h1>
          <p className="mt-5 text-xl text-muted-foreground leading-relaxed">{idea.pitch}</p>
          <div className="mt-5">
            <QuantumChip hookId={idea.quantumHookId} label={idea.quantumHook} tag={idea.quantumTag} />
          </div>
        </header>

        <section className="mt-10 p-6 rounded-lg border border-accent/30 bg-accent/5">
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <h2 className="font-display text-xl font-semibold">Quantum hook</h2>
            <Link to="/quantum-primer" hash={idea.quantumHookId} className="text-xs font-mono-q text-accent hover:underline">
              full primer →
            </Link>
          </div>
          <p className="text-base text-foreground/90 leading-relaxed">
            {getPlainProposition(idea, theme)}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            <span className="font-mono-q text-[10px] uppercase tracking-wider text-accent mr-2">why this primitive</span>
            {idea.quantumRationale}
          </p>
          {hook && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-mono-q text-[10px] uppercase text-accent tracking-wider mb-1">kernel</div>
                <div className="text-foreground/90">{hook.kernel}</div>
              </div>
              <div>
                <div className="font-mono-q text-[10px] uppercase text-accent tracking-wider mb-1">drives the UI as</div>
                <div className="text-foreground/90">{hook.ui}</div>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <h2 className="font-display text-2xl font-semibold">Lovable mega-prompt</h2>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md border border-accent/40 bg-accent/5 font-mono-q text-[10px] uppercase tracking-wider text-accent">
                budget · 1 message · ~5 credits
              </span>
              <CopyButton text={idea.megaPrompt} label="Copy prompt" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            This prompt is engineered to ship in a single Lovable build. Real Quantinuum Guppy/Selene circuit
            runs in the Linux sandbox at build time and the results are baked in as JSON.{" "}
            <Link to="/strategy" className="text-accent underline decoration-accent/50 underline-offset-2 hover:decoration-accent">read the build strategy →</Link>
          </p>
          <pre className="whitespace-pre-wrap font-mono-q text-[13px] leading-relaxed p-6 rounded-lg border border-border bg-card text-foreground/90">
{idea.megaPrompt}
          </pre>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://lovable.dev/?prompt=${encodeURIComponent(idea.megaPrompt)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
            >
              Open in Lovable ↗
            </a>
            <a
              href="https://creativequantum.lovable.app/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm hover:bg-secondary/60"
            >
              Hackathon home ↗
            </a>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-4">Market sizing</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <MarketCard label="TAM" value={idea.tam} />
            <MarketCard label="SAM" value={idea.sam} />
            <MarketCard label="SOM" value={idea.som} />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground font-mono-q">
            Indicative figures for hackathon pitches — refine with your own research before raising.
          </p>
        </section>

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display text-2xl font-semibold mb-4">Adjacent ideas</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link key={r.id} to="/ideas/$id" params={{ id: r.id }} className="p-4 rounded-lg border border-border bg-card hover:border-accent/60 transition">
                  <div className="font-display text-lg font-semibold">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{r.pitch}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteShell>
  );
}

function MarketCard({ label, value }: { label: string; value: string }) {
  const [num, ...rest] = value.split(" — ");
  return (
    <div className="p-5 rounded-lg border border-border bg-card">
      <div className="font-mono-q text-[10px] uppercase tracking-wider text-accent">{label}</div>
      <div className="font-display text-3xl font-bold mt-2 text-primary">{num}</div>
      <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{rest.join(" — ")}</div>
    </div>
  );
}

function IdeaNotFound() {
  return (
    <SiteShell>
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Idea not found</h1>
        <Link to="/themes" className="inline-block mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          Browse themes
        </Link>
      </div>
    </SiteShell>
  );
}

function IdeaError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">This idea didn't load.</h1>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          Try again
        </button>
      </div>
    </SiteShell>
  );
}