import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Build strategy — ship a real Sprites demo in one Lovable build" },
      {
        name: "description",
        content:
          "How to ship a real fly.io Sprites demo in one Lovable build: one token, one paste, a TanStack server function calling api.sprites.dev to create, drop files, run services or exec — no infra.",
      },
      { property: "og:title", content: "Real Sprites in one Lovable build" },
      {
        property: "og:description",
        content: "Build-time pattern for Lovable + fly.io Sprites hackathon entries.",
      },
    ],
  }),
  component: Strategy,
});

const CREATE_SNIPPET = `// src/lib/sprites.functions.ts — spin up a public Sprite
// Built during the Sprites Creative Hackathon — StreetKode Fam · Indian Krump Festival 14
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://api.sprites.dev/v1";
const auth = () => ({ Authorization: \`Bearer \${process.env.SPRITES_TOKEN!}\` });

export const launch = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ name: z.string().min(1).max(48) }).parse(d))
  .handler(async ({ data }) => {
    const r = await fetch(\`\${API}/sprites\`, {
      method: "POST",                        // NOTE: POST-only. PUT returns 404.
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, url_settings: { auth: "public" } }),
    });
    if (!r.ok && r.status !== 409) throw new Error(\`create failed: \${r.status}\`);
    return { url: \`https://\${data.name}.sprites.run\` };
  });`;

const FS_SNIPPET = `// src/lib/sprites.functions.ts — drop an index.html into a live Sprite
export const publish = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ name: z.string(), html: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    // fs/write auto-creates parent dirs. Serve from /root/www — /home/sprite may not exist.
    const w = await fetch(
      \`\${API}/sprites/\${data.name}/fs/write?path=/root/www/index.html&workingDir=/\`,
      { method: "PUT", headers: { ...auth(), "Content-Type": "application/octet-stream" }, body: data.html },
    );
    if (!w.ok) throw new Error(\`fs write failed: \${w.status}\`);
    return { ok: true };
  });`;

const SERVICE_SNIPPET = `// src/lib/sprites.functions.ts — long-running service + warm-poll
export const serve = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ name: z.string() }).parse(d))
  .handler(async ({ data }) => {
    // Reset stale, then PUT the new service. http_port is REQUIRED for wake-on-request.
    await fetch(\`\${API}/sprites/\${data.name}/services/webapp\`, { method: "DELETE", headers: auth() });
    await fetch(\`\${API}/sprites/\${data.name}/services/webapp\`, {
      method: "PUT",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({
        cmd: "python3", args: ["-m", "http.server", "8080"],
        dir: "/root/www", needs: [], http_port: 8080,
      }),
    });
    await fetch(\`\${API}/sprites/\${data.name}/services/webapp/start\`, {
      method: "POST", headers: { ...auth(), Accept: "application/x-ndjson" },
    });
    // Warm-poll so the first user hits a live URL, not a cold-boot 502.
    const url = \`https://\${data.name}.sprites.run\`;
    for (let i = 0; i < 12; i++) {
      try { if ((await fetch(url, { signal: AbortSignal.timeout(4000) })).ok) return { url }; } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }
    return { url };
  });`;

const EXEC_SNIPPET = `// src/lib/sprites.functions.ts — one-shot exec inside a Sprite
export const run = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ name: z.string(), script: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const qs = new URLSearchParams();
    qs.append("cmd", "bash"); qs.append("cmd", "-lc"); qs.append("cmd", data.script);
    const res = await fetch(\`\${API}/sprites/\${data.name}/exec?\${qs}\`, {
      method: "POST",
      headers: auth(),                       // Authorization ONLY. No Accept, or 406.
    });
    const bytes = new Uint8Array(await res.arrayBuffer());
    // Response ends with 0x03 <exitCode>.
    const exit = bytes.length >= 2 && bytes[bytes.length - 2] === 3 ? bytes[bytes.length - 1] : null;
    const end = exit === null ? bytes.length : bytes.length - 2;
    return { stdout: new TextDecoder().decode(bytes.slice(0, end)), exit };
  });`;

const ENV_SNIPPET = `# .env (Lovable -> Project Settings -> Secrets)
SPRITES_TOKEN=<org-slug>/<org-id>/<token-id>/<token-value>   # https://sprites.dev/account

# How Lovable wires this up in one prompt:
# 1. Paste a mega-prompt from this archive.
# 2. Lovable
#    - writes a server function that proxies Sprites (create / fs / service / exec)
#    - wires the client surface (launch button, compose form, console box, etc.)
#    - keeps your token on the server via process.env.SPRITES_TOKEN
# 3. Run it. Your demo is spinning up real fly.io micro-VMs.`;

