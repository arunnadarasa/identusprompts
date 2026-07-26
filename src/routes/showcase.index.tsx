import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/showcase/")({
  head: () => ({
    meta: [
      { title: "Showcase — Sprites Creative reference build" },
      { name: "description", content: "Reference implementation of a Lovable + fly.io Sprites hackathon build — sprite-sandbox-fun on GitHub." },
      { property: "og:title", content: "Showcase — Sprites Creative reference build" },
      { property: "og:description", content: "The sprite-sandbox-fun repo shows the create → filesystem → service → warm-poll flow end-to-end." },
    ],
  }),
  component: ShowcaseIndex,
});

function ShowcaseIndex() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <span className="eyebrow">Showcase · Vol. 01</span>
      <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
        Reference <span className="italic text-primary">implementation</span>, in one prompt.
      </h1>
      <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed font-light">
        The Sprites archive ships with a working end-to-end example — a single Lovable build that
        spins up a public fly.io Sprite, drops an HTML asset in, boots a long-running service, and
        warm-polls the URL. Every mega-prompt in the index expands on this exact shape.
      </p>

      <a
        href="https://github.com/arunnadarasa/sprite-sandbox-fun"
        target="_blank"
        rel="noreferrer"
        className="mt-12 block p-6 sm:p-8 border border-primary/50 bg-card hover:bg-primary/5 transition-colors duration-300 group"
      >
        <span className="eyebrow text-primary">Vol. 01 · No. 01 · Live · GitHub</span>
        <h2 className="font-display text-2xl sm:text-3xl mt-3 italic group-hover:text-primary transition-colors">
          sprite-sandbox-fun — the working reference build.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl font-light">
          A TanStack Start app that calls <code>api.sprites.dev/v1</code> from a single{" "}
          <code>createServerFn</code>, creates a public Sprite, writes into <code>/root/www</code>,
          runs a python <code>http.server</code> service on port 8080, and warm-polls the URL before
          handing it back. All four primitives from the archive, wired end-to-end.
        </p>
        <span className="mt-5 inline-block text-[11px] tracking-[0.28em] uppercase font-semibold text-primary">
          Open the repo on GitHub ↗
        </span>
      </a>

      <div className="mt-8 grid sm:grid-cols-2 gap-px bg-border">
        <ShowcaseCard
          eyebrow="Primitive · Sprite Sandbox"
          title="Spin up a public micro-VM"
          body="POST /sprites with url_settings.auth: public. Idempotent create; 409 = already exists is fine. Public URL returns in the response body."
        />
        <ShowcaseCard
          eyebrow="Primitive · Filesystem Drop"
          title="Push assets into /root/www"
          body="PUT /sprites/{name}/fs/write?path=/root/www/index.html with an octet-stream body. Parents auto-created. Never target /home/sprite — the service will fail to start."
        />
        <ShowcaseCard
          eyebrow="Primitive · Long-running Service"
          title="Wake-on-request server"
          body="PUT /sprites/{name}/services/{svc} with http_port set, then POST /start. Warm-poll the public URL ~12× before returning so the first user never hits a cold-boot 502."
        />
        <ShowcaseCard
          eyebrow="Primitive · One-shot Exec"
          title="Run a shell command"
          body="POST /sprites/{name}/exec?cmd=bash&cmd=-lc&cmd=<script> with only Authorization set. Response stream ends with 0x03 + exit code. Do not add an Accept header — Sprites returns 406."
        />
      </div>

      <div className="mt-8 p-6 sm:p-8 border border-dashed border-border bg-card">
        <span className="eyebrow text-primary">Vol. 01 · in production</span>
        <h2 className="font-display text-2xl sm:text-3xl mt-3 italic">
          More showcases land here as builders ship them.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl font-light">
          Pick any entry from the <Link to="/themes" className="text-primary hover:underline">index</Link>,
          paste its mega-prompt into Lovable with your <code className="text-foreground">SPRITES_TOKEN</code> set,
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

function ShowcaseCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="p-6 bg-card">
      <span className="eyebrow text-primary">{eyebrow}</span>
      <h3 className="font-display text-xl mt-2 italic text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed font-light">{body}</p>
    </div>
  );
}
