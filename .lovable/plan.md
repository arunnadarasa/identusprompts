# Choreo Ledger live demo (showcase test run)

## What ships

A working Sepolia demo embedded at `/showcase/choreo-ledger`, plus a tiny `/showcase` index that lists future demos.

**Flow**: user lands → Google sign-in via Privy (embedded wallet auto-created) → pastes a choreography title / IPFS CID / hash → clicks "Log on Sepolia" → Privy sends a sponsored tx calling `log(string)` on the deployed contract → UI shows the tx hash + Etherscan link + a live feed of all `Logged` events.

## Contract

`contracts/ChoreoLedger.sol` — single contract, ~30 lines, includes the hackathon NatSpec credit:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/// @title ChoreoLedger
/// @notice Timestamp original choreography on Sepolia.
/// @notice Built during the Creative AI & Quantum Hackathon organised by
///         StreetKode Fam during Indian Krump Festival 14
contract ChoreoLedger {
    event Logged(address indexed author, string cid, uint256 at);
    function log(string calldata cid) external {
        emit Logged(msg.sender, cid, block.timestamp);
    }
}
```

## Deploy pipeline (run once in the sandbox)

1. `bun add -D hardhat @nomicfoundation/hardhat-toolbox` in a sibling `/contracts` workspace (kept out of the Vite bundle).
2. `hardhat.config.ts` reads `METAMASK_PRIVATE_KEY`, `SEPOLIA_RPC_URL` (defaults to `https://ethereum-sepolia-rpc.publicnode.com`), `ETHERSCAN_API_KEY`.
3. `npx hardhat run scripts/deploy.ts --network sepolia` → captures the deployed address.
4. `npx hardhat verify --network sepolia <addr>` → Etherscan verification.
5. Write `{ address, txHash, chainId: 11155111, deployedAt }` to `src/data/contract.json`. Also write `src/data/privy.json` with the `PRIVY_APP_ID` (Privy app IDs are public — safe to commit).

If deploy fails (faucet not topped up, RPC down), I stop and report — no half-baked frontend.

## Frontend

- New route `src/routes/showcase.tsx` (layout with `<Outlet/>`) and `src/routes/showcase.index.tsx` (lists demos).
- New leaf `src/routes/showcase.choreo-ledger.tsx`.
- New `src/components/privy-root.tsx` mounted via `<ClientOnly>` + `lazy()` (per the SSR-safe pattern — Privy crashes workerd if imported at module scope).
- New `src/lib/use-evvm-signer.ts`-style hook OR a simpler `useChoreoLog()` hook that calls `useSendTransaction({ sponsor: true })`.
- Uses `viem` to encode `log(string)` calldata and to read past `Logged` events via `createPublicClient({ chain: sepolia, transport: http() })`.
- Nav: add "Showcase" link in `src/components/site-shell.tsx`.

## Secrets I'll request (in build mode)

| Secret | Purpose | Sensitivity |
|---|---|---|
| `METAMASK_PRIVATE_KEY` | Sepolia deploy (sandbox only, never shipped) | High — burner wallet please |
| `ETHERSCAN_API_KEY` | `npx hardhat verify` | Medium |
| `PRIVY_APP_ID` | Client-side Privy provider | Low (public) |
| `SEPOLIA_RPC_URL` | Optional RPC override | Low |

I'll use `add_secret` to collect them securely (you paste into a form, never the chat). `PRIVY_APP_ID` will also be committed to `src/data/privy.json` so the client can read it without a build-time `VITE_` indirection.

## Budget guard

One single-page demo, one contract, one Privy provider, no DB, no Lovable Cloud, no AI calls, no extra routes beyond the two showcase ones. Aiming well under 5 credits.

## Out of scope

- No IPFS / Pinata (Choreo Ledger only logs the CID string the user provides).
- No mobile-specific tweaks; works in the existing Editorial Folio Noir shell.
- No regeneration of the 1000 prompts.
