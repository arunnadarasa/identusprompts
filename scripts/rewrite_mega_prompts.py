#!/usr/bin/env python3
"""Re-stamp every idea with an ElevenLabs-flavored mega-prompt.

- Remaps the legacy onchain `quantumHookId` to one of the four ElevenLabs
  kernels in hooks.json (tts-narration / voice-agent / realtime-stt / music-sfx).
- Rewrites `quantumHook`, `quantumTag`, `quantumRationale` from the new kernel.
- Replaces `megaPrompt` with a single-message Lovable prompt that builds the
  matching server function + client surface.

No API calls. Idempotent. Keeps title / pitch / subDiscipline / market sizing
intact (titles still carry their original creative-domain flavour; rerun
regenerate_ideas.py with AISA_API_KEY set to refresh those too).
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"
THEMES = json.loads((DATA / "themes.json").read_text())
HOOKS = {h["id"]: h for h in json.loads((DATA / "hooks.json").read_text())}

CREDIT = ("Built during the Creative AI & Quantum Hackathon organised by "
          "StreetKode Fam during Indian Krump Festival 14")

SECRETS = """KEYS — both already provided to participants for free:
1. `LOVABLE_API_KEY` (the AI brain). Auto-injected in every Lovable project.
   Read it only on the server via `process.env.LOVABLE_API_KEY`. Never prefix
   with `VITE_` and never expose to the client.
2. `ELEVENLABS_API_KEY` (the voice). Best path: ask Lovable to connect the
   ElevenLabs standard connector — it syncs the key automatically and rotates
   from the dashboard. Fallback: paste a key from
   https://elevenlabs.io/app/settings/api-keys into Project Settings -> Secrets.
   Read it only on the server, header `xi-api-key`, never prefix with `VITE_`."""

BUDGET = """LOVABLE BUDGET (HARD CAP: ONE-SHOT, ~5 CREDITS TOTAL):
The participant has FIVE Lovable credits for the whole build. This prompt MUST
ship a working demo on the FIRST message with zero follow-ups. Engineer for that.
- ONE TanStack Start app, ONE route (`src/routes/index.tsx`). No extra pages, no auth, no nav.
- TWO TanStack server functions max: one for the Lovable AI call (the brain),
  one for the ElevenLabs call (the voice). Fold them into one if the voice
  primitive does not need server-side text generation.
- ONE client surface (a button, a mic, or a prompt box) wired to those server fns.
- NO database, NO Lovable Cloud, NO auth, NO file uploads, NO extra integrations.
- NO tests, NO docs pages, NO settings screens, NO theming toggles.
- Libraries: template defaults + `ai` + `@ai-sdk/openai-compatible` + `zod`,
  plus (only if the voice kernel needs it) `@elevenlabs/react`. Nothing else.
- Keep the diff small enough to land in one build pass. If a feature is not on
  screen in the user flow below, do not build it. Cut scope before adding scope."""

BRAIN = """BRAIN — Lovable AI Gateway (free for participants, no key prompt needed):
```ts
// src/lib/ai-gateway.server.ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
export function gateway() {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": process.env.LOVABLE_API_KEY!,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}
```
Default model: `google/gemini-3-flash-preview`. Use `generateText` (or
`streamText` for long output) from `ai`. Keep prompts and model calls inside
the server function — never call the gateway from client code."""

TRANSLATE_ON = """TRANSLATION — included by default:
Add a language `<Select>` to the UI (English, Español, Français, Deutsch,
Português, हिंदी, 日本語). Before sending the AI output to ElevenLabs,
ask the gateway to translate it into the chosen language in the same server
function. Then pass the translated text to ElevenLabs with
`model_id: "eleven_multilingual_v2"` so the voice speaks naturally in that
language. Default the select to English so the demo works without a click."""

TRANSLATE_OFF = """TRANSLATION — skip:
This kernel is non-linguistic (audio in or audio out), so do not add a
language selector or a translation pass. Keep the brain-to-voice path direct."""

# ---------------------------------------------------------------------------
# Legacy onchain hook id -> new ElevenLabs kernel id
LEGACY_MAP = {
    "sepolia-deploy": "tts-narration",
    "ipfs-pinata":    "music-sfx",
    "privy-social":   "voice-agent",
    "nft-provenance": "realtime-stt",
}

RATIONALES = {
    "tts-narration": lambda sub, theme: (
        f"Streaming text-to-speech turns every {sub} surface in {theme} into something audible, "
        f"so the user gets a presentation-grade voiceover instead of static text."
    ),
    "voice-agent": lambda sub, theme: (
        f"A conversational ElevenLabs agent fits {sub} because the work is dialogic — "
        f"the user wants to talk to {theme}, not click through a form."
    ),
    "realtime-stt": lambda sub, theme: (
        f"Realtime scribe is the right primitive for {sub}: the user speaks the work into existence "
        f"and {theme} needs the captions to land as the words land."
    ),
    "music-sfx": lambda sub, theme: (
        f"On-demand music + SFX matches {sub} because {theme} lives or dies on the soundbed — "
        f"the demo needs a sound, generated in seconds, not a Freesound library trawl."
    ),
}

# ---------------------------------------------------------------------------
# Per-kernel build snippets (TanStack server fn + client surface)

TTS_BODY = """SERVER FUNCTION (src/lib/coach.functions.ts) — brain + voice in one call:
```ts
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { gateway } from "./ai-gateway.server";

/** {CREDIT} */
export const speakAdvice = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    topic: z.string().min(1).max(500),
    language: z.string().default("English"),
  }).parse(d))
  .handler(async ({ data }) => {
    // 1. BRAIN — Lovable AI writes the answer for the {sub} use case.
    const { text } = await generateText({
      model: gateway()("google/gemini-3-flash-preview"),
      system: `You are an expert helper for {sub}. Answer in ${data.language}. ` +
              `Keep it warm, specific, under 120 words. Markdown is fine but no headings.`,
      prompt: data.topic,
    });

    // 2. VOICE — ElevenLabs reads it back in the chosen language.
    const isEn = data.language === "English";
    const r = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb/stream" +
        "?output_format=mp3_44100_128",
      {
        method: "POST",
        headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: isEn ? "eleven_turbo_v2_5" : "eleven_multilingual_v2",
        }),
      },
    );
    if (!r.ok) throw new Error(`TTS failed: ${r.status}`);
    const buf = await r.arrayBuffer();
    return { text, audio: Buffer.from(buf).toString("base64") };
  });
```

