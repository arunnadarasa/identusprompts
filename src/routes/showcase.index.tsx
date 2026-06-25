import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/showcase/")({
  component: ShowcaseIndex,
});

function ShowcaseIndex() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <span className="eyebrow">Showcase · Vol. 01</span>
      <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
        Working <span className="italic text-primary">demos</span>, built in one prompt.
      </h1>
      <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
        Reference builds from the prompt library. Each demo calls real AIsa
        from one Lovable build — single API key, no infra, no setup.
      </p>

      <Link
        to="/showcase/pitch-critic"
        className="mt-12 block p-6 sm:p-8 border border-primary/50 bg-card hover:bg-primary/5 transition-colors duration-300 group"
      >
        <span className="eyebrow text-primary">Vol. 01 · No. 01 · Live</span>
        <h2 className="font-display text-2xl sm:text-3xl mt-3 italic group-hover:text-primary transition-colors">
          Pitch Critic — critique any pitch live.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Six curated pitches, one AIsa button each. Built in a single Lovable
          prompt to prove the 5-credit budget is real.
        </p>
        <span className="mt-5 inline-block text-[11px] tracking-[0.28em] uppercase font-semibold text-primary">
          Open the demo →
        </span>
      </Link>

      <div className="mt-8 p-6 sm:p-8 border border-dashed border-border bg-card">
        <span className="eyebrow text-primary">Vol. 01 · in production</span>
        <h2 className="font-display text-2xl sm:text-3xl mt-3 italic">
          More showcases land here as builders ship them.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Pick any entry from the <Link to="/themes" className="text-primary hover:underline">index</Link>,
          paste its mega-prompt into Lovable with your <code className="text-foreground">AISA_API_KEY</code> set,
          and your build will join the showcase.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/themes" className="px-5 py-2.5 bg-primary text-primary-foreground text-[11px] tracking-[0.28em] uppercase font-semibold hover:bg-foreground transition-colors duration-500">
            Browse the index →
          </Link>
          <Link to="/strategy" className="px-5 py-2.5 border border-primary/40 text-[11px] tracking-[0.28em] uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-500">
            Read the strategy
          </Link>
        </div>
      </div>
    </div>
  );
}
