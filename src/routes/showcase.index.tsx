import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/showcase/")({
  head: () => ({
    meta: [
      { title: "Showcase — Hyperledger Identus reference console" },
      { name: "description", content: "identus.lovable.app is the reference implementation: three agent modes, did:prism publication, credential issuance and proof verification, built with Lovable." },
      { property: "og:title", content: "Showcase — Hyperledger Identus reference console" },
      { property: "og:description", content: "The Identus console shows DID → connection → credential → proof end-to-end across simulated, Docker and Fly.io agents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShowcaseIndex,
});

function ShowcaseIndex() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <span className="eyebrow">Showcase · Vol. 01</span>
      <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
        Reference <span className="italic text-primary">implementation</span>, already live.
      </h1>
      <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed font-light">
        The Identus console is a working end-to-end example — a Lovable build that provisions a
        Cloud Agent, publishes a did:prism, issues verifiable credentials and verifies proofs, with
        a simulated fallback so nothing ever blocks the demo. Every mega-prompt in the index is a
        smaller slice of this exact shape.
      </p>

      <a
        href="https://identus.lovable.app/"
        target="_blank"
        rel="noreferrer"
        className="mt-12 block p-6 sm:p-8 border border-primary/50 bg-card hover:bg-primary/5 transition-colors duration-300 group"
      >
        <span className="eyebrow text-primary">Vol. 01 · No. 01 · Live · identus.lovable.app</span>
        <h2 className="font-display text-2xl sm:text-3xl mt-3 italic group-hover:text-primary transition-colors">
          Identus console — the working reference build.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl font-light">
          A TanStack Start app that talks to a Hyperledger Identus Cloud Agent from{" "}
          <code>createServerFn</code> handlers: mint and publish DIDs, generate DIDComm invitations,
          issue JWT credentials (connection-bound or connectionless), request proof presentations,
          and deploy the whole agent stack to Fly Machines from the browser.
        </p>
        <span className="mt-5 inline-block text-[11px] tracking-[0.28em] uppercase font-semibold text-primary">
          Open the live console ↗
        </span>
      </a>

      <div className="mt-8 grid sm:grid-cols-2 gap-px bg-border">
        <ShowcaseCard
          eyebrow="Primitive · DID Registrar"
          title="Publish a did:prism"
          body="POST /did-registrar/dids with authentication + assertionMethod keys, then POST /publications. Only a published DID with assertionMethod can sign a credential."
        />
        <ShowcaseCard
          eyebrow="Primitive · DIDComm Connection"
          title="Invitation → peer channel"
          body="POST /connections returns an out-of-band invitation URL. Render it as a QR code and poll until ConnectionResponseSent. Remote wallets need a publicly reachable DIDCOMM_SERVICE_URL."
        />
        <ShowcaseCard
          eyebrow="Primitive · Credential Issuance"
          title="Signed verifiable credential"
          body="POST /issue-credentials/credential-offers with claims, a published issuingDID and credentialFormat JWT. Omit connectionId and supply a goalCode for connectionless issuance."
        />
        <ShowcaseCard
          eyebrow="Primitive · Proof Presentation"
          title="Verify without the middleman"
          body="POST /present-proof/presentations, then poll until PresentationVerified. Show the predicate only — never copy the holder's credential into your own database."
        />
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-px bg-border">
        <a
          href="https://github.com/arunnadarasa/identus"
          target="_blank"
          rel="noreferrer"
          className="p-6 bg-card hover:bg-background transition-colors"
        >
          <span className="eyebrow text-primary">Source · GitHub</span>
          <h3 className="font-display text-xl mt-2 italic text-foreground">arunnadarasa/identus ↗</h3>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed font-light">
            The full console source — server/client split, Fly provisioning, compose lab and the
            simulated agent implementation.
          </p>
        </a>
        <a
          href="https://identus.io/documentation/develop/"
          target="_blank"
          rel="noreferrer"
          className="p-6 bg-card hover:bg-background transition-colors"
        >
          <span className="eyebrow text-primary">Docs · identus.io</span>
          <h3 className="font-display text-xl mt-2 italic text-foreground">Developer documentation ↗</h3>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed font-light">
            Cloud Agent REST reference, DIDComm protocols, credential formats and the TypeScript
            and Kotlin edge SDKs.
          </p>
        </a>
      </div>

      <div className="mt-8 p-6 sm:p-8 border border-dashed border-border bg-card">
        <span className="eyebrow text-primary">Vol. 01 · in production</span>
        <h2 className="font-display text-2xl sm:text-3xl mt-3 italic">
          More showcases land here as builders ship them.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl font-light">
          Pick any entry from the <Link to="/themes" className="text-primary hover:underline">index</Link>,
          choose an agent mode, paste its mega-prompt into Lovable, and your build will join the
          showcase.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/themes" className="px-5 py-2.5 bg-primary text-primary-foreground text-[11px] tracking-[0.28em] uppercase font-semibold hover:bg-foreground transition-colors duration-500">
            Browse the index →
          </Link>
          <a href="/llms-full.txt" className="px-5 py-2.5 border border-primary/40 text-[11px] tracking-[0.28em] uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-500">
            llms-full.txt ↗
          </a>
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
