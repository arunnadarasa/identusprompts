import { createFileRoute } from "@tanstack/react-router";
import hooks from "@/data/ideas/hooks.json";

export const Route = createFileRoute("/quantum-primer")({
  head: () => ({
    meta: [
      { title: "Sprites primer · Sprites Creative" },
      {
        name: "description",
        content:
          "Four fly.io Sprites primitives every idea in this repo leans on: create a public micro-VM, drop files into its filesystem, run a long-running service, and exec shell commands.",
      },
      { property: "og:title", content: "Sprites primer · Sprites Creative" },
      {
        property: "og:description",
        content: "Four Sprites primitives that power every Lovable hackathon entry in this archive.",
      },
    ],
  }),
  component: Primer,
});

const SECRETS = [
  {
    name: "SPRITES_TOKEN",
    note: "The 4-part token (org-slug/org-id/token-id/token-value) from sprites.dev/account. One token unlocks create, filesystem writes, long-running services, and exec across every Sprite you spin up. A raw Fly.io org token returns 401 — always use the 4-part sprites.dev token.",
    href: "https://sprites.dev/account",
  },
];

const GOTCHAS = [
  {
    title: "Serve from /root/www",
    body: "Set `dir: \"/root/www\"` on every service. `/home/sprite` may not exist and the service fails to start with `cd: No such file or directory`.",
  },
  {
    title: "http_port is required",
    body: "Sprites wake on the first request only when a service declares `http_port`. Omit it and the sprite reports \"Running\" but every request 502s.",
  },
  {
    title: "Create is POST-only",
    body: "`POST /sprites` creates. `PUT /sprites/{name}` returns 404 — create-via-PUT is not supported. Match on `409` for idempotent re-runs.",
  },
  {
    title: "/exec takes no Accept header",
    body: "`POST /sprites/{name}/exec?cmd=...` needs only an `Authorization` header. Adding `Accept: application/octet-stream` returns 406 Not Acceptable.",
  },
  {
    title: "Warm the URL",
    body: "After start, poll the public URL up to ~12× at 1s with a 4s fetch timeout so the first user hits a warm sprite, not a cold-boot 502.",
  },
];

function Primer() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <header className="mb-12">
        <span className="eyebrow">primer · sprites</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 text-foreground">
          Four Sprites primitives, demystified.
        </h1>
        <p className="text-muted-foreground mt-4 text-base sm:text-lg font-light leading-relaxed max-w-3xl">
          Every idea in this repo leans on one of four fly.io Sprites primitives. Each one runs
          against <code>api.sprites.dev/v1</code> with a single token, so you ship a real public
          micro-VM demo with zero infra and no provider-shopping.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {hooks.map((h) => (
          <article key={h.id} id={h.id} className="border border-border bg-card p-6 sm:p-7 scroll-mt-24">
            <div className="eyebrow text-primary">{h.tag}</div>
            <h2 className="font-display text-xl sm:text-2xl text-foreground mt-2 italic">{h.name}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mt-3 font-light">
              <span className="text-foreground">Primitive:</span> {h.kernel}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2 font-light">
              <span className="text-foreground">UI:</span> {h.ui}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mb-4">One token. That's it.</h2>
        <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-2xl mb-6">
          Add this to your Lovable project (Project Settings → Secrets). It stays on the server,
          read by your TanStack server function via <code>process.env.SPRITES_TOKEN</code>.
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
                Get token ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mb-4">Gotchas worth memorising.</h2>
        <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-2xl mb-6">
          The Sprites docs leave a few edges ambiguous. These five bite hardest in a one-shot Lovable build.
        </p>
        <ul className="grid gap-px bg-border sm:grid-cols-2">
          {GOTCHAS.map((g) => (
            <li key={g.title} className="p-6 bg-card">
              <div className="eyebrow text-primary">{g.title}</div>
              <p className="text-sm text-foreground/85 font-light leading-relaxed mt-2">{g.body}</p>
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
        <a
          href="https://github.com/arunnadarasa/sprite-sandbox-fun"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 border border-primary/40 text-foreground text-[10px] tracking-[0.32em] uppercase font-semibold hover:border-primary"
        >
          Reference repo ↗
        </a>
      </section>
    </div>
  );
}
