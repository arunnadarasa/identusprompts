import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Build strategy — ship a real Identus demo in one Lovable build" },
      {
        name: "description",
        content:
          "How to ship a Hyperledger Identus demo in one Lovable build: pick an agent mode, paste one prompt, and let a TanStack server function talk to the Cloud Agent — DIDs, credentials, proofs.",
      },
      { property: "og:title", content: "Real Identus in one Lovable build" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "Build-time pattern for Lovable + Hyperledger Identus hackathon entries.",
      },
    ],
  }),
  component: Strategy,
});

const DID_SNIPPET = `// src/lib/identus.functions.ts — mint and publish a did:prism
// Built for the Hyperledger Identus Catalyst — StreetKode Fam · Indian Krump Festival 14
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const agent = () => ({
  base: process.env.AGENT_BASE_URL!.replace(/\\/$/, ""),
  headers: { "content-type": "application/json", apikey: process.env.AGENT_API_KEY! },
});

export const mintDid = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ label: z.string().min(1) }).parse(d))
  .handler(async () => {
    const { base, headers } = agent();
    const created = await fetch(\`\${base}/did-registrar/dids\`, {
      method: "POST", headers,
      body: JSON.stringify({
        documentTemplate: {
          publicKeys: [
            { id: "auth-1", purpose: "authentication", curve: "secp256k1" },
            { id: "assert-1", purpose: "assertionMethod", curve: "secp256k1" },
          ],
          services: [],
        },
      }),
    }).then((r) => r.json());

    await fetch(\`\${base}/did-registrar/dids/\${created.longFormDid}/publications\`, {
      method: "POST", headers,
    });
    return { did: created.longFormDid };
  });`;

const CONNECTION_SNIPPET = `// src/lib/identus.functions.ts — DIDComm invitation
export const createInvitation = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ label: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { base, headers } = agent();
    const conn = await fetch(\`\${base}/connections\`, {
      method: "POST", headers,
      body: JSON.stringify({ label: data.label, goalCode: "connect", goal: data.label }),
    }).then((r) => r.json());

    // Render conn.invitation.invitationUrl as a QR code; poll GET /connections/{id}
    // until state === "ConnectionResponseSent".
    return { connectionId: conn.connectionId, invitationUrl: conn.invitation.invitationUrl };
  });`;

const CREDENTIAL_SNIPPET = `// src/lib/identus.functions.ts — issue a JWT verifiable credential
export const offerCredential = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    issuingDID: z.string(),
    claims: z.record(z.string(), z.string()),
    connectionId: z.string().optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { base, headers } = agent();
    const rec = await fetch(\`\${base}/issue-credentials/credential-offers\`, {
      method: "POST", headers,
      body: JSON.stringify({
        claims: data.claims,
        issuingDID: data.issuingDID,       // must be PUBLISHED with assertionMethod
        credentialFormat: "JWT",
        automaticIssuance: true,
        ...(data.connectionId
          ? { connectionId: data.connectionId }
          : { goalCode: "issue-vc", goal: "Claim your credential" }),
      }),
    }).then((r) => r.json());

    // Poll GET /issue-credentials/records/{recordId} until "CredentialSent".
    return { recordId: rec.recordId, state: rec.protocolState };
  });`;

const VERIFY_SNIPPET = `// src/lib/identus.functions.ts — request and verify a proof
export const requestProof = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    connectionId: z.string(),
    attributes: z.array(z.string()),
  }).parse(d))
  .handler(async ({ data }) => {
    const { base, headers } = agent();
    const rec = await fetch(\`\${base}/present-proof/presentations\`, {
      method: "POST", headers,
      body: JSON.stringify({
        connectionId: data.connectionId,
        proofs: [],
        options: { challenge: crypto.randomUUID(), domain: "https://example.app" },
        claims: Object.fromEntries(data.attributes.map((a) => [a, {}])),
      }),
    }).then((r) => r.json());

    // Poll GET /present-proof/presentations/{id} until "PresentationVerified".
    return { presentationId: rec.presentationId, state: rec.status };
  });`;

