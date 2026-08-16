#!/usr/bin/env python3
"""Stamp every idea with a Hyperledger Identus mega-prompt.

- Assigns primitives strictly round-robin (25 per primitive per theme).
- Rewrites quantumHook / quantumTag / quantumRationale / pitch.
- Rebuilds megaPrompt as a single-message Lovable prompt containing an
  `<<MODE_BLOCK>>` token; the site substitutes the selected agent mode
  (simulated / docker / fly) at copy time.

No API calls. Idempotent.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"
THEMES = json.loads((DATA / "themes.json").read_text())
HOOKS = {h["id"]: h for h in json.loads((DATA / "hooks.json").read_text())}
HOOK_ORDER = ["identus-did", "identus-connection", "identus-credential", "identus-verify"]

CREDIT = ("Built for the Hyperledger Identus Catalyst — organised by StreetKode Fam "
          "during Indian Krump Festival 14")

BUDGET = """LOVABLE BUDGET (HARD CAP: ONE-SHOT, ~5 CREDITS TOTAL):
This prompt MUST ship a working demo on the FIRST message with zero follow-ups.
- ONE TanStack Start app, ONE route (`src/routes/index.tsx`). No auth, no nav.
- ONE server module `src/lib/identus.functions.ts` with `createServerFn` wrappers.
- ONE client surface wired to it (form + result panel).
- NO database, NO Lovable Cloud, NO file uploads, NO extra integrations.
- Libraries: template defaults + `zod`. Nothing else.
- If a feature is not in the user flow below, do not build it."""

PRIMER = """IDENTUS PRIMER (assume the reader has never used Identus)
- Hyperledger Identus is open-source self-sovereign identity: an issuer signs a
  W3C Verifiable Credential, a holder keeps it in their wallet, and a verifier
  checks it without phoning the issuer.
- The Cloud Agent is a REST service. Everything below is plain HTTP + JSON.
  Docs: https://identus.io/documentation/develop/ ·
  https://github.com/hyperledger-identus/cloud-agent
- Identifiers are `did:prism:<hex>` — created unpublished, then published so
  others can resolve them. Only a PUBLISHED DID carrying an `assertionMethod`
  key can sign a credential.
