import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { HOOKS, ALL_IDEAS } from "@/data/ideas";

export const Route = createFileRoute("/quantum-primer")({
  head: () => ({
    meta: [
      { title: "Blockchain primer · Creative Blockchain" },
      { name: "description", content: "Four onchain primitives every idea in this repo leans on: Sepolia deploys via MetaMask, IPFS pinning via Pinata, Privy social sign-in, ERC-721 provenance." },
      { property: "og:title", content: "Blockchain primer · Creative Blockchain" },
      { property: "og:description", content: "Four web3 primitives that drive UI features in a Lovable hackathon app." },
    ],
  }),
  component: Primer,
});

const SECRETS_BLURB = [
  { name: "METAMASK_PRIVATE_KEY", note: "Exported from MetaMask. Fund on Sepolia via the Google Cloud faucet.", href: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia" },
  { name: "ETHERSCAN_API_KEY", note: "For npx hardhat verify after deploy.", href: "https://etherscan.io/myapikey" },
  { name: "PRIVY_APP_ID", note: "Google sign-in + sponsored transactions.", href: "https://docs.privy.io/llms-full.txt" },
  { name: "PINATA_JWT", note: "Pin to IPFS.", href: "https://docs.pinata.cloud/llms-full.txt" },
];

function Primer() {
  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10">
        <span className="eyebrow">primer · onchain</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 text-foreground">Four onchain primitives, demystified.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed font-light">
          Every idea in this repo leans on one of four web3 primitives. Each one runs against Ethereum Sepolia
          (a free, real testnet) so you can ship a verifiable demo with zero hosting and zero gas spent by your users.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <div className="p-6 border border-primary/30 bg-card">
          <h2 className="font-display text-2xl text-foreground italic mb-4">The five secrets</h2>
          <p className="text-sm text-muted-foreground mb-4 font-light">
            Add these in your Lovable project (Settings → Secrets) before pasting any mega-prompt:
          </p>
          <ul className="space-y-3 text-sm">
            {SECRETS_BLURB.map((s) => (
              <li key={s.name} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <span className="font-mono text-[12px] text-primary shrink-0">{s.name}</span>
                <span className="text-foreground/80 font-light flex-1">{s.note}</span>
                <a href={s.href} target="_blank" rel="noreferrer" className="story-gold eyebrow text-primary shrink-0">open ↗</a>
              </li>
            ))}
            <li className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 pt-2 border-t border-border">
              <span className="font-mono text-[12px] text-muted-foreground shrink-0">SEPOLIA_RPC_URL</span>
              <span className="text-foreground/60 font-light flex-1">Optional. A public RPC is used if omitted.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20 space-y-4">
        {HOOKS.map((h) => {
          const count = ALL_IDEAS.filter((i) => i.quantumHookId === h.id).length;
          const sample = ALL_IDEAS.filter((i) => i.quantumHookId === h.id).slice(0, 3);
          return (
            <article key={h.id} id={h.id} className="p-6 border border-border bg-card scroll-mt-24">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <div className="eyebrow text-primary">{h.tag}</div>
                  <h2 className="font-display text-2xl mt-1 text-foreground">{h.name}</h2>
                </div>
                <span className="eyebrow text-muted-foreground">{count} ideas use this</span>
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="eyebrow mb-1">kernel</div>
                  <div className="text-foreground/90 font-light leading-relaxed">{h.kernel}</div>
                </div>
                <div>
                  <div className="eyebrow mb-1">how it drives the UI</div>
                  <div className="text-foreground/90 font-light leading-relaxed">{h.ui}</div>
                </div>
              </div>
              {sample.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="eyebrow text-muted-foreground mb-2">EXAMPLE IDEAS</div>
                  <ul className="space-y-1.5">
                    {sample.map((i) => (
                      <li key={i.id}>
                        <Link to="/ideas/$id" params={{ id: i.id }} className="text-sm hover:text-primary font-light">
                          → {i.title} <span className="text-muted-foreground">· {i.theme}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </SiteShell>
  );
}
