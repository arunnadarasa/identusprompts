import { createFileRoute, Link } from "@tanstack/react-router";
import contractCfg from "@/data/contract.json";

export const Route = createFileRoute("/showcase/")({
  component: ShowcaseIndex,
});

function ShowcaseIndex() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <span className="eyebrow">Showcase · Vol. 01</span>
      <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
        Working <span className="italic text-primary">demos</span>, deployed live.
      </h1>
      <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
        Reference builds from the prompt library. Each demo is a real contract on Ethereum Sepolia
        with social login via Privy — no MetaMask, no faucet, no setup.
      </p>

      <div className="mt-12 grid gap-6">
        <Link
          to="/showcase/choreo-ledger"
          className="group block p-6 sm:p-8 border border-border hover:border-primary/60 transition-colors duration-500"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow text-primary">Dance · Sepolia Deploy</span>
            <span className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Live ↗</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl mt-3 group-hover:text-primary transition-colors">
            Choreo Ledger
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Timestamp original choreography on-chain. Sign in with Google, paste an IPFS CID or a
            move's hash, and emit a permanent <code>Logged</code> event on Sepolia.
          </p>
          <div className="mt-4 font-mono text-[11px] text-muted-foreground/70 break-all">
            {contractCfg.address}
          </div>
        </Link>
      </div>
    </div>
  );
}