function Strategy() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <div className="max-w-3xl">
        <div className="eyebrow text-primary mb-4">build strategy · sprites</div>
        <h1 className="font-display text-4xl sm:text-6xl text-foreground italic leading-[1.05] mb-8">
          Real Sprites, <span className="text-primary italic">one token</span>, one build.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-light">
          Every mega-prompt in this archive collapses into the same shape: a single TanStack server
          function calling <code>api.sprites.dev/v1</code> with one secret. It's the only pattern
          that lets a Lovable account ship a working Sprites demo in one shot, inside the 5-credit budget.
        </p>
      </div>

      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="border border-border bg-card p-8">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Why Sprites and not a normal deploy?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-light">
            Sprites are fly.io micro-VMs behind one REST API: create a fresh sandbox in a second,
            drop files into it, run any command or long-running service, hand the user a public URL,
            let it sleep. No CI, no Dockerfile, no Kubernetes — every demo gets its own throwaway
            server on demand.
          </p>
        </div>
        <div className="border border-border bg-card p-8">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Why TanStack server functions?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-light">
            Lovable's TanStack Start template makes secrets trivial. <code>createServerFn</code> runs
            on the server, reads <code>process.env.SPRITES_TOKEN</code>, hits <code>api.sprites.dev</code>,
            and returns typed JSON. The token never reaches the browser, no edge functions or extra
            infra needed.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mb-6">The pattern in code.</h2>

        <div className="space-y-6">
          <div>
            <span className="eyebrow text-primary">src/lib/sprites.functions.ts — create a Sprite</span>
            <pre className="mt-2 border border-border bg-card p-4 sm:p-5 text-[12px] sm:text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
              <code className="text-foreground/85 font-mono">{CREATE_SNIPPET}</code>
            </pre>
          </div>
          <div>
            <span className="eyebrow text-primary">src/lib/sprites.functions.ts — filesystem drop</span>
            <pre className="mt-2 border border-border bg-card p-4 sm:p-5 text-[12px] sm:text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
              <code className="text-foreground/85 font-mono">{FS_SNIPPET}</code>
            </pre>
          </div>
          <div>
            <span className="eyebrow text-primary">src/lib/sprites.functions.ts — long-running service</span>
            <pre className="mt-2 border border-border bg-card p-4 sm:p-5 text-[12px] sm:text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
              <code className="text-foreground/85 font-mono">{SERVICE_SNIPPET}</code>
            </pre>
          </div>
          <div>
            <span className="eyebrow text-primary">src/lib/sprites.functions.ts — one-shot exec</span>
            <pre className="mt-2 border border-border bg-card p-4 sm:p-5 text-[12px] sm:text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
              <code className="text-foreground/85 font-mono">{EXEC_SNIPPET}</code>
            </pre>
          </div>
          <div>
            <span className="eyebrow text-primary">.env + Lovable build</span>
            <pre className="mt-2 border border-border bg-card p-4 sm:p-5 text-[12px] sm:text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
              <code className="text-foreground/85 font-mono">{ENV_SNIPPET}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mb-4">Shipping a 5-credit demo</h2>
        <ul className="space-y-2 text-sm text-muted-foreground font-light leading-relaxed">
          <li>· Pick one idea. Paste its mega-prompt. Add <code>SPRITES_TOKEN</code>. That's the whole build.</li>
          <li>· Keep it to ONE route and ONE server function. No auth, no DB, no extra integrations.</li>
          <li>· Pick the right primitive for the demo: create-only launcher, filesystem publisher, long-running service, or exec console.</li>
          <li>· Serve services from <code>/root/www</code> with <code>http_port: 8080</code>. Warm-poll before returning the URL.</li>
          <li>· Never send <code>Accept: application/octet-stream</code> on <code>/exec</code>. Sprites returns 406.</li>
          <li>· Add the footer credit: "Built during the Sprites Creative Hackathon — StreetKode Fam · Indian Krump Festival 14".</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/quantum-primer" className="px-5 py-2.5 bg-primary text-primary-foreground text-[10px] tracking-[0.32em] uppercase font-semibold">
            Sprites primer
          </a>
          <a href="/themes" className="px-5 py-2.5 border border-border text-foreground text-[10px] tracking-[0.32em] uppercase font-semibold hover:border-primary/60">
            Browse 1,000 ideas
          </a>
          <a
            href="https://github.com/arunnadarasa/sprite-sandbox-fun"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 border border-primary/40 text-foreground text-[10px] tracking-[0.32em] uppercase font-semibold hover:border-primary"
          >
            Reference repo ↗
          </a>
        </div>
      </section>
    </div>
  );
}
