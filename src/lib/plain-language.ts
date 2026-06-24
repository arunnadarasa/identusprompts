import type { Idea, Theme } from "@/data/ideas";

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function audienceWord(audience: string): string {
  const first = audience.split(",")[0]?.trim() ?? "users";
  return first.toLowerCase();
}

type Ctx = { sub: string; who: string };

const templates: Record<string, (ctx: Ctx) => string> = {
  "sepolia-deploy": ({ sub, who }) =>
    `${cap(sub)} gets a tiny Solidity contract deployed to Ethereum Sepolia; ${who} see a 'verified onchain' badge with the live contract address and a one-tap Etherscan link.`,
  "ipfs-pinata": ({ sub, who }) =>
    `Every ${sub} artefact is pinned to IPFS through Pinata; ${who} get a permanent CID and a public gateway preview instead of a fragile cloud URL.`,
  "privy-social": ({ sub, who }) =>
    `${cap(who)} sign in with Google through Privy — no seed phrase, no MetaMask popup — and their ${sub} actions are sent as sponsored transactions so they never see gas.`,
  "nft-provenance": ({ sub, who }) =>
    `${cap(who)} mint each ${sub} as an ERC-721 token on Sepolia pointing at an IPFS CID, so authorship and timestamp are provable from a single Etherscan link.`,
};

export function getPlainProposition(idea: Idea, theme: Theme): string {
  const ctx: Ctx = {
    sub: idea.subDiscipline,
    who: audienceWord(theme.audience),
  };
  const tmpl = templates[idea.quantumHookId];
  if (tmpl) return tmpl(ctx);
  return `The onchain primitive runs at the right moment in the flow and surfaces a clear, verifiable result that ${ctx.who} can act on without web3 jargon.`;
}
