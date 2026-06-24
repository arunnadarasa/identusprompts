import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Creative Quantum" },
      { name: "description", content: "About the Creative Quantum hackathon idea repo." },
      { property: "og:title", content: "About · Creative Quantum" },
      { property: "og:description", content: "Why this repo exists and how to use it at the hackathon." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <article className="max-w-2xl mx-auto px-5 pt-16 pb-20 prose prose-invert">
        <span className="font-mono-q text-[11px] tracking-[0.2em] uppercase text-accent">// about</span>
        <h1 className="font-display text-5xl font-bold mt-3 mb-6">A starter pack for the Creative Quantum hackathon.</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Hackathons live or die on the first hour. This repo gives Creative Quantum participants a 1,000-idea
          launchpad so you skip the blank page and start shipping.
        </p>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3">What's inside</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>· <strong className="text-foreground">10 creative disciplines</strong> — dance, music, visual art, video, photo, writing, film/animation, games, theater, fashion.</li>
          <li>· <strong className="text-foreground">100 ideas per discipline</strong> — each combining a sub-discipline with a quantum hook.</li>
          <li>· <strong className="text-foreground">A Lovable mega-prompt</strong> per idea — paste, build, ship.</li>
          <li>· <strong className="text-foreground">A Quantinuum quantum hook</strong> — the actual kernel you'd write in Guppy + run on Selene.</li>
          <li>· <strong className="text-foreground">TAM / SAM / SOM</strong> — indicative market sizing for your pitch slide.</li>
        </ul>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3">How to use it</h2>
        <ol className="space-y-2 text-muted-foreground list-decimal pl-5">
          <li>Pick a discipline that matches your team's strengths.</li>
          <li>Skim the 100 ideas; click into 2–3 that grab you.</li>
          <li>Copy the mega-prompt into Lovable, open a new project.</li>
          <li>The prompt instructs Lovable to <code>pip install guppylang selene-sim</code> in the Linux sandbox, run a real Selene kernel at build time, and bake the output in as JSON.</li>
          <li>Polish the demo, prep your TAM/SAM/SOM slide, present.</li>
        </ol>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3">Built for 5 credits</h2>
        <p className="text-muted-foreground">
          Free-plan Lovable accounts get ~5 build credits. Every mega-prompt here is engineered to
          ship a real-quantum demo in a single build message — no runtime Python, no backend, no
          auth, no scope creep.{" "}
          <Link to="/strategy" className="text-foreground underline decoration-accent">Read the build strategy →</Link>
        </p>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3">Credits</h2>
        <p className="text-muted-foreground">
          Built for the{" "}
          <a href="https://creativequantum.lovable.app/" target="_blank" rel="noreferrer" className="text-foreground underline decoration-accent">
            Creative Quantum hackathon
          </a>
          . Powered by <a href="https://lovable.dev" target="_blank" rel="noreferrer" className="text-foreground underline decoration-accent">Lovable</a> and{" "}
          <a href="https://www.quantinuum.com" target="_blank" rel="noreferrer" className="text-foreground underline decoration-accent">Quantinuum</a> (Guppy + Selene).
        </p>
      </article>
    </SiteShell>
  );
}