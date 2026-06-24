## Rebrand to Creative Blockchain + regenerate 1000 prompts

Pivot the entire site from "Creative Quantum" to "Creative Blockchain". Keep the 10 creative themes (Dance, Music, Visual Art, Video, Photography, Writing, Film/Animation, Games, Theater, Fashion) and the 100-ideas-per-theme structure. Swap the 10 quantum primitives for 4 web3 primitives, and regenerate every title / pitch / mega-prompt via the AISA API so each prompt teaches users how to wire MetaMask, Sepolia, Etherscan, Privy, and Pinata into their Lovable app.

### 1. New "blockchain primitives" (replaces quantum hooks)

`src/data/ideas/hooks.json` becomes 4 entries:

| id | name | tag | what each idea must do |
| --- | --- | --- | --- |
| `sepolia-deploy` | Sepolia smart contract | onchain logic | Deploy a Solidity contract to Ethereum Sepolia (via MetaMask private key), verify it on Etherscan. |
| `ipfs-pinata` | IPFS via Pinata | decentralized storage | Pin generated artefacts (images, JSON, manifests) to IPFS via Pinata JWT, store CID onchain or in app. |
| `privy-social` | Privy social + sponsored tx | wallet UX | Privy App ID for Google sign-in; sponsored transactions so users don't see gas. |
| `nft-provenance` | NFT provenance | onchain authorship | ERC-721 mint on Sepolia that records creator + IPFS CID; verified on Etherscan. |

Each of the 100 ideas per theme is distributed: 25 ideas per primitive × 10 themes = 1000. Same `Idea` TypeScript shape (`quantumHook`/`quantumHookId`/`quantumTag`/`quantumRationale` are reused as `chainHook`/etc. — see Technical Notes).

### 2. Mega-prompt template (every one of 1000 prompts)

Every regenerated mega-prompt ends with a fixed **"Required secrets & setup"** appendix plus the **hackathon credit**, so anyone who copies it into Lovable knows exactly what to paste and what to credit. The appendix tells the user to add these secrets in Lovable (Project Settings → Secrets):

- `METAMASK_PRIVATE_KEY` — MetaMask account exported private key, funded on Sepolia via `https://cloud.google.com/application/web3/faucet/ethereum/sepolia`
- `ETHERSCAN_API_KEY` — for `npx hardhat verify` after deploy
- `PRIVY_APP_ID` — from Privy dashboard; enables Google sign-in + sponsored tx (`https://docs.privy.io/llms-full.txt`)
- `PINATA_JWT` — from Pinata dashboard; used to pin files to IPFS (`https://docs.pinata.cloud/llms-full.txt`)
- Optional: `SEPOLIA_RPC_URL` (defaults to a public RPC if absent)

Each prompt also instructs: every deployed Solidity contract MUST include this as a leading SPDX/NatSpec comment:

```
/// @notice Built during the Creative AI & Quantum Hackathon
/// @notice organised by StreetKode Fam during Indian Krump Festival 14
```

The same credit line appears as the closing line of every mega-prompt body (so non-Solidity ideas still carry it).

### 3. Regeneration via AISA API

Add a build-time script `scripts/regenerate-ideas.ts` (Node, run manually, NOT shipped to runtime) that:

1. Loads `src/data/ideas/themes.json` + the 4 new hooks.
2. For each theme × hook × 25 ideas, calls `https://api.aisa.one/v1/chat/completions` (OpenAI-compatible, `Bearer $AISA_API_KEY`, model `qwen3.7-max` or whichever AISA default), prompting:
   - "You're designing idea N for `<theme.name>` using primitive `<hook.name>`. Output strict JSON `{ title, subDiscipline, pitch, chainRationale }`. The pitch must be 1 short sentence on the user value."
