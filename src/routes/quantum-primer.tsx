import { createFileRoute } from "@tanstack/react-router";
import hooks from "@/data/ideas/hooks.json";

export const Route = createFileRoute("/quantum-primer")({
  head: () => ({
    meta: [
      { title: "AIsa primer · AIsa Creative" },
      {
        name: "description",
        content:
          "Four AIsa kernels every idea in this repo leans on: chat completions (LLM router), image generation, video generation, and live skills / web search.",
      },
      { property: "og:title", content: "AIsa primer · AIsa Creative" },
      {
        property: "og:description",
        content: "Four AIsa primitives that power every Lovable hackathon entry in this archive.",
      },
    ],
  }),
  component: Primer,
});

const SECRETS = [
  {
    name: "AISA_API_KEY",
    note: "Single API key that unlocks chat (every frontier LLM), image (Seedream + GPT image), video (Wan + Seed) and Skills (Tavily search, YouTube, scholar, markets). Free tier covers a hackathon weekend.",
    href: "https://console.aisa.one",
  },
];

function Primer() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <header className="mb-12">
        <span className="eyebrow">primer · aisa</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 text-foreground">
          Four AIsa kernels, demystified.
        </h1>
        <p className="text-muted-foreground mt-4 text-base sm:text-lg font-light leading-relaxed max-w-3xl">
          Every idea in this repo leans on one of four AIsa kernels. Each one runs against the
          public AIsa API with a single key, so you ship a real demo with zero infra and no
          provider-shopping.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {hooks.map((h) => (
          <article key={h.id} className="border border-border bg-card p-6 sm:p-7">
            <div className="eyebrow text-primary">{h.tag}</div>
            <h2 className="font-display text-xl sm:text-2xl text-foreground mt-2 italic">{h.name}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mt-3 font-light">
              <span className="text-foreground">Kernel:</span> {h.kernel}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2 font-light">
              <span className="text-foreground">UI:</span> {h.ui}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mb-4">One secret. That's it.</h2>
        <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-2xl mb-6">
          Add this to your Lovable project (Project Settings → Secrets). It stays on the server,
          read by your TanStack server function via <code>process.env.AISA_API_KEY</code>.
        </p>
        <ul className="space-y-3">
          {SECRETS.map((s) => (
            <li key={s.name} className="border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <code className="text-foreground text-sm">{s.name}</code>
                <p className="text-xs text-muted-foreground font-light mt-1 max-w-2xl">{s.note}</p>
              </div>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] tracking-[0.28em] uppercase text-primary hover:text-foreground"
              >
                Get key ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 border-t border-border pt-10 flex flex-wrap gap-3">
        <a href="/strategy" className="px-5 py-2.5 bg-primary text-primary-foreground text-[10px] tracking-[0.32em] uppercase font-semibold">
          Build strategy
        </a>
        <a href="/themes" className="px-5 py-2.5 border border-border text-foreground text-[10px] tracking-[0.32em] uppercase font-semibold hover:border-primary/60">
          Browse 1,000 ideas
        </a>
      </section>
    </div>
  );
}
