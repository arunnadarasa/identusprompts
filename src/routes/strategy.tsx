import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CopyButton } from "@/components/copy-button";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Build strategy — verifiable onchain demos in one Lovable build" },
      { name: "description", content: "How to ship a Sepolia-verified web3 demo in a single Lovable build: five secrets, one paste, contract live on Etherscan, assets pinned on IPFS, sign-in via Privy." },
      { property: "og:title", content: "Real onchain in one Lovable build" },
      { property: "og:description", content: "Build-time pattern for Lovable + Ethereum Sepolia hackathon entries." },
    ],
  }),
  component: StrategyPage,
});

const CONTRACT_SNIPPET = `// contracts/Provenance.sol — every contract carries the hackathon credit in NatSpec
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Provenance
/// @notice Built during the Creative AI & Quantum Hackathon
/// @notice organised by StreetKode Fam during Indian Krump Festival 14
contract Provenance {
    event Logged(address indexed author, string cid, uint256 at);

    function log(string calldata cid) external {
        emit Logged(msg.sender, cid, block.timestamp);
    }
}
`;

const DEPLOY_SNIPPET = `// scripts/deploy.ts — reads METAMASK_PRIVATE_KEY + ETHERSCAN_API_KEY from process.env
import { ethers, run } from "hardhat";

async function main() {
  const F = await ethers.getContractFactory("Provenance");
  const c = await F.deploy();
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log("deployed:", addr);

  // verify on Etherscan
  await run("verify:verify", { address: addr, constructorArguments: [] });
}
main();
`;

const PINATA_SNIPPET = `// src/lib/pinata.ts — pin a Blob to IPFS via Pinata JWT
export async function pinToIPFS(file: Blob, name = "artifact") {
  const fd = new FormData();
  fd.append("file", file, name);
  const r = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: \`Bearer \${process.env.PINATA_JWT}\` },
    body: fd,
  });
  const { IpfsHash } = await r.json();
  return IpfsHash as string; // the CID
}
`;

const PRIVY_SNIPPET = `// src/main.tsx — Privy social login + sponsored transactions
import { PrivyProvider } from "@privy-io/react-auth";

<PrivyProvider
  appId={import.meta.env.VITE_PRIVY_APP_ID}
  config={{
    loginMethods: ["google", "email"],
    embeddedWallets: { createOnLogin: "users-without-wallets" },
    defaultChain: { id: 11155111, name: "Sepolia" },
  }}
>
  <App />
</PrivyProvider>
`;

const RECIPE = `# 1. In your Lovable project, add five secrets (Settings -> Secrets):
METAMASK_PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...
PRIVY_APP_ID=...
PINATA_JWT=eyJhbGciOi...
SEPOLIA_RPC_URL=https://...   # optional, a public RPC is used otherwise

# 2. Fund the MetaMask account on Sepolia:
open https://cloud.google.com/application/web3/faucet/ethereum/sepolia

# 3. Copy a mega-prompt from this repo into Lovable. One paste:
#    - scaffolds the React app
#    - writes the Solidity contract (with hackathon credit in NatSpec)
#    - deploys to Sepolia and verifies on Etherscan
#    - wires Privy social login + sponsored tx
#    - pins generated assets to IPFS via Pinata
#    - exposes the contract address + Etherscan link in the UI

# 4. Open the live Etherscan link. Your demo is provably onchain.
`;

function StrategyPage() {
  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-5 pt-14 pb-20">
        <div className="eyebrow text-primary mb-4">build strategy · onchain</div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[0.95] tracking-tight text-foreground">
          Real onchain, <span className="text-primary italic">five secrets</span>, one build.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed font-light">
          Every mega-prompt in this repo uses the same pattern, because it's the
          only pattern that lets a Lovable account ship a verifiable Sepolia demo in one shot.
        </p>

        <section className="mt-10 p-6 border border-primary/30 bg-card">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Why Sepolia and not mainnet?</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-light">
            Sepolia is a real Ethereum testnet — the same EVM, the same Etherscan UI, the same wallets —
            but funded by a free faucet. Every contract you deploy is publicly inspectable, but you
            never spend real ETH and your demo can't accidentally drain a user. Move to mainnet
            after the hackathon by swapping the RPC.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">The recipe</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">recipe</span>
            <CopyButton text={RECIPE} label="Copy recipe" />
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed p-5 border border-border bg-card text-foreground/90">{RECIPE}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">1. The contract — credit baked in</h2>
          <p className="text-sm text-muted-foreground mb-3 font-light">
            Every Solidity file deployed from a Creative Blockchain prompt MUST carry the hackathon credit in NatSpec,
            so provenance lives onchain alongside the bytecode.
          </p>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">contracts/Provenance.sol</span>
            <CopyButton text={CONTRACT_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed p-5 border border-border bg-card text-foreground/90">{CONTRACT_SNIPPET}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">2. Deploy + verify on Etherscan</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">scripts/deploy.ts</span>
            <CopyButton text={DEPLOY_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed p-5 border border-border bg-card text-foreground/90">{DEPLOY_SNIPPET}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">3. Pin assets to IPFS via Pinata</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">src/lib/pinata.ts</span>
            <CopyButton text={PINATA_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed p-5 border border-border bg-card text-foreground/90">{PINATA_SNIPPET}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">4. Sign in with Google via Privy</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">src/main.tsx</span>
            <CopyButton text={PRIVY_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed p-5 border border-border bg-card text-foreground/90">{PRIVY_SNIPPET}</pre>
        </section>

        <section className="mt-10 p-6 border border-border bg-card">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Hackathon rules of thumb</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground font-light">
            <li>· One mega-prompt = one build message. Don't iterate the architecture, iterate the UI.</li>
            <li>· Always show the live Etherscan link in the UI — that's your proof.</li>
            <li>· Use Privy sponsored tx so judges don't need a wallet to try the demo.</li>
            <li>· Pin every user-generated asset to IPFS the moment it's created.</li>
            <li>· Add a "Built during the Creative AI &amp; Quantum Hackathon — StreetKode Fam · Indian Krump Festival 14" line to your footer.</li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/themes" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold hover:bg-foreground transition">
            Pick an idea →
          </Link>
          <Link to="/quantum-primer" className="px-5 py-2.5 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition">
            Blockchain primer
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}
