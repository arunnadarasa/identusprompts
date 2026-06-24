import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { HOOKS, ALL_IDEAS } from "@/data/ideas";

export const Route = createFileRoute("/quantum-primer")({
  head: () => ({
    meta: [
      { title: "Quantum primer · Creative Quantum" },
      { name: "description", content: "Ten Quantinuum Guppy/Selene primitives you can drop into a Lovable app — what they do and where to use them." },
      { property: "og:title", content: "Quantum primer · Creative Quantum" },
      { property: "og:description", content: "Ten Quantinuum primitives that drive UI features in a hackathon app." },
    ],
  }),
  component: Primer,
});

function Primer() {
  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10">
        <span className="font-mono-q text-[11px] tracking-[0.2em] uppercase text-accent">// primer</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Quantum hooks, demystified.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Each idea in the repo leans on one of ten quantum primitives. Build the kernel in Guppy, run it on Selene
          (Quantinuum's emulator), and drop the output into a Lovable UI. Keep it small — &lt;10 qubits, a few hundred shots.
        </p>
        <p className="mt-3 text-xs text-muted-foreground font-mono-q">
          Tip: <code className="text-accent">@guppy</code> functions must live in a real .py file on disk (Guppy reads source via inspect).
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20 space-y-4">
        {HOOKS.map((h) => {
          const count = ALL_IDEAS.filter((i) => i.quantumHookId === h.id).length;
          const sample = ALL_IDEAS.filter((i) => i.quantumHookId === h.id).slice(0, 3);
          return (
            <article key={h.id} id={h.id} className="p-6 rounded-lg border border-border bg-card scroll-mt-24">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-mono-q text-[10px] uppercase tracking-wider text-accent">{h.tag}</div>
                  <h2 className="font-display text-2xl font-semibold mt-1">{h.name}</h2>
                </div>
                <span className="font-mono-q text-xs text-muted-foreground">{count} ideas use this</span>
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-mono-q text-[10px] uppercase text-muted-foreground tracking-wider mb-1">kernel</div>
                  <div className="text-foreground/90">{h.kernel}</div>
                </div>
                <div>
                  <div className="font-mono-q text-[10px] uppercase text-muted-foreground tracking-wider mb-1">how it drives the UI</div>
                  <div className="text-foreground/90">{h.ui}</div>
                </div>
              </div>
              {sample.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="text-[11px] text-muted-foreground font-mono-q mb-2">EXAMPLE IDEAS</div>
                  <ul className="space-y-1.5">
                    {sample.map((i) => (
                      <li key={i.id}>
                        <Link to="/ideas/$id" params={{ id: i.id }} className="text-sm hover:text-primary">
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