CLIENT (in the page component):
```tsx
import { useServerFn } from "@tanstack/react-start";
import { speakAdvice } from "@/lib/coach.functions";

const ask = useServerFn(speakAdvice);
const onSubmit = async (topic: string, language: string) => {
  const { text, audio } = await ask({ data: { topic, language } });
  // render `text` on screen with react-markdown, then:
  await new Audio(`data:audio/mpeg;base64,${audio}`).play();
};
```

Voice: George (`JBFqnCBsd6RMkjVDRZzb`). Swap from https://elevenlabs.io/voice-library."""

AGENT_BODY = """SERVER FUNCTION (src/lib/agent.functions.ts) — mint a single-use token:
```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** {CREDIT} */
export const mintAgentToken = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ agentId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${data.agentId}`,
      { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! } },
    );
    const { token } = await r.json();
    return { token };
  });
```

CLIENT (`bun add @elevenlabs/react` first):
```tsx
import { useConversation } from "@elevenlabs/react";
import { useServerFn } from "@tanstack/react-start";
import { mintAgentToken } from "@/lib/agent.functions";

const c = useConversation({ onMessage: (m) => console.log(m) });
const getToken = useServerFn(mintAgentToken);

const start = async (language: string) => {
  await navigator.mediaDevices.getUserMedia({ audio: true });
  const { token } = await getToken({ data: { agentId: import.meta.env.VITE_AGENT_ID } });
  await c.startSession({
    conversationToken: token,
    connectionType: "webrtc",
    overrides: { agent: { language } }, // ElevenLabs handles translation in-flight
  });
};
```

AGENT SETUP: create the agent at https://elevenlabs.io/app/agents. Its system
prompt is the BRAIN for this build — write it for the {sub} use case (e.g.
"You are a senior {sub} mentor. Ask one focused question at a time."). Enable
language overrides. Copy the agent id into `VITE_AGENT_ID` (public env)."""

SCRIBE_BODY = """SERVER FUNCTION (src/lib/scribe.functions.ts) — mint a scribe token:
```ts
import { createServerFn } from "@tanstack/react-start";

/** {CREDIT} */
export const mintScribeToken = createServerFn({ method: "POST" }).handler(async () => {
  const r = await fetch(
    "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe",
    { method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! } },
  );
  const { token } = await r.json();
  return { token };
});
```

OPTIONAL BRAIN PASS (src/lib/refine.functions.ts) — Lovable AI shapes the
raw transcript into something useful for {sub}:
```ts
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { gateway } from "./ai-gateway.server";

/** {CREDIT} */
export const refine = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ transcript: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: gateway()("google/gemini-3-flash-preview"),
      system: `Turn the user's spoken {sub} notes into a clean, actionable result.`,
      prompt: data.transcript,
    });
    return { text };
  });
```

CLIENT (`bun add @elevenlabs/react` first):
```tsx
import { useScribe } from "@elevenlabs/react";
const scribe = useScribe({ modelId: "scribe_v2_realtime", commitStrategy: "vad" });
// connect with the minted token, render scribe.partialTranscript live, then
// call refine() with the joined committed transcripts when the user stops.
```"""

