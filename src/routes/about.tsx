import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Creative AI" },
      { name: "description", content: "About the Creative AI hackathon idea repo for ElevenLabs + Lovable." },
      { property: "og:title", content: "About · Creative AI" },
      { property: "og:description", content: "Why this repo exists and how to use it at the hackathon." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <article className="max-w-2xl mx-auto px-5 pt-16 pb-20 prose prose-invert">
        <span className="eyebrow">about</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 mb-6 text-foreground">A starter pack for the Creative AI &amp; Quantum Hackathon.</h1>
        <p className="text-lg text-muted-foreground leading-relaxed font-light">
          Hackathons live or die on the first hour. This repo gives participants a 1,000-idea
          launchpad so you skip the blank page and start shipping real voice in one Lovable build.
        </p>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">What's inside</h2>
        <ul className="space-y-2 text-muted-foreground font-light">
          <li>· <strong className="text-foreground">10 creative disciplines</strong> — dance, music, visual art, video, photo, writing, film/animation, games, theater, fashion.</li>
          <li>· <strong className="text-foreground">100 ideas per discipline</strong> — each combining a sub-discipline with one of four ElevenLabs voice primitives.</li>
          <li>· <strong className="text-foreground">A Lovable mega-prompt</strong> per idea — paste, build, ship.</li>
          <li>· <strong className="text-foreground">A voice primitive</strong> — streaming text-to-speech, conversational voice agent, realtime scribe, or generative music + SFX.</li>
          <li>· <strong className="text-foreground">TAM / SAM / SOM</strong> — indicative market sizing for your pitch slide.</li>
        </ul>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">How to use it</h2>
        <ol className="space-y-2 text-muted-foreground list-decimal pl-5 font-light">
          <li>Pick a discipline that matches your team's strengths.</li>
          <li>Skim the 100 ideas; click into 2–3 that grab you.</li>
          <li>In your Lovable project, add one secret: <code>ELEVENLABS_API_KEY</code>. Grab it from <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noreferrer" className="text-foreground underline decoration-primary">elevenlabs.io</a>.</li>
          <li>Copy the mega-prompt into Lovable. The prompt wires a TanStack server function to ElevenLabs and a matching client hook for the chosen kernel.</li>
          <li>Polish the demo, prep your TAM/SAM/SOM slide, present.</li>
        </ol>
        <h2 className="font-display text-2xl font-semibold mt-10 mb-3 text-foreground italic">Credits</h2>
        <p className="text-muted-foreground font-light">
          Built during the <strong className="text-foreground">Creative AI &amp; Quantum Hackathon</strong> organised by{" "}
          <strong className="text-foreground">StreetKode Fam</strong> during <strong className="text-foreground">Indian Krump Festival 14</strong>.
          Every server function generated from these prompts carries the same credit in JSDoc, so the
          attribution ships alongside the code.{" "}
          <Link to="/strategy" className="text-foreground underline decoration-primary">Read the build strategy →</Link>
        </p>
      </article>
    </SiteShell>
  );
}
