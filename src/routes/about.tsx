import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Hyperledger Identus Catalyst" },
      { name: "description", content: "About the Hyperledger Identus Catalyst — a 1,000-idea launchpad pairing self-sovereign identity with ten creative disciplines, built for Lovable." },
      { property: "og:title", content: "About · Hyperledger Identus Catalyst" },
      { property: "og:description", content: "Why this catalog exists and how to use it at the hackathon." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <article className="max-w-2xl mx-auto px-5 pt-16 pb-20 prose prose-invert">
        <span className="eyebrow">about</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 mb-6 text-foreground">A starter pack for the Hyperledger Identus Catalyst.</h1>
        <p className="text-lg text-muted-foreground leading-relaxed font-light">
          Hackathons live or die on the first hour. This catalog gives participants a 1,000-idea
          launchpad so you skip the blank page and start shipping real self-sovereign identity
          demos in one Lovable build.
        </p>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">What's inside</h2>
        <ul className="space-y-2 text-muted-foreground font-light">
          <li>· <strong className="text-foreground">10 creative disciplines</strong> — dance, music, visual art, video, photo, writing, film/animation, games, theater, fashion.</li>
          <li>· <strong className="text-foreground">100 ideas per discipline</strong> — each pairing a real identity problem with one of four Identus primitives, 25 per primitive.</li>
          <li>· <strong className="text-foreground">A Lovable mega-prompt</strong> per idea — paste, build, ship.</li>
          <li>· <strong className="text-foreground">Three agent modes</strong> — simulated, local Docker, or a hosted Fly.io deployment. The prompt rewrites itself for the mode you pick.</li>
          <li>· <strong className="text-foreground">TAM / SAM / SOM</strong> — indicative market sizing for your pitch slide.</li>
        </ul>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">How to use it</h2>
        <ol className="space-y-2 text-muted-foreground list-decimal pl-5 font-light">
          <li>Pick a discipline that matches your team's strengths.</li>
          <li>Skim the 100 ideas; click into 2–3 that grab you.</li>
          <li>Choose an agent mode. Start simulated — it needs no secrets and always fits a one-shot build.</li>
          <li>For Docker or Fly.io, add two secrets in Lovable: <code>AGENT_BASE_URL</code> and <code>AGENT_API_KEY</code>.</li>
          <li>Copy the mega-prompt into Lovable. It wires a TanStack server function to the Identus Cloud Agent plus a matching client surface for the chosen primitive.</li>
          <li>Polish the demo, prep your TAM/SAM/SOM slide, present.</li>
        </ol>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">Reference implementation</h2>
        <p className="text-muted-foreground font-light">
          The end-to-end reference console lives at{" "}
          <a href="https://identus.lovable.app/" target="_blank" rel="noreferrer" className="text-foreground underline decoration-primary">
            identus.lovable.app
          </a>{" "}
          (source:{" "}
          <a href="https://github.com/arunnadarasa/identus" target="_blank" rel="noreferrer" className="text-foreground underline decoration-primary">
            github.com/arunnadarasa/identus
          </a>
          ) — it demonstrates all three agent modes, DID publication, credential issuance and proof
          verification end-to-end.
        </p>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">Bring your own LLM</h2>
        <p className="text-muted-foreground font-light">
          Everything in this catalog — primitives, agent modes, REST shapes, failure modes and all
          1,000 entries — is available as a single plain-text file at{" "}
          <a href="/llms-full.txt" className="text-foreground underline decoration-primary">/llms-full.txt</a>.
          Paste it into your own model and build from there.
        </p>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">Credits</h2>
        <p className="text-muted-foreground font-light">
          Built for the <strong className="text-foreground">Hyperledger Identus Catalyst</strong> organised by{" "}
          <strong className="text-foreground">Midnight Aliit Builder & Nightforce Alpha</strong> during <strong className="text-foreground">Indian Krump Festival 14</strong>.
          Hyperledger Identus is an LF Decentralized Trust project.{" "}
          <Link to="/strategy" className="text-foreground underline decoration-primary">Read the build strategy →</Link>
        </p>
      </article>
    </SiteShell>
  );
}
