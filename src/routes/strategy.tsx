import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Build strategy — ship a real AIsa demo in one Lovable build" },
      {
        name: "description",
        content:
          "How to ship a real AIsa demo in one Lovable build: one secret, one paste, a TanStack server function calling AIsa chat / image / video / skills, no infra.",
      },
      { property: "og:title", content: "Real AIsa in one Lovable build" },
      {
        property: "og:description",
        content: "Build-time pattern for Lovable + AIsa hackathon entries.",
      },
    ],
  }),
  component: Strategy,
});

const CHAT_SNIPPET = `// src/lib/aisa.functions.ts — TanStack server function calling AIsa chat completions
// Built during the AIsa Creative Hackathon — StreetKode Fam · Indian Krump Festival 14
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const ask = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ topic: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const r = await fetch("https://api.aisa.one/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.AISA_API_KEY!}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: data.topic }],
      }),
    });
    if (!r.ok) throw new Error(\`AIsa failed: \${r.status}\`);
    const j = await r.json();
    return { reply: j.choices[0].message.content as string };
  });`;

const IMAGE_SNIPPET = `// src/lib/aisa.functions.ts — same key, generate an image
export const render = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ brief: z.string().min(1).max(800) }).parse(d))
  .handler(async ({ data }) => {
    const r = await fetch("https://api.aisa.one/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.AISA_API_KEY!}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "bytedance/seedream-3.0",
        prompt: data.brief,
        size: "1024x1024",
      }),
    });
    if (!r.ok) throw new Error(\`AIsa image failed: \${r.status}\`);
    const j = await r.json();
    return { url: j.data[0].url as string };
  });`;

const ENV_SNIPPET = `# .env (Lovable -> Project Settings -> Secrets)
AISA_API_KEY=sk-aisa-...      # https://console.aisa.one

# How Lovable wires this up in one prompt:
# 1. Paste a mega-prompt from this archive.
# 2. Lovable
#    - writes a server function that proxies AIsa (chat / image / video / skills)
#    - wires the client surface (textarea, prompt-to-canvas, search box, etc.)
#    - keeps your key on the server via process.env.AISA_API_KEY
# 3. Run it. Your demo is calling real AIsa frontier models.`;

function Strategy() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <div className="max-w-3xl">
        <div className="eyebrow text-primary mb-4">build strategy · AIsa</div>
        <h1 className="font-display text-4xl sm:text-6xl text-foreground italic leading-[1.05] mb-8">
          Real AIsa, <span className="text-primary italic">one key</span>, one build.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-light">
          Every mega-prompt in this archive collapses into the same shape: a single TanStack server
          function calling api.aisa.one with one secret. It's the only pattern that lets a Lovable
          account ship a working AIsa demo in one shot, inside the 5-credit budget.
        </p>
      </div>

      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="border border-border bg-card p-8">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Why AIsa and not a single provider?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-light">
            AIsa gives you one OpenAI-compatible endpoint and one API key in front of every frontier
            model — OpenAI, Anthropic, Google, Qwen, DeepSeek for chat; Seedream + GPT image for
            stills; Wan + Seed for video; Tavily, YouTube, scholar and more as Skills. Swap models
            by changing one string, never touch infra.
          </p>
        </div>
        <div className="border border-border bg-card p-8">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Why TanStack server functions?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-light">
            Lovable's TanStack Start template makes secrets trivial. <code>createServerFn</code> runs
            on the server, reads <code>process.env.AISA_API_KEY</code>, hits AIsa, and returns typed
            JSON. The key never reaches the browser, no edge functions or extra infra needed.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl sm:text-3xl text-foreground italic mb-6">The pattern in code.</h2>

        <div className="space-y-6">
          <div>
            <span className="eyebrow text-primary">src/lib/aisa.functions.ts — chat</span>
            <pre className="mt-2 border border-border bg-card p-4 sm:p-5 text-[12px] sm:text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
              <code className="text-foreground/85 font-mono">{CHAT_SNIPPET}</code>
            </pre>
          </div>
          <div>
            <span className="eyebrow text-primary">src/lib/aisa.functions.ts — image</span>
            <pre className="mt-2 border border-border bg-card p-4 sm:p-5 text-[12px] sm:text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
              <code className="text-foreground/85 font-mono">{IMAGE_SNIPPET}</code>
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
          <li>· Pick one idea. Paste its mega-prompt. Add <code>AISA_API_KEY</code>. That's the whole build.</li>
          <li>· Keep it to ONE route and ONE server function. No auth, no DB, no extra integrations.</li>
          <li>· Switch model with one string: <code>openai/gpt-4o-mini</code>, <code>anthropic/claude-3-5-sonnet</code>, <code>google/gemini-2.5-flash</code>, <code>qwen/qwen2.5-72b</code>.</li>
          <li>· Add the footer credit: "Built during the AIsa Creative Hackathon — StreetKode Fam · Indian Krump Festival 14".</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/quantum-primer" className="px-5 py-2.5 bg-primary text-primary-foreground text-[10px] tracking-[0.32em] uppercase font-semibold">
            AIsa primer
          </a>
          <a href="/themes" className="px-5 py-2.5 border border-border text-foreground text-[10px] tracking-[0.32em] uppercase font-semibold hover:border-primary/60">
            Browse 1,000 ideas
          </a>
        </div>
      </section>
    </div>
  );
}
