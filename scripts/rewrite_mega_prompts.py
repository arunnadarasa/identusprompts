#!/usr/bin/env python3
"""Re-stamp every idea with an AIsa-native mega-prompt.

- Remaps the legacy hookId (ElevenLabs / blockchain era) to one of the four
  AIsa kernels in hooks.json (aisa-chat / aisa-image / aisa-video / aisa-skills).
- Rewrites `quantumHook`, `quantumTag`, `quantumRationale` from the new kernel.
- Replaces `megaPrompt` with a single-message Lovable prompt that builds the
  matching TanStack server function + client surface against api.aisa.one.

No API calls. Idempotent. Keeps title / pitch / subDiscipline / market sizing
intact (rerun regenerate_ideas.py with AISA_API_KEY to refresh those too).
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"
THEMES = json.loads((DATA / "themes.json").read_text())
HOOKS = {h["id"]: h for h in json.loads((DATA / "hooks.json").read_text())}

CREDIT = ("Built during the AIsa Creative Hackathon organised by "
          "StreetKode Fam during Indian Krump Festival 14")

SECRETS = """KEY — only ONE secret is required:
1. `AISA_API_KEY`. Sign up at https://console.aisa.one, copy the key into
   Project Settings -> Secrets. Read it only on the server via
   `process.env.AISA_API_KEY`. Never prefix with `VITE_`, never expose
   to the client. A single key unlocks chat, image, video and skills."""

BUDGET = """LOVABLE BUDGET (HARD CAP: ONE-SHOT, ~5 CREDITS TOTAL):
The participant has FIVE Lovable credits for the whole build. This prompt MUST
ship a working demo on the FIRST message with zero follow-ups. Engineer for that.
- ONE TanStack Start app, ONE route (`src/routes/index.tsx`). No extra pages, no auth, no nav.
- ONE TanStack server function in `src/lib/aisa.functions.ts` that proxies the AIsa call.
- ONE client surface (a textarea + button, or chat box, or prompt-to-canvas) wired to it.
- NO database, NO Lovable Cloud, NO auth, NO file uploads, NO extra integrations.
- NO tests, NO docs pages, NO settings screens, NO theming toggles.
- Libraries: template defaults + `zod`. Nothing else.
- Keep the diff small enough to land in one build pass. If a feature is not on
  screen in the user flow below, do not build it. Cut scope before adding scope."""

# ---------------------------------------------------------------------------
# Legacy hook id -> new AIsa kernel id. We split the previous music-sfx bucket
# by theme so motion-heavy disciplines get the video kernel.
LEGACY_MAP_BASE = {
    # blockchain era
    "sepolia-deploy": "aisa-chat",
    "ipfs-pinata":    "aisa-image",
    "privy-social":   "aisa-chat",
    "nft-provenance": "aisa-skills",
    # ElevenLabs era
    "tts-narration":  "aisa-chat",
    "voice-agent":    "aisa-chat",
    "realtime-stt":   "aisa-skills",
    "music-sfx":      "aisa-image",  # overridden for motion themes below
}

VIDEO_THEMES = {"film-animation", "video", "dance"}

def remap_kernel(idea: dict) -> str:
    hid = idea.get("quantumHookId") or "aisa-chat"
    if hid in HOOKS:
        return hid
    base = LEGACY_MAP_BASE.get(hid, "aisa-chat")
    if base == "aisa-image" and idea.get("theme") in VIDEO_THEMES:
        return "aisa-video"
    return base

RATIONALES = {
    "aisa-chat": lambda sub, theme: (
        f"AIsa's LLM router is the brain for {sub} in {theme} — one endpoint, "
        f"any frontier model, so the answer is grounded, fast, and on brand."
    ),
    "aisa-image": lambda sub, theme: (
        f"AIsa Image Generation matches {sub} in {theme} because the work is visual — "
        f"the user types a brief and a finished frame appears in seconds."
    ),
    "aisa-video": lambda sub, theme: (
        f"AIsa Video Generation fits {sub} in {theme} because the work moves — "
        f"a short reel says more than a still image ever could."
    ),
    "aisa-skills": lambda sub, theme: (
        f"AIsa Skills (web / scholar / trends / market data) ground {sub} in {theme} "
        f"with real-world signal so the LLM's output is sourced, not invented."
    ),
}

# ---------------------------------------------------------------------------
# Per-kernel build snippets (TanStack server fn + client surface).

CHAT_BODY = """SERVER FUNCTION (src/lib/aisa.functions.ts) — AIsa chat completions:
```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** {CREDIT} */
export const ask = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ topic: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const r = await fetch("https://api.aisa.one/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AISA_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: `You are an expert helper for {sub}. ` +
              `Reply in friendly markdown, under 180 words, with concrete next steps.` },
          { role: "user", content: data.topic },
        ],
        temperature: 0.7,
      }),
    });
    if (r.status === 402) throw new Error("AIsa balance exhausted — top up at console.aisa.one.");
    if (r.status === 429) throw new Error("AIsa rate limited — try again in a moment.");
    if (!r.ok) throw new Error(`AIsa chat failed: ${r.status}`);
    const j = await r.json();
    return { reply: j.choices[0].message.content as string };
  });
```

