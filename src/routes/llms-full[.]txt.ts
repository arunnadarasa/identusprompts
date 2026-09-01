import { createFileRoute } from "@tanstack/react-router";
import { ALL_IDEAS, HOOKS, IDEAS_BY_THEME, THEMES } from "@/data/ideas";
import { MODES, composeMegaPrompt } from "@/data/modes";

function buildDoc(): string {
  const lines: string[] = [];
  const p = (s = "") => lines.push(s);

  p("# Hyperledger Identus Catalyst — llms-full.txt");
  p();
  p("A complete, LLM-ready knowledge dump for building Hyperledger Identus demos");
  p("with Lovable during the Hyperledger Identus Catalyst hackathon — organised by");
  p("Midnight Aliit Builder & Nightforce Alpha during Indian Krump Festival 14.");
  p();
  p("Paste this whole file into your own LLM, then ask it to build one of the ideas");
  p("listed at the end. Everything the model needs — primitives, agent modes, REST");
  p("shapes, and failure modes — is below.");
  p();
  p("## What Hyperledger Identus is");
  p();
  p("Identus is open-source self-sovereign identity infrastructure. An issuer signs a");
  p("W3C Verifiable Credential, a holder stores it in their wallet, and a verifier");
  p("checks it cryptographically without contacting the issuer. Identifiers are");
  p("`did:prism` DIDs anchored by a PRISM node. Agents exchange messages over DIDComm.");
  p();
  p("Components:");
  p("- Cloud Agent — Scala REST service; issues, holds and verifies. The only piece");
  p("  your app talks to. https://github.com/hyperledger-identus/cloud-agent");
  p("- PRISM node — anchors DID operations. Runs beside the agent.");
  p("- Postgres — four databases: pollux, connect, agent, node.");
  p("- Mediator — relays DIDComm to wallets that are not always online.");
  p("  https://github.com/hyperledger-identus/mediator");
  p("- Edge SDKs — TypeScript https://github.com/hyperledger-identus/sdk-ts ,");
  p("  Kotlin Multiplatform https://github.com/hyperledger-identus/sdk-kmp");
  p();
  p("Docs: https://identus.io/documentation/develop/");
  p("Docs source: https://github.com/hyperledger-identus/docs");
  p("Umbrella repo: https://github.com/hyperledger-identus/hyperledger-identus");
  p("Reference console: https://identus.lovable.app/ (source:");
  p("https://github.com/arunnadarasa/identus)");
  p();
  p("## Authentication and boundaries");
  p();
  p("- Every agent call carries the header `apikey: <AGENT_API_KEY>`.");
  p("- Never call the agent from the browser. In TanStack Start, wrap each call in a");
  p("  `createServerFn` handler and read `process.env` INSIDE the handler.");
  p("- Issuance and presentation are asynchronous: POST, then poll the record's");
  p("  `protocolState` until it reaches its terminal value.");
  p();
  p("## The four primitives");
  p();
  for (const h of HOOKS) {
    p(`### ${h.name} (${h.id}) — ${h.tag}`);
    p();
    p(h.kernel);
    p();
    p(`UI shape: ${h.ui}`);
    p();
  }
  p("## The three agent modes");
  p();
  for (const m of MODES) {
    p(`### ${m.name} (${m.id}) — ${m.tag}`);
    p();
    p(m.blurb);
    p();
    p(`When to use: ${m.when}`);
    p(`Secrets: ${m.secrets.length ? m.secrets.join(", ") : "none"}`);
    p();
    p("```text");
    p(m.setup);
    p("```");
    p();
    p(`Gotchas: ${m.gotchas}`);
    p();
  }
  p("## Worked example — a complete mega-prompt");
  p();
  p("This is one full prompt from the catalog, expanded in simulated mode. Every");
  p("other idea follows the same shape; swap the mode block for docker or fly.");
  p();
  p("```text");
  p(composeMegaPrompt(ALL_IDEAS[2]?.megaPrompt ?? "", "simulated"));
  p("```");
  p();
  p("## The catalog — 1,000 ideas across 10 creative disciplines");
  p();
  p("Each theme holds 100 ideas, exactly 25 per primitive. Browse and copy the full");
  p("mega-prompt for any entry at /ideas/<id>.");
  p();
  for (const t of THEMES) {
    p(`### ${t.name} (${t.slug})`);
    p(`Audience: ${t.audience}`);
    p(`Market anchor: ${t.market_anchor}`);
    p();
    for (const idea of IDEAS_BY_THEME[t.slug] ?? []) {
      p(`- ${idea.title} [${idea.quantumHook}] — ${idea.pitch} (/ideas/${idea.id})`);
    }
    p();
  }
  p("## Licence and credit");
  p();
  p("Hyperledger Identus is an LF Decentralized Trust project (Apache-2.0).");
  p("This catalog was built for the Hyperledger Identus Catalyst — organised by");
  p("Midnight Aliit Builder & Nightforce Alpha during Indian Krump Festival 14.");
  p();
  return lines.join("\n");
}

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildDoc(), {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
