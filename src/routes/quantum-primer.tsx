import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { HOOKS, ALL_IDEAS } from "@/data/ideas";

export const Route = createFileRoute("/quantum-primer")({
  head: () => ({
    meta: [
      { title: "Voice primer · Creative AI" },
      { name: "description", content: "Four ElevenLabs primitives every idea in this repo leans on: streaming text-to-speech, conversational voice agents, realtime speech-to-text, and generative music & SFX." },
      { property: "og:title", content: "Voice primer · Creative AI" },
      { property: "og:description", content: "Four ElevenLabs primitives that drive UI features in a Lovable hackathon app." },
    ],
  }),
  component: Primer,
});

const SECRETS_BLURB = [
  { name: "ELEVENLABS_API_KEY", note: "Single API key that unlocks TTS, voice agents, scribe, music and SFX. Free tier covers a hackathon weekend.", href: "https://elevenlabs.io/app/settings/api-keys" },
];

function Primer() {
  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10">
        <span className="eyebrow">primer · voice</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 text-foreground">Four ElevenLabs primitives, demystified.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed font-light">
          Every idea in this repo leans on one of four ElevenLabs primitives. Each one runs against the
          public ElevenLabs API with a single key, so you ship a real voice demo with zero infra and
          nothing to host.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <div className="p-6 border border-primary/30 bg-card">
          <h2 className="font-display text-2xl text-foreground italic mb-4">The one-key protocol</h2>
          <p className="text-sm text-muted-foreground mb-4 font-light">
            Add this in your Lovable project (Settings → Secrets) before pasting any mega-prompt:
          </p>
          <ul className="space-y-3 text-sm">
            {SECRETS_BLURB.map((s) => (
              <li key={s.name} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <span className="font-mono text-[12px] text-primary shrink-0">{s.name}</span>
                <span className="text-foreground/80 font-light flex-1">{s.note}</span>
                <a href={s.href} target="_blank" rel="noreferrer" className="story-gold eyebrow text-primary shrink-0">open ↗</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20 space-y-4">
        {HOOKS.map((h) => {
          const count = ALL_IDEAS.filter((i) => i.quantumHookId === h.id).length;
          const sample = ALL_IDEAS.filter((i) => i.quantumHookId === h.id).slice(0, 3);
          return (
            <article key={h.id} id={h.id} className="p-6 border border-border bg-card scroll-mt-24">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <div className="eyebrow text-primary">{h.tag}</div>
                  <h2 className="font-display text-2xl mt-1 text-foreground">{h.name}</h2>
                </div>
                <span className="eyebrow text-muted-foreground">{count} ideas use this</span>
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="eyebrow mb-1">kernel</div>
                  <div className="text-foreground/90 font-light leading-relaxed">{h.kernel}</div>
                </div>
                <div>
                  <div className="eyebrow mb-1">how it drives the UI</div>
                  <div className="text-foreground/90 font-light leading-relaxed">{h.ui}</div>
                </div>
              </div>
              {sample.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="eyebrow text-muted-foreground mb-2">EXAMPLE IDEAS</div>
                  <ul className="space-y-1.5">
                    {sample.map((i) => (
                      <li key={i.id}>
                        <Link to="/ideas/$id" params={{ id: i.id }} className="text-sm hover:text-primary font-light">
                          → {i.title} <span className="text-muted-foreground">· {i.theme}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </SiteShell>
  );
}