CLIENT (in `src/routes/index.tsx`):
```tsx
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ask } from "@/lib/aisa.functions";

const run = useServerFn(ask);
const [topic, setTopic] = useState("");
const [reply, setReply] = useState<string | null>(null);
const [busy, setBusy] = useState(false);

const onAsk = async () => {
  setBusy(true); setReply(null);
  try { const { reply } = await run({ data: { topic } }); setReply(reply); }
  finally { setBusy(false); }
};
```

Swap the model to `anthropic/claude-3-5-sonnet`, `google/gemini-2.5-flash`, or
`qwen/qwen2.5-72b` from https://aisa.one/models — same endpoint, same body."""

IMAGE_BODY = """SERVER FUNCTION (src/lib/aisa.functions.ts) — AIsa image generation:
```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** {CREDIT} */
export const render = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ brief: z.string().min(1).max(1000) }).parse(d))
  .handler(async ({ data }) => {
    const r = await fetch("https://api.aisa.one/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AISA_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "bytedance/seedream-3.0",
        prompt: `Concept art for {sub}: ${data.brief}. Editorial, high detail.`,
        size: "1024x1024",
        n: 1,
      }),
    });
    if (r.status === 402) throw new Error("AIsa balance exhausted — top up at console.aisa.one.");
    if (r.status === 429) throw new Error("AIsa rate limited — try again in a moment.");
    if (!r.ok) throw new Error(`AIsa image failed: ${r.status}`);
    const j = await r.json();
    return { url: j.data[0].url as string };
  });
```

CLIENT: textarea + "Render" button. On success, show `<img src={url} />` and a
download link. Keep one canvas on screen, replace it on the next render.

Other models: `openai/gpt-image-1` (text-fidelity), `bytedance/seedream-3.0`
(default, fast + artistic). Browse https://aisa.one/models for the live list."""

VIDEO_BODY = """SERVER FUNCTION (src/lib/aisa.functions.ts) — AIsa video gen (Wan / Seed):
```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** {CREDIT} */
export const animate = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ brief: z.string().min(1).max(800) }).parse(d))
  .handler(async ({ data }) => {
    // 1. Submit the video task to AIsa Media Gen (async).
    const submit = await fetch("https://api.aisa.one/v1/skills/mediagen", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AISA_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "bytedance/seedance-pro",
        type: "video",
        prompt: `{sub} reel: ${data.brief}. 6 seconds, cinematic.`,
        duration: 6,
      }),
    });
    if (!submit.ok) throw new Error(`AIsa submit failed: ${submit.status}`);
    const { task_id } = await submit.json();

    // 2. Poll until the MP4 URL is ready (AIsa returns ~20-40s).
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const p = await fetch(`https://api.aisa.one/v1/skills/mediagen/${task_id}`, {
        headers: { "Authorization": `Bearer ${process.env.AISA_API_KEY!}` },
      });
      const j = await p.json();
      if (j.status === "succeeded" && j.video_url) return { url: j.video_url as string };
      if (j.status === "failed") throw new Error(`Video failed: ${j.error ?? "unknown"}`);
    }
    throw new Error("Video render timed out.");
  });
```

CLIENT: textarea + "Render reel". While the server fn awaits, show a soft
"Rendering ~30s" pulse. On success, render `<video src={url} controls autoPlay loop />`.

Wan / Seed are async — surface progress; one render at a time keeps it within
the 5-credit budget. See https://aisa.one/docs/agent-skills/mediagen.md."""