const ENV_SNIPPET = `# Simulated mode — no secrets at all. Start here.

# Docker mode (local compose stack, APISIX gateway present):
AGENT_BASE_URL=http://localhost:8085/cloud-agent
AGENT_API_KEY=<DEFAULT_WALLET_AUTH_API_KEY>

# Fly.io mode (direct deploy — NO /cloud-agent suffix):
AGENT_BASE_URL=https://<app>.fly.dev
AGENT_API_KEY=<DEFAULT_WALLET_AUTH_API_KEY>

# The mega-prompt then:
#    - writes createServerFn wrappers around the Cloud Agent REST API
#    - polls protocolState instead of assuming the POST finished the job
#    - keeps the key on the server via process.env.AGENT_API_KEY`;

function Strategy() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <header className="mb-12">
        <div className="eyebrow text-primary mb-4">build strategy · identus</div>
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] text-foreground">
          Real identity, <span className="text-primary italic">one prompt</span>, one build.
        </h1>
        <p className="text-muted-foreground mt-5 text-base sm:text-lg font-light leading-relaxed max-w-2xl">
          Every entry in this catalog compiles down to the same shape: a TanStack server function
          calling a Hyperledger Identus Cloud Agent, plus one client surface. It's the only pattern
          that ships a working self-sovereign identity demo in one shot, inside the 5-credit budget.
        </p>
      </header>

      <section className="grid gap-px bg-border sm:grid-cols-2 mb-12">
        <div className="p-6 bg-card">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Why Identus and not a login form?</h2>
          <p className="text-sm text-muted-foreground mt-3 font-light leading-relaxed">
            Identus is identity infrastructure, not accounts. The issuer signs a fact once; the
            holder carries it in their own wallet; any verifier checks it cryptographically without
            calling the issuer. Nothing about it is a token, a coin, or a speculation.
          </p>
        </div>
        <div className="p-6 bg-card">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Three modes, one codebase</h2>
          <p className="text-sm text-muted-foreground mt-3 font-light leading-relaxed">
            Start simulated — an in-app mock with the agent's exact response shapes and zero setup.
            Swap in a local Docker stack or a hosted Fly.io deployment later by changing two
            environment variables. The UI never has to change.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <span className="eyebrow text-primary">src/lib/identus.functions.ts — publish a DID</span>
          <Snippet code={DID_SNIPPET} />
        </div>
        <div>
          <span className="eyebrow text-primary">src/lib/identus.functions.ts — DIDComm invitation</span>
          <Snippet code={CONNECTION_SNIPPET} />
        </div>
        <div>
          <span className="eyebrow text-primary">src/lib/identus.functions.ts — issue a credential</span>
          <Snippet code={CREDENTIAL_SNIPPET} />
        </div>
        <div>
          <span className="eyebrow text-primary">src/lib/identus.functions.ts — verify a proof</span>
          <Snippet code={VERIFY_SNIPPET} />
        </div>
        <div>
          <span className="eyebrow text-primary">environment</span>
          <Snippet code={ENV_SNIPPET} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mb-5">Rules of the build.</h2>
        <ul className="space-y-3 text-sm text-muted-foreground font-light leading-relaxed">
          <li>· Pick one idea, pick one mode, paste its mega-prompt. That's the whole build.</li>
          <li>· Never call the agent from the browser — every fetch lives inside a <code>createServerFn</code> handler.</li>
          <li>· Read <code>process.env</code> inside the handler, never at module scope.</li>
          <li>· Publish the issuer DID and wait for <code>PUBLISHED</code> before issuing anything.</li>
          <li>· Poll <code>protocolState</code>; issuance and presentation are asynchronous.</li>
          <li>· On Fly, strip <code>/cloud-agent</code> from the base URL. On Docker, keep it.</li>
          <li>· Render the state machine and the raw JSON record — judges want to see the real protocol.</li>
          <li>· Add the footer credit: "Built for the Hyperledger Identus Catalyst — StreetKode Fam · Indian Krump Festival 14".</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.28em]">
          <Link to="/quantum-primer" className="px-6 py-3 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500">
            Identus primer
          </Link>
          <a
            href="https://identus.io/documentation/develop/"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
          >
            Identus docs ↗
          </a>
          <a
            href="https://github.com/arunnadarasa/identus"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold hover:bg-foreground transition-colors duration-500"
          >
            Reference console ↗
          </a>
        </div>
      </section>
    </div>
  );
}

function Snippet({ code }: { code: string }) {
  return (
    <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] sm:text-[12px] leading-relaxed p-4 sm:p-6 border border-border bg-card text-foreground/90 overflow-x-auto" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", wordBreak: "break-word", overflowWrap: "anywhere" }}>
{code}
    </pre>
  );
}
