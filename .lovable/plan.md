# Creative Blockchain — 1000 Mega-Prompts (5-credit budget)

## Hard budget rule (drives every prompt)

Every mega-prompt must be buildable in **≤5 Lovable credits**. That means:

- **Single-page app**, no routing sprawl, no auth flows beyond Privy's drop-in
- **Minimum viable on-chain surface**: one Solidity contract on **Sepolia** (≤80 lines), one Privy social login, optional Pinata/IPFS only when the idea genuinely needs media/metadata
- **No** Lovable Cloud, no Supabase, no custom backend, no design-system overhauls
- **One AI call max** per user action (via Lovable AI Gateway) when AI is part of the idea
- Prompts cap at ~400 words: 1 paragraph concept, bullet build steps, fixed secrets+credit footer

## 4 Blockchain primitives (replaces quantum hooks)

1. `sepolia-deploy` — single Solidity contract, MetaMask deploy, Etherscan verify
2. `privy-social` — Google sign-in + sponsored tx (always included; it's the auth layer)
3. `ipfs-pinata` — Pinata JWT upload, returns CID stored on-chain (only when the idea needs files/metadata)
4. `nft-provenance` — minimal ERC-721 with tokenURI → IPFS CID

Most prompts combine **privy-social + sepolia-deploy**, with `ipfs-pinata` or `nft-provenance` added only when the theme demands media.

## Fixed appendix (in every prompt)

```
## Required secrets (paste into Lovable → Project → Secrets)
- METAMASK_PRIVATE_KEY  — from MetaMask, fund via https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- ETHERSCAN_API_KEY     — for contract verification
- PRIVY_APP_ID          — Google sign-in + sponsored tx, https://docs.privy.io/llms-full.txt
- PINATA_JWT            — IPFS uploads (only if the app pins media), https://docs.pinata.cloud/llms-full.txt
- SEPOLIA_RPC_URL       — optional, default public RPC works

Every Solidity contract MUST include:
/// @notice Built during the Creative AI & Quantum Hackathon organised by
///         StreetKode Fam during Indian Krump Festival 14
```

Same credit line appears as a one-liner in the prompt body too.

## Regeneration

Python script `scripts/regenerate_ideas.py` calls **AISA** (`https://api.aisa.one/v1/chat/completions`, model `qwen3.7-max`, `response_format: json_object`) with `Bearer $AISA_API_KEY`. For each of 10 themes × 100 ideas:

- Asks AISA for a tight JSON object: `{title, oneLiner, chainHook (1 of 4), primitives[], userFlow[3], contractSketch, promptBody}`
- Wraps `promptBody` with the fixed secrets+credit footer
- Enforces ≤400 words and rejects/regenerates anything mentioning Supabase, Cloud, multi-page routing, or >1 contract
- Concurrency 5, on-disk checkpoint, deterministic IDs `theme-slug-N`
- Writes `src/data/ideas/<theme>.json`

## Rebrand pass

- Site title, hero, nav, footer, `public/llms.txt`, route `<head>` metadata → "Creative Blockchain"
- Rename `quantum-primer.tsx` → `blockchain-primer.tsx`, `quantum-chip.tsx` → `chain-chip.tsx`
- JSON field rename: `quantumHook*` → `chainHook*` (one-pass codemod)
- Idea detail page: "Quantum hook" → "Blockchain primitive", add "Required secrets" bento tile
- Editorial Folio Noir design tokens **unchanged**

## Out of scope

No backend, no Lovable Cloud, no wallet connection on this site, no runtime AISA calls, no design-token changes.