SKILLS_BODY = """SERVER FUNCTION (src/lib/aisa.functions.ts) — AIsa Skill + LLM grounding:
```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** {CREDIT} */
export const research = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ query: z.string().min(1).max(400) }).parse(d))
  .handler(async ({ data }) => {
    // 1. SKILL — pull live web/search signal for the topic.
    const sk = await fetch("https://api.aisa.one/v1/skills/aisa-tavily-search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AISA_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: data.query, max_results: 6 }),
    });
    if (sk.status === 402) throw new Error("AIsa balance exhausted — top up at console.aisa.one.");
    if (!sk.ok) throw new Error(`AIsa skill failed: ${sk.status}`);
    const skill = await sk.json();

    // 2. BRAIN — frontier LLM synthesises a grounded answer for {sub}.
    const chat = await fetch("https://api.aisa.one/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AISA_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a research aide for {sub}. ` +
              `Synthesise the supplied sources into a sourced, markdown answer ` +
              `with inline links [Title](url). Be concrete, never invent facts.` },
          { role: "user", content: `Question: ${data.query}\\n\\nSources JSON:\\n${JSON.stringify(skill).slice(0, 6000)}` },
        ],
      }),
    });
    if (!chat.ok) throw new Error(`AIsa chat failed: ${chat.status}`);
    const j = await chat.json();
    return { answer: j.choices[0].message.content as string };
  });
```

CLIENT: search-style input + "Research" button. Render the markdown answer
(react-markdown). Pick the right skill from https://aisa.one/skills — Tavily
search, YouTube SERP, scholar, market data, perplexity research, etc."""

BODIES = {
    "aisa-chat":   CHAT_BODY,
    "aisa-image":  IMAGE_BODY,
    "aisa-video":  VIDEO_BODY,
    "aisa-skills": SKILLS_BODY,
}


def make_prompt(idea: dict, theme: dict) -> str:
    title = idea["title"]
    pitch = idea["pitch"]
    sub = idea["subDiscipline"]
    hid = remap_kernel(idea)
    hook = HOOKS[hid]
    rationale = idea.get("quantumRationale") or RATIONALES[hid](sub, theme["name"])
    body = BODIES[hid].replace("{CREDIT}", CREDIT).replace("{sub}", sub)

    return f"""Build "{title}" as a ONE-SHOT Lovable build. The participant has only
5 credits — this single message must produce a working demo with no follow-ups.
Single-page TanStack Start app. Cut scope ruthlessly.

CONCEPT
{pitch}
Discipline: {theme['name']} ({sub}).
Recipe: {hook['name']} ({hook['tag']}) as the single creative surface.
Why this kernel: {rationale}

{BUDGET}

STACK
- TanStack Start app, the index route only.
- AIsa is the only AI dependency. All API calls live inside a `createServerFn`
  handler so `AISA_API_KEY` stays on the server.
- Client surface fits the kernel: a prompt box that returns the result.
- Tailwind + shadcn. Editorial look: gold accent on a dark or warm-cream
  background, generous type, one strong headline, one primary action.
- Footer renders: "{CREDIT}".

{body}

USER FLOW (the entire app — nothing else exists)
1. Land on the page; the headline previews what the demo does for {sub}.
2. The primary action ({hook['ui']}) is one tap away; the rest of the layout supports it.
3. AIsa runs the kernel server-side, the result lands on screen, the user can retry or copy.

{SECRETS}

CREDIT (must appear in UI footer AND as JSDoc on the server function):
{CREDIT}
"""


def main():
    total = 0
    for t in THEMES:
        p = DATA / f"{t['slug']}.json"
        doc = json.loads(p.read_text())
        for idea in doc["ideas"]:
            idea["theme"] = t["slug"]
            hid = remap_kernel(idea)
            hook = HOOKS[hid]
            idea["quantumHookId"] = hid
            idea["quantumHook"] = hook["name"]
            idea["quantumTag"] = hook["tag"]
            stale_terms = ("Sepolia", "smart contract", "blockchain", "onchain",
                           "NFT", "IPFS", "Pinata", "Privy", "MetaMask",
                           "ElevenLabs", "voice", "Voice", "TTS", "scribe", "Scribe")
            if not idea.get("quantumRationale") or any(w in idea["quantumRationale"] for w in stale_terms):
                idea["quantumRationale"] = RATIONALES[hid](idea["subDiscipline"], t["name"])
            idea["megaPrompt"] = make_prompt(idea, t)
            total += 1
        p.write_text(json.dumps(doc, indent=2, ensure_ascii=False))
        print(f"  {t['slug']}: {len(doc['ideas'])} prompts rewritten")
    print(f"total: {total}")


if __name__ == "__main__":
    main()