- Agents talk to each other over DIDComm; a Mediator relays messages to wallets
  that are not always online (https://github.com/hyperledger-identus/mediator).
- Browser/mobile holders use the TypeScript SDK
  (https://github.com/hyperledger-identus/sdk-ts) — not needed for this build.
- Auth to the agent is the `apikey: <AGENT_API_KEY>` header. Server-side only."""

GOTCHAS = """GOTCHAS (universal — apply to every agent call in this build)
- Only a PUBLISHED DID with an `assertionMethod` key can sign a credential
  offer. Create -> publish -> wait for `PUBLISHED` before issuing, or you get a
  cryptic 422/500.
- On a direct Fly deploy the agent serves at the app ROOT — strip any trailing
  `/cloud-agent` from the base URL. On the local docker compose stack, KEEP it.
- Every issuance/presentation endpoint is asynchronous: you POST, then POLL the
  record's `protocolState` (`OfferSent` -> `CredentialSent`,
  `RequestSent` -> `PresentationVerified`). Never assume the POST finished the job.
- Connectionless issuance omits `connectionId` and needs a `goalCode`; if you
  send neither a `connectionId` nor a `goalCode` you get "Missing connectionId".
- The human principal and any AI agent acting for them are DIFFERENT DIDs.
  Compare principal to credential subject, agent to mandate subject — never cross them.
- First boot of a real agent migrates four databases: allow ~5 minutes and >= 4 GB
  of memory before deciding it is broken.
- Never call the agent from the browser. Every fetch lives inside a
  `createServerFn` handler so `AGENT_API_KEY` stays server-side."""

CONVENTIONS = """RUNTIME CONVENTIONS (this template — follow exactly)
- Stack: TanStack Start v1 + React 19 + Vite 7 + Tailwind v4 (`src/styles.css`).
  There is NO `src/App.tsx`, no react-router-dom, no `src/pages`.
- Routes live in `src/routes`; the home page is `src/routes/index.tsx` and uses
  `createFileRoute("/")({ component: Page, head: () => ({ meta: [...] }) })`.
  Never edit `src/routeTree.gen.ts`.
- Server logic: `import { createServerFn } from "@tanstack/react-start";` in a
  client-safe module such as `src/lib/identus.functions.ts`. Shape is
  `createServerFn({ method: "POST" }).inputValidator((d) => schema.parse(d)).handler(async ({ data }) => {...})`.
  Call it from the client with `useServerFn(fn)` or directly inside an event handler.
- Read `process.env.AGENT_BASE_URL` / `process.env.AGENT_API_KEY` INSIDE the
  handler — never at module scope (env is injected at call time).
- The server runtime is a Cloudflare-style Worker: use `fetch`, `crypto.randomUUID()`,
  `Buffer`. No child_process, no sharp, no native modules.
- Toasts: `sonner` (`import { toast } from "sonner"`), and render `<Toaster />`
  once in `src/routes/__root.tsx`. `@/hooks/use-toast` does NOT exist here.
- Colours come from semantic tokens in `src/styles.css` — no hardcoded
  `text-white` / `bg-black` / `bg-[#hex]` in components.
- Give `src/routes/index.tsx` its own `head()` with a real title and description."""

API_REFERENCE = """CLOUD AGENT API REFERENCE (everything you need — no other docs required)
All calls: base URL `AGENT_BASE_URL`, headers
`{ "content-type": "application/json", apikey: AGENT_API_KEY }`.

GET  /_system/health                      -> { version } (use for a status pill)

POST /did-registrar/dids
  body { documentTemplate: { publicKeys: [{ id, purpose: "authentication"|"assertionMethod", curve: "secp256k1" }], services: [] } }
  -> { longFormDid, status: "CREATED" }
POST /did-registrar/dids/{didRef}/publications  -> { scheduledOperation: { id, didRef } }
GET  /did-registrar/dids/{didRef}         -> { did, longFormDid, status: "CREATED"|"PUBLICATION_PENDING"|"PUBLISHED" }
GET  /dids/{did}                          -> resolved DID document

POST /connections
  body { label, goalCode: "connect", goal }
  -> { connectionId, state: "InvitationGenerated", invitation: { invitationUrl, id } }
POST /connection-invitations
  body { invitation: "<oob base64url string from the invitationUrl ?_oob= param>" }
GET  /connections/{connectionId}
  -> { state } : InvitationGenerated -> ConnectionRequestReceived -> ConnectionResponseSent
GET  /connections                         -> { contents: [...] }

POST /issue-credentials/credential-offers
  body { claims: { ... }, issuingDID, credentialFormat: "JWT", automaticIssuance: true,
         connectionId? | (goalCode + goal for connectionless) }
  -> { recordId, protocolState: "OfferSent", invitation?: { invitationUrl } }
GET  /issue-credentials/records/{recordId}
  -> { protocolState } : OfferSent -> RequestReceived -> CredentialSent, plus `credential` (JWT string)
GET  /issue-credentials/records           -> { contents: [...] }

POST /present-proof/presentations
  body { connectionId, proofs: [], options: { challenge, domain },
         claims: { "<attr>": {} } }   // or anoncredPresentationRequest for ZK predicates
  -> { presentationId, status: "RequestSent" }
GET  /present-proof/presentations/{presentationId}
  -> { status } : RequestSent -> PresentationReceived -> PresentationVerified | PresentationVerificationFailed
  plus `data` (the disclosed claims)

Errors are RFC-7807 JSON: { status, title, detail }. Surface `detail` in the UI —
it names the real problem (unpublished DID, missing connectionId, bad apikey)."""

REFERENCES = """REFERENCE MATERIAL (if you need more than the above)
- Identus docs: https://identus.io/documentation/develop/
- Cloud Agent (OpenAPI + compose examples): https://github.com/hyperledger-identus/cloud-agent
- TypeScript SDK (browser/wallet holders): https://github.com/hyperledger-identus/sdk-ts
- Mediator (DIDComm relay for offline wallets): https://github.com/hyperledger-identus/mediator
- Umbrella repo: https://github.com/hyperledger-identus/hyperledger-identus
- Reference console built with this stack: https://github.com/arunnadarasa/identus
- Full machine-readable brief for your own LLM: https://identusprompts.lovable.app/llms-full.txt"""

SNIPPETS = {
    "identus-did": """SERVER SNIPPET — DID Registrar (create + publish a did:prism)
```ts
// src/lib/identus.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const mintDid = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ label: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const base = process.env.AGENT_BASE_URL!.replace(/\\/$/, "");
    const headers = { "content-type": "application/json", apikey: process.env.AGENT_API_KEY! };

    const created = await fetch(`${base}/did-registrar/dids`, {
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

    await fetch(`${base}/did-registrar/dids/${created.longFormDid}/publications`, {
      method: "POST", headers,
    });

    // Poll until the DID reports PUBLISHED, then resolve the document.
    return { did: created.longFormDid, label: data.label };
  });
```""",
    "identus-connection": """SERVER SNIPPET — DIDComm Connection (invitation -> peer channel)
```ts
export const createInvitation = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ label: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const base = process.env.AGENT_BASE_URL!.replace(/\\/$/, "");
    const res = await fetch(`${base}/connections`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: process.env.AGENT_API_KEY! },
      body: JSON.stringify({ label: data.label, goalCode: "connect", goal: data.label }),
    });
    const conn = await res.json();
    // conn.invitation.invitationUrl -> render as a QR code for the wallet
    return { connectionId: conn.connectionId, invitationUrl: conn.invitation.invitationUrl, state: conn.state };
  });

export const connectionState = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ connectionId: z.string() }).parse(d))
  .handler(async ({ data }) => { /* GET /connections/{id} -> { state } */ });
```
Poll `connectionState` every 2s in the client until `ConnectionResponseSent`.""",
    "identus-credential": """SERVER SNIPPET — Credential Issuance (signed verifiable credential)
```ts
export const offerCredential = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    issuingDID: z.string(), claims: z.record(z.string(), z.string()),
    connectionId: z.string().optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const base = process.env.AGENT_BASE_URL!.replace(/\\/$/, "");
    const res = await fetch(`${base}/issue-credentials/credential-offers`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: process.env.AGENT_API_KEY! },
      body: JSON.stringify({
        claims: data.claims,
        issuingDID: data.issuingDID,          // MUST be published + assertionMethod
        credentialFormat: "JWT",
        automaticIssuance: true,
        ...(data.connectionId
          ? { connectionId: data.connectionId }
          : { goalCode: "issue-vc", goal: "Claim your credential" }), // connectionless
      }),
    });
    const rec = await res.json();
    return { recordId: rec.recordId, state: rec.protocolState, invitationUrl: rec.invitation?.invitationUrl };
  });
```
Poll `GET /issue-credentials/records/{recordId}` until `CredentialSent`.""",
    "identus-verify": """SERVER SNIPPET — Proof Presentation (verify a credential)
```ts
export const requestProof = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ connectionId: z.string(), attributes: z.array(z.string()) }).parse(d))
  .handler(async ({ data }) => {
    const base = process.env.AGENT_BASE_URL!.replace(/\\/$/, "");
    const res = await fetch(`${base}/present-proof/presentations`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: process.env.AGENT_API_KEY! },
      body: JSON.stringify({
        connectionId: data.connectionId,
        proofs: [],
        options: { challenge: crypto.randomUUID(), domain: "https://example.app" },
        claims: Object.fromEntries(data.attributes.map((a) => [a, {}])),
      }),
    });
    const rec = await res.json();
    return { presentationId: rec.presentationId, state: rec.status };
  });
```
Poll `GET /present-proof/presentations/{id}` until `PresentationVerified`, then
show a green/red gate. Reveal only the predicate you needed — never store the
holder's full credential.""",
}

RATIONALES = {
    "identus-did": lambda sub, theme: (
        f"DID Registrar fits {sub} in {theme} because the people and works involved need a portable "
        f"identifier they own — not a row in someone else's platform database that disappears when the "
        f"platform does."
    ),
    "identus-connection": lambda sub, theme: (
        f"A DIDComm Connection suits {sub} in {theme} because two parties have to establish a private, "
        f"mutually-authenticated channel before anything sensitive — a credit, a licence, a booking — "
        f"can pass between them."
    ),
    "identus-credential": lambda sub, theme: (
        f"Credential Issuance matches {sub} in {theme} because the claim at the centre of the workflow "
        f"is a fact somebody must vouch for — and a signed credential lets the holder carry that proof "
        f"anywhere without asking the issuer again."
    ),
    "identus-verify": lambda sub, theme: (
        f"Proof Presentation is right for {sub} in {theme} because the job is checking a claim at a "
        f"gate — fast, offline-friendly, and revealing only the fact that matters instead of copying "
        f"personal data into another database."
    ),
}

PITCHES = {
    "identus-did": lambda t, sub, c: f"{t} mints a did:prism for {sub} so identity travels with the person, not the platform.",
    "identus-connection": lambda t, sub, c: f"{t} pairs two wallets over DIDComm so {sub} can exchange trusted claims on a private channel.",
    "identus-credential": lambda t, sub, c: f"{t} issues a signed verifiable credential for {sub} that the holder keeps and reuses anywhere.",
    "identus-verify": lambda t, sub, c: f"{t} verifies a credential at the gate for {sub} — proof without a phone call to the issuer.",
}

FLOWS = {
    "identus-did": ("1. The user types a label (their name, a company, a work).\n"
                    "2. Press \"Mint identity\" -> server function creates and publishes a did:prism.\n"
                    "3. Show the DID, its status (`CREATED` -> `PUBLISHED`), and the resolved document JSON.\n"
                    "4. A copy button for the DID string, and a short plain-English explainer of what it is."),
    "identus-connection": ("1. The user presses \"Create invitation\" -> server function returns an invitation URL.\n"
                           "2. Render it as a QR code plus a copyable link.\n"
                           "3. Poll the connection state every 2s and show a live status pill.\n"
                           "4. When the state reaches `ConnectionResponseSent`, reveal the paired peer DID."),
    "identus-credential": ("1. The user fills a tiny claims form (2-4 fields for the scenario below).\n"
                           "2. Press \"Issue credential\" -> server function creates the offer against the published issuer DID.\n"
                           "3. Poll the record until `CredentialSent`; show the state machine as it advances.\n"
                           "4. Show the credential JSON + the invitation URL/QR so a wallet can accept it."),
    "identus-verify": ("1. The verifier picks which attributes they demand (checkboxes).\n"
                       "2. Press \"Request proof\" -> server function creates the presentation request.\n"
                       "3. Poll until `PresentationVerified` and show a large PASS / FAIL gate.\n"
                       "4. List ONLY the disclosed attributes, with a note that nothing else was revealed."),
}


def build_prompt(idea: dict, theme: dict, hook: dict) -> str:
    concept = idea.get("concept") or idea.get("pitch") or idea["title"]
    return f"""Build "{idea['title']}" as a ONE-SHOT Lovable build.
Single-page TanStack Start app. Cut scope ruthlessly.

CONCEPT
{concept}
Discipline: {theme['name']} ({idea['subDiscipline']}).
Recipe: {hook['name']} ({hook['tag']}) as the single Hyperledger Identus primitive.
Why Identus: {idea['quantumRationale']}

{BUDGET}

{PRIMER}

<<MODE_BLOCK>>

{SNIPPETS[hook['id']]}

USER FLOW (build exactly this, nothing more)
{FLOWS[hook['id']]}

DESIGN
Editorial, high-contrast, generous whitespace. One accent colour used sparingly.
Show the protocol honestly: render the state machine and the raw JSON envelope in
a collapsible panel so a judge can see the real Identus record. Truncate DIDs and
JWTs in prose (first 12 + last 6 chars) with the full value behind a copy button.
Mobile first — a judge will open this on a phone.

MARKET (for the pitch slide, not the UI)
TAM {idea['tam']} · SAM {idea['sam']} · SOM {idea['som']}

{GOTCHAS}

DELIVERABLE
A working single-page demo where the flow above completes end-to-end, plus a
one-paragraph README explaining which Identus primitive is used and how to point
the app at a real Cloud Agent.
{CREDIT}."""


def main() -> None:
    for theme in THEMES:
        path = DATA / f"{theme['slug']}.json"
        doc = json.loads(path.read_text())
        for n, idea in enumerate(doc["ideas"]):
            hook_id = HOOK_ORDER[n % len(HOOK_ORDER)]
            hook = HOOKS[hook_id]
            sub = idea.get("subDiscipline") or "independent practice"
            idea["quantumHookId"] = hook_id
            idea["quantumHook"] = hook["name"]
            idea["quantumTag"] = hook["tag"]
            idea["quantumRationale"] = RATIONALES[hook_id](sub, theme["name"])
            idea["pitch"] = PITCHES[hook_id](idea["title"], sub, idea.get("concept", ""))
            idea["megaPrompt"] = build_prompt(idea, theme, hook)
        path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n")
        counts = {}
        for i in doc["ideas"]:
            counts[i["quantumHookId"]] = counts.get(i["quantumHookId"], 0) + 1
        print(f"{path.name}: {counts}")


if __name__ == "__main__":
    main()
