import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CopyButton } from "@/components/copy-button";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Build strategy — real quantum on 5 free credits" },
      { name: "description", content: "How to ship a real Quantinuum Guppy/Selene demo on Lovable's free plan: run the kernel in the Linux sandbox at build time, precompute results, ship a static frontend." },
      { property: "og:title", content: "Real quantum on 5 free credits" },
      { property: "og:description", content: "Build-time quantum pattern for Lovable + Quantinuum Selene/Guppy hackathon entries." },
    ],
  }),
  component: StrategyPage,
});

const KERNEL_SNIPPET = `# quantum/kernel.py — a real .py file on disk (Guppy reads source via inspect)
from guppylang import guppy
from guppylang.std.builtins import result
from guppylang.std.quantum import qubit, h, cx, measure, discard

@guppy
def swap_test() -> None:
    a = qubit()
    b = qubit()
    anc = qubit()
    h(anc)
    # ... prepare |a>, |b> however your problem encodes them ...
    cx(anc, a)
    cx(anc, b)
    h(anc)
    result("anc", measure(anc))
    discard(a); discard(b)
`;

const DRIVER_SNIPPET = `# quantum/run.py — runs once at build time, writes real Selene output as JSON
import json, pathlib
from selene_sim import build, Quest
from kernel import swap_test

OUT = pathlib.Path("src/data/quantum-results.json")
OUT.parent.mkdir(parents=True, exist_ok=True)

runner = build(swap_test)

records = []
for i in range(10):           # candidate axis
    for j in range(10):       # reference axis
        # bind your problem inputs here (state prep, parameters, etc.)
        shots = list(runner.run_shots(Quest(), n_shots=256))
        ones = sum(1 for s in shots if s.get_results().get("anc", [0])[0] == 1)
        fidelity = max(0.0, 1.0 - 2.0 * ones / 256)
        records.append({"input": {"i": i, "j": j}, "output": {"fidelity": fidelity}})

OUT.write_text(json.dumps(records, indent=2))
print(f"wrote {len(records)} records to {OUT}")
`;

const READER_SNIPPET = `// src/routes/index.tsx — frontend just reads the JSON, no runtime Python
import results from "@/data/quantum-results.json";

// every number on screen traces back to a real Selene shot
const top = [...results].sort((a, b) => b.output.fidelity - a.output.fidelity)[0];
`;

const FULL_RECIPE = `# 1. In the Lovable Linux sandbox during the build:
pip install guppylang selene-sim

# 2. Author the kernel as a REAL .py file:
#    quantum/kernel.py  (see snippet)

# 3. Author a driver that runs the kernel over a small grid and writes JSON:
#    quantum/run.py  (see snippet)

# 4. Execute the driver ONCE during the build:
python quantum/run.py

# 5. The React app statically imports src/data/quantum-results.json.
#    No Python runs at runtime. No backend. No Cloud. No auth.
`;

function StrategyPage() {
  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-5 pt-14 pb-20">
        <div className="font-mono-q text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
          // build-strategy / free-tier
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold leading-[0.95] tracking-tight">
          Real quantum, <span className="text-accent">5 credits</span>, one build message.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Every mega-prompt in this repo uses the same pattern, because it's the
          only pattern that lets a free-tier Lovable account ship a real
          Quantinuum demo in one shot.
        </p>

        <section className="mt-10 p-6 rounded-lg border border-accent/30 bg-accent/5">
          <h2 className="font-display text-xl font-semibold">Why not run Guppy at runtime?</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Lovable apps deploy to Cloudflare Workers (edge JavaScript). Workers
            cannot run Python — so calling Selene from a server function at
            runtime will fail. Don't burn credits trying. Instead, run the
            quantum circuit <em>at build time</em> in the Lovable Linux sandbox,
            commit the real output as JSON, and let the frontend read it.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3">The 5-step pattern</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono-q text-[10px] uppercase text-accent tracking-wider">recipe</span>
            <CopyButton text={FULL_RECIPE} label="Copy recipe" />
          </div>
          <pre className="whitespace-pre-wrap font-mono-q text-[13px] leading-relaxed p-5 rounded-lg border border-border bg-card text-foreground/90">{FULL_RECIPE}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3">1. The kernel — a real .py file</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Guppy reads source via <code className="font-mono-q text-accent">inspect.getsource</code>,
            so it must be on disk. REPL strings, exec(), and Jupyter cells all fail.
          </p>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono-q text-[10px] uppercase text-accent tracking-wider">quantum/kernel.py</span>
            <CopyButton text={KERNEL_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap font-mono-q text-[12px] leading-relaxed p-5 rounded-lg border border-border bg-card text-foreground/90">{KERNEL_SNIPPET}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3">2. The driver — runs once at build time</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Keep the grid small (5–20 inputs, ≤8 qubits, ~256 shots). The
            driver writes one JSON file the frontend reads.
          </p>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono-q text-[10px] uppercase text-accent tracking-wider">quantum/run.py</span>
            <CopyButton text={DRIVER_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap font-mono-q text-[12px] leading-relaxed p-5 rounded-lg border border-border bg-card text-foreground/90">{DRIVER_SNIPPET}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3">3. The frontend — pure static read</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono-q text-[10px] uppercase text-accent tracking-wider">src/routes/index.tsx</span>
            <CopyButton text={READER_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap font-mono-q text-[12px] leading-relaxed p-5 rounded-lg border border-border bg-card text-foreground/90">{READER_SNIPPET}</pre>
        </section>

        <section className="mt-10 p-6 rounded-lg border border-border bg-card">
          <h2 className="font-display text-xl font-semibold">Credit budget rules</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· One mega-prompt = one build message. No iterative refinement loop.</li>
            <li>· Hard scope cap: 1 page (the workspace) + an "About the quantum" strip.</li>
            <li>· No accounts. No Lovable Cloud. No database. No auth.</li>
            <li>· Add a "Quantum trace" disclosure that prints kernel.py inline so judges see it's real.</li>
            <li>· Keep ~1 credit in reserve for a single fix-it pass after the first build.</li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/themes" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
            Pick an idea →
          </Link>
          <Link to="/quantum-primer" className="px-5 py-2.5 rounded-md border border-border hover:bg-secondary/60 transition">
            Quantum primer
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}