3. Wraps the AI output in the deterministic mega-prompt template (Solidity scaffold for `sepolia-deploy` / `nft-provenance`; Pinata upload scaffold for `ipfs-pinata`; Privy `useLogin` scaffold for `privy-social`) and appends the fixed Secrets + Credit footer.
4. Writes the rebuilt `src/data/ideas/<theme>.json` files (100 ideas each, deterministic id `"<theme>-<slug(title)>-N"`).
5. Concurrency capped at 5; 1s delay between batches; resumable via on-disk checkpoint so a rerun skips completed ideas.

Run: `AISA_API_KEY=… bun run scripts/regenerate-ideas.ts`. The script is one-shot; committed JSON is what the app reads — no runtime AI calls.

### 4. Rebrand pass (UI strings only — Editorial Folio Noir aesthetic stays)

Search-replace across copy + route metadata:

- `Creative Quantum` → `Creative Blockchain`
- `quantum` (in copy) → `blockchain` / `onchain` where natural
- Home eyebrow: `COLLECTION NO. 04 — 1000 IDEAS` → `COLLECTION NO. 01 — 1000 BLOCKCHAIN IDEAS`
- Lede + manifesto tile rewritten to describe blockchain-native creative tools
- Footer colophon swaps "Quantinuum credit" for the hackathon credit line
- `src/routes/quantum-primer.tsx` → renamed to `src/routes/blockchain-primer.tsx`, content rewritten to explain the 4 primitives + secrets the user will paste into Lovable
- `src/routes/about.tsx` + `src/routes/strategy.tsx` text rewritten; structure unchanged
- `<head>` titles / meta-descriptions / og tags on every route updated
- `public/llms.txt` regenerated for the new brand

### 5. Idea detail page (`src/routes/ideas.$id.tsx`)

- Replace "Quantum hook" block label with "Blockchain primitive"
- Replace `quantumRationale` → `chainRationale`
- Add a **"Required secrets"** bento tile listing the 4 keys with the faucet + docs links
- "Appendix"/mega-prompt block unchanged visually; CopyButton still ships the full prompt
- Keep TAM/SAM/SOM tiles

### 6. Component renames

- `src/components/quantum-chip.tsx` → `src/components/chain-chip.tsx`; visual tokens unchanged (still gold-on-charcoal small-caps). Update all imports.

### 7. Out of scope

- No backend, no Lovable Cloud, no wallet connection in the site itself — the site only **shows** ideas + prompts; users build the actual apps in their own Lovable projects.
- No design-token changes (Noir & Gold + Instrument Serif / Work Sans stay).
- No new routes beyond renaming quantum-primer → blockchain-primer.
- No runtime AISA calls — regeneration is a one-time build script.

### Technical notes

- **Type evolution**: rename fields on `Idea` (`quantumHook` → `chainHook`, etc.) in `src/data/ideas.ts` AND in the regenerated JSON. The TS interface changes once; every consumer (`idea-card`, `ideas.$id`, `themes.$theme`) is updated in the same pass. Old JSON is fully overwritten by the script — no migration shim needed.
- **AISA endpoint**: `POST https://api.aisa.one/v1/chat/completions`, `Authorization: Bearer $AISA_API_KEY`, body `{ model: "qwen3.7-max", messages: [...], response_format: { type: "json_object" } }`. Already added `AISA_API_KEY` to project secrets earlier this session, so the script can read `process.env.AISA_API_KEY`.
- **Mega-prompt determinism**: titles/pitches/rationales come from AISA; the Solidity / Privy / Pinata scaffolds are string templates in the script, not AI-generated, so every prompt for a given primitive shares the same battle-tested code. This guarantees the secrets/credit lines appear verbatim in all 1000 prompts.
- **No `quantum/` python dir** — the old site had Selene/Guppy build-time quantum runs; those are deleted. The new ideas don't need any runtime compute on this site.
- **Hackathon credit redundancy**: appears (a) in every mega-prompt body, (b) in every Solidity scaffold as NatSpec, (c) in the global footer colophon.
