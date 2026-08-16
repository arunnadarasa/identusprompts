import { createFileRoute, Link } from "@tanstack/react-router";
import hooks from "@/data/ideas/hooks.json";
import { MODES } from "@/data/modes";

export const Route = createFileRoute("/quantum-primer")({
  head: () => ({
    meta: [
      { title: "Identus primer · Hyperledger Identus Catalyst" },
      {
        name: "description",
        content:
          "Four Hyperledger Identus primitives every idea in this catalog leans on: publish a did:prism, open a DIDComm connection, issue a verifiable credential, and verify a proof.",
      },
      { property: "og:title", content: "Identus primer · Hyperledger Identus Catalyst" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "Four Identus primitives and three agent modes that power every Lovable hackathon entry in this catalog.",
      },
    ],
  }),
  component: Primer,
});

const GOTCHAS = [
  {
    title: "Publish before you issue",
    body: "Only a PUBLISHED did:prism carrying an `assertionMethod` key can sign a credential offer. Create → publish → wait for `PUBLISHED`, or issuance fails with a cryptic 422.",
  },
  {
    title: "Fly serves at the root",
    body: "A direct Fly deploy has no APISIX gateway, so strip any trailing `/cloud-agent` from the base URL. The local docker compose stack keeps it.",
  },
  {
    title: "Everything is asynchronous",
    body: "POST creates a record; you then poll `protocolState` — `OfferSent` → `CredentialSent`, `RequestSent` → `PresentationVerified`. Never assume the POST finished the job.",
  },
  {
    title: "Connectionless needs a goalCode",
    body: "Issuing without an established connection means omitting `connectionId` and supplying a `goalCode`. Send neither and you get \"Missing connectionId\".",
  },
  {
    title: "DIDComm needs a reachable host",
    body: "`DIDCOMM_SERVICE_URL` must point at a real, publicly reachable host with port 8090 published. A placeholder makes every invitation undeliverable.",
  },
  {
    title: "Give the agent room",
    body: "First boot migrates four databases. Allow ~5 minutes and at least 4 GB of memory before deciding the agent is broken — under that it gets OOM-killed mid-migration.",
  },
];

function Primer() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <header className="mb-12">
        <span className="eyebrow">primer · identus</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 text-foreground">
          Four Identus primitives, demystified.
        </h1>
        <p className="text-muted-foreground mt-4 text-base sm:text-lg font-light leading-relaxed max-w-3xl">
          Hyperledger Identus is open-source self-sovereign identity: an issuer signs a verifiable
          credential, a holder keeps it in their wallet, a verifier checks it without phoning the
          issuer. Every idea in this catalog leans on one of four primitives, all reached over plain
          REST on an Identus Cloud Agent.
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
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mb-4">Three ways to run the agent.</h2>
        <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-2xl mb-6">
          Every mega-prompt in the catalog is written for one of three modes. Pick the mode on any
          idea page and the prompt rewrites itself.
        </p>
        <ul className="grid gap-px bg-border sm:grid-cols-3">
          {MODES.map((m) => (
            <li key={m.id} className="p-6 bg-card">
              <div className="eyebrow text-primary">{m.tag}</div>
              <h3 className="font-display text-xl italic text-foreground mt-2">{m.name}</h3>
              <p className="text-sm text-muted-foreground font-light mt-3 leading-relaxed">{m.blurb}</p>
              <p className="text-xs text-foreground/70 font-light mt-3 leading-relaxed">
                <span className="text-primary">Secrets:</span>{" "}
                {m.secrets.length ? m.secrets.join(", ") : "none"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mb-4">Gotchas worth memorising.</h2>
        <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-2xl mb-6">
          The Identus docs leave a few edges ambiguous. These bite hardest in a one-shot Lovable build.
        </p>
        <ul className="grid gap-px bg-border sm:grid-cols-2">
          {GOTCHAS.map((g) => (
            <li key={g.title} className="p-6 bg-card">
              <div className="eyebrow text-primary">{g.title}</div>
              <p className="text-sm text-foreground/80 font-light mt-2 leading-relaxed">{g.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 border border-primary/30 bg-card p-6 sm:p-8">
        <span className="eyebrow text-primary">For your own LLM</span>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mt-2">
          Everything above, in one plain-text file.
        </h2>
        <p className="text-sm text-muted-foreground font-light mt-3 leading-relaxed max-w-2xl">
          Primitives, agent modes, REST shapes, failure modes and all 1,000 catalog entries —
          formatted for pasting straight into ChatGPT, Claude or your editor's assistant.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/llms-full.txt"
            className="px-5 py-2.5 bg-primary text-primary-foreground text-[11px] tracking-[0.28em] uppercase font-semibold hover:bg-foreground transition-colors duration-500"
          >
            Open llms-full.txt ↗
          </a>
          <Link
            to="/themes"
            className="px-5 py-2.5 border border-primary/40 text-[11px] tracking-[0.28em] uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
          >
            Browse the index →
          </Link>
        </div>
      </section>
    </div>
  );
}
