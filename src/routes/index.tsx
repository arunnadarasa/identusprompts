import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { THEMES, ALL_IDEAS, HOOKS } from "@/data/ideas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creative Quantum — 1,000 hackathon ideas for Lovable + Quantinuum" },
      { name: "description", content: "A browseable repo of 1,000 mega-prompts, quantum hooks, and TAM/SAM/SOM for the Creative Quantum hackathon. Built for dancers, musicians, artists, filmmakers and more." },
      { property: "og:title", content: "Creative Quantum — 1,000 hackathon ideas" },
      { property: "og:description", content: "Mega-prompts + quantum hooks across 10 creative disciplines, ready to paste into Lovable." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono-q text-[11px] tracking-[0.2em] uppercase text-accent">
            //  creative-quantum / hackathon-kit
          </span>
        </div>
        <h1 className="font-display text-6xl md:text-7xl font-bold tracking-tight leading-[0.95] max-w-4xl">
          1,000 ideas where <span className="text-primary">creativity</span> meets a
          <span className="text-accent"> quantum kernel</span>.
        </h1>
        <p className="mt-7 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          A copy-and-paste repo for the{" "}
          <a href="https://creativequantum.lovable.app/" target="_blank" rel="noreferrer" className="text-foreground underline decoration-accent/60 underline-offset-4 hover:decoration-accent">
            Creative Quantum hackathon
          </a>
          . Every idea includes a Lovable mega-prompt, a Quantinuum Guppy/Selene hook, and TAM/SAM/SOM —
          so you can pick one in five minutes and start building.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/themes" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
            Browse 10 themes →
          </Link>
          <Link to="/strategy" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-accent/60 text-accent hover:bg-accent/10 transition">
            Build strategy (5-credit pattern) →
          </Link>
        </div>
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
          <Stat n="1,000" label="ideas" />
          <Stat n="10" label="disciplines" />
          <Stat n="10" label="quantum hooks" />
          <Stat n="1" label="build message" />
        </div>
        <p className="mt-6 text-xs text-muted-foreground font-mono-q max-w-2xl">
          Designed to ship on Lovable's free tier — every mega-prompt runs real Quantinuum Selene/Guppy
          circuits in the Linux sandbox at build time, then ships a static frontend.{" "}
          <Link to="/strategy" className="text-accent underline decoration-accent/50 underline-offset-2 hover:decoration-accent">read the strategy →</Link>
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12 border-t border-border">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-display text-3xl font-semibold">Pick your discipline</h2>
          <Link to="/themes" className="text-sm text-muted-foreground hover:text-foreground">See all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {THEMES.map((t) => (
            <Link
              key={t.slug}
              to="/themes/$theme"
              params={{ theme: t.slug }}
              className="group p-4 rounded-lg border border-border bg-card hover:border-accent/60 transition"
            >
              <div className="text-2xl mb-2">{t.emoji}</div>
              <div className="font-display text-base font-semibold leading-tight group-hover:text-primary">{t.name}</div>
              <div className="mt-2 text-[11px] text-muted-foreground font-mono-q">100 ideas</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12 border-t border-border">
        <h2 className="font-display text-3xl font-semibold mb-7">The quantum hooks you can lean on</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HOOKS.map((h) => (
            <Link key={h.id} to="/quantum-primer" hash={h.id} className="p-4 rounded-lg border border-border bg-card hover:border-accent/60 transition">
              <div className="font-mono-q text-[10px] uppercase tracking-wider text-accent">{h.tag}</div>
              <div className="font-display text-lg font-semibold mt-1">{h.name}</div>
              <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{h.kernel}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-12 border-t border-border">
        <h2 className="font-display text-3xl font-semibold mb-3">How to use this repo</h2>
        <p className="text-muted-foreground max-w-2xl">Three steps, ten minutes to a buildable hackathon project.</p>
        <ol className="mt-7 grid md:grid-cols-3 gap-4">
          <Step n={1} title="Pick a discipline" body="Browse the 10 themes and skim 100 ideas in each." />
          <Step n={2} title="Open an idea" body="Read the pitch, the quantum hook, and the TAM/SAM/SOM." />
          <Step n={3} title="Copy the mega-prompt" body="Paste it into Lovable. Wire in the Guppy kernel. Ship." />
        </ol>
        <p className="mt-8 text-xs text-muted-foreground font-mono-q">
          {ALL_IDEAS.length} ideas indexed · all static · zero backend
        </p>
      </section>
    </SiteShell>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl font-bold text-primary">{n}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="p-5 rounded-lg border border-border bg-card">
      <div className="font-mono-q text-xs text-accent">step {String(n).padStart(2, "0")}</div>
      <div className="font-display text-xl font-semibold mt-2">{title}</div>
      <div className="text-sm text-muted-foreground mt-2">{body}</div>
    </li>
  );
}