MUSIC_BODY = """SERVER FUNCTION (src/lib/score.functions.ts) — brain writes the prompt, voice generates the audio:
```ts
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { gateway } from "./ai-gateway.server";

/** {CREDIT} */
export const score = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    intent: z.string().min(1).max(500),
    kind: z.enum(["sfx", "music"]).default("music"),
  }).parse(d))
  .handler(async ({ data }) => {
    // 1. BRAIN — Lovable AI turns a vague creative intent into a strong
    //    ElevenLabs prompt (genre, mood, instruments, BPM, key, structure).
    const { text: musicPrompt } = await generateText({
      model: gateway()("google/gemini-3-flash-preview"),
      system: `You are a music director for {sub}. Given the user's intent, ` +
              `write a single-paragraph ElevenLabs prompt with genre, mood, ` +
              `instrumentation, BPM, key, and structure. No preamble.`,
      prompt: data.intent,
    });

    // 2. VOICE — ElevenLabs renders the audio.
    const endpoint = data.kind === "music"
      ? "https://api.elevenlabs.io/v1/music"
      : "https://api.elevenlabs.io/v1/sound-generation";
    const body = data.kind === "music"
      ? { prompt: musicPrompt, duration_seconds: 30 }
      : { text: musicPrompt, duration_seconds: 5, prompt_influence: 0.3 };
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const buf = await r.arrayBuffer();
    return { musicPrompt, audio: Buffer.from(buf).toString("base64") };
  });
```

CLIENT: input the creative intent, await `score()`, show the AI-written
`musicPrompt` so the user understands the choice, then play the audio data URI."""

BODIES = {
    "tts-narration": TTS_BODY,
    "voice-agent": AGENT_BODY,
    "realtime-stt": SCRIBE_BODY,
    "music-sfx": MUSIC_BODY,
}

TRANSLATE_BY_HOOK = {
    "tts-narration": TRANSLATE_ON,
    "voice-agent": TRANSLATE_ON,
    "realtime-stt": TRANSLATE_OFF,
    "music-sfx": TRANSLATE_OFF,
}


def remap_kernel(idea: dict) -> str:
    hid = idea.get("quantumHookId") or idea.get("chainHookId") or "tts-narration"
    if hid in HOOKS:
        return hid
    return LEGACY_MAP.get(hid, "tts-narration")


def make_prompt(idea: dict, theme: dict) -> str:
    title = idea["title"]
    pitch = idea["pitch"]
    sub = idea["subDiscipline"]
    hid = remap_kernel(idea)
    hook = HOOKS[hid]
    rationale = idea.get("quantumRationale") or RATIONALES[hid](sub, theme["name"])
    body = BODIES[hid].replace("{CREDIT}", CREDIT).replace("{sub}", sub)
    translate = TRANSLATE_BY_HOOK[hid]

    return f"""Build "{title}" as a ONE-SHOT Lovable build. The participant has only
5 credits — this single message must produce a working demo with no follow-ups.
Single-page TanStack Start app. Cut scope ruthlessly.

CONCEPT
{pitch}
Discipline: {theme['name']} ({sub}).
Recipe: Lovable AI brain + {hook['name']} ({hook['tag']}) as the voice surface.
Why this voice surface: {rationale}

{BUDGET}

STACK
- TanStack Start app, the index route only.
- Lovable AI Gateway (the brain) + ElevenLabs (the voice). All calls live
  inside `createServerFn` handlers so both keys stay on the server.
- Client surface fits the kernel: a prompt box for TTS / music / SFX, a mic
  for agents, a live caption strip for scribe. Render markdown from the brain
  with `react-markdown` if you show the text on screen.
- Tailwind + shadcn. Editorial look: gold accent on a dark or warm-cream
  background, generous type, one strong headline, one primary action.
- Footer renders: "{CREDIT}".

{BRAIN}

{body}

{translate}

USER FLOW (the entire app — nothing else exists)
1. Land on the page; the headline previews what the demo does for {sub}.
2. The primary action ({hook['ui']}) is one tap away; the rest of the layout supports it.
3. Lovable AI does the thinking, ElevenLabs handles the voice surface, and the
   result (audio + any text) stays on screen so the user can retry or share.

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
            hid = remap_kernel(idea)
            hook = HOOKS[hid]
            idea["quantumHookId"] = hid
            idea["quantumHook"] = hook["name"]
            idea["quantumTag"] = hook["tag"]
            if not idea.get("quantumRationale") or any(
                w in idea["quantumRationale"] for w in
                ("Sepolia", "smart contract", "blockchain", "onchain", "NFT", "IPFS", "Pinata", "Privy", "MetaMask")
            ):
                idea["quantumRationale"] = RATIONALES[hid](idea["subDiscipline"], t["name"])
            idea["megaPrompt"] = make_prompt(idea, t)
            total += 1
        p.write_text(json.dumps(doc, indent=2, ensure_ascii=False))
        print(f"  {t['slug']}: {len(doc['ideas'])} prompts rewritten")
    print(f"total: {total}")


if __name__ == "__main__":
    main()
