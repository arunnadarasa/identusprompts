import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PrivyRoot } from "@/components/privy-root";
import { usePrivyChoreo } from "@/components/privy-client-entry";
import contractCfg from "@/data/contract.json";
import { createPublicClient, http, parseAbiItem, type Log } from "viem";
import { sepolia } from "viem/chains";

export const Route = createFileRoute("/showcase/choreo-ledger")({
  head: () => ({
    meta: [
      { title: "Choreo Ledger — Showcase" },
      { name: "description", content: "Timestamp choreography on Sepolia. Social login, no wallet setup." },
      { property: "og:title", content: "Choreo Ledger — Live on Sepolia" },
      { property: "og:description", content: "Timestamp choreography on Sepolia. Social login, no wallet setup." },
    ],
  }),
  component: () => (
    <PrivyRoot>
      <ChoreoLedgerDemo />
    </PrivyRoot>
  ),
});

const EVENT = parseAbiItem("event Logged(address indexed author, string cid, uint256 at)");

type Entry = { author: string; cid: string; at: bigint; tx: string };

function ChoreoLedgerDemo() {
  const { ready, authenticated, address, login, logout, logCid } = usePrivyChoreo();
  const [cid, setCid] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<Entry[]>([]);

  useEffect(() => {
    const client = createPublicClient({ chain: sepolia, transport: http() });
    let cancel = false;
    (async () => {
      try {
        const head = await client.getBlockNumber();
        const fromBlock = head - 9000n > 0n ? head - 9000n : 0n;
        const logs = await client.getLogs({
          address: contractCfg.address as `0x${string}`,
          event: EVENT,
          fromBlock,
          toBlock: "latest",
        });
        if (cancel) return;
        const items = logs
          .map((l: Log & { args?: { author?: string; cid?: string; at?: bigint } }) => ({
            author: l.args?.author ?? "",
            cid: l.args?.cid ?? "",
            at: l.args?.at ?? 0n,
            tx: l.transactionHash ?? "",
          }))
          .reverse();
        setFeed(items);
      } catch (e) {
        console.warn("event fetch", e);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [lastTx]);

  const submit = async () => {
    setError(null);
    setLastTx(null);
    const v = cid.trim();
    if (!v) {
      setError("Enter a CID, hash, or short title.");
      return;
    }
    setBusy(true);
    try {
      const hash = await logCid(v);
      setLastTx(hash);
      setCid("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      <span className="eyebrow">Demo · Live on Sepolia</span>
      <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
        Choreo <span className="italic text-primary">Ledger</span>
      </h1>
      <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
        Sign in with Google. We mint you an embedded wallet, sponsor the gas, and emit a permanent{" "}
        <code className="text-foreground">Logged(address, cid, at)</code> event on the Sepolia testnet.
      </p>

      <div className="mt-3 font-mono text-[11px] text-muted-foreground/70 break-all">
        Contract:{" "}
        <a
          href={`${contractCfg.explorer}/address/${contractCfg.address}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          {contractCfg.address}
        </a>
      </div>

      <div className="mt-10 p-6 sm:p-8 border border-border bg-card">
        {!ready ? (
          <div className="text-sm text-muted-foreground">Initialising wallet…</div>
        ) : !authenticated ? (
          <div>
            <h2 className="font-display text-2xl">Step 1 — Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No MetaMask required. Google or email; we create your wallet behind the scenes.
            </p>
            <button
              onClick={login}
              className="mt-5 px-6 py-3 bg-primary text-primary-foreground text-[11px] tracking-[0.28em] uppercase font-semibold hover:bg-foreground transition-colors duration-500"
            >
              Sign in
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono text-xs text-muted-foreground break-all">
                Signed in as {address ?? "…"}
              </div>
              <button
                onClick={logout}
                className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground hover:text-primary transition-colors"
              >
                Sign out
              </button>
            </div>

            <label className="block mt-6 eyebrow">Choreography CID / hash / title</label>
            <input
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              placeholder="bafybeigdyrzt5sfp7udm7… or 'kf14-cypher-01'"
              className="mt-2 w-full px-4 py-3 bg-background border border-border focus:border-primary outline-none font-mono text-sm"
            />

            <button
              onClick={submit}
              disabled={busy}
              className="mt-4 px-6 py-3 bg-primary text-primary-foreground text-[11px] tracking-[0.28em] uppercase font-semibold disabled:opacity-50 hover:bg-foreground transition-colors duration-500"
            >
              {busy ? "Logging on chain…" : "Log on Sepolia"}
            </button>

            {error && <div className="mt-4 text-sm text-destructive">{error}</div>}
            {lastTx && (
              <div className="mt-4 text-sm">
                Logged ·{" "}
                <a
                  className="text-primary hover:underline font-mono"
                  href={`${contractCfg.explorer}/tx/${lastTx}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {lastTx.slice(0, 10)}…{lastTx.slice(-8)} ↗
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl">Live ledger</h2>
        <p className="mt-1 text-xs text-muted-foreground tracking-[0.18em] uppercase">
          Last ~9000 blocks · refreshes after each log
        </p>
        <div className="mt-6 border border-border divide-y divide-border">
          {feed.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No entries yet. Be the first.</div>
          ) : (
            feed.map((e) => (
              <div key={e.tx} className="p-4 sm:p-5 grid sm:grid-cols-[140px_1fr_auto] gap-2 sm:gap-4 items-baseline">
                <div className="font-mono text-[11px] text-muted-foreground">
                  {new Date(Number(e.at) * 1000).toISOString().slice(0, 16).replace("T", " ")}
                </div>
                <div className="font-mono text-sm break-all">{e.cid}</div>
                <a
                  href={`${contractCfg.explorer}/tx/${e.tx}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] tracking-[0.28em] uppercase text-primary hover:underline"
                >
                  tx ↗
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
