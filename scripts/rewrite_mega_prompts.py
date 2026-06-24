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

SECRETS = """REQUIRED SECRET — `ELEVENLABS_API_KEY` (server-side only):
Single key for TTS, voice agents, scribe, music and SFX.

BEST PATH (recommended): use the Lovable ElevenLabs standard connector.
It syncs `ELEVENLABS_API_KEY` into the project automatically and rotates
from the dashboard. In Lovable, just say:
    "Connect the ElevenLabs connector"
and accept the prompt. No copy-pasting keys.

FALLBACK (manual): grab a key from https://elevenlabs.io/app/settings/api-keys
and add it as `ELEVENLABS_API_KEY` in Project Settings -> Secrets. Free tier
is enough for a hackathon weekend.

Either way, read it only on the server (`process.env.ELEVENLABS_API_KEY`
inside a `createServerFn` handler). Never expose it to the client and never
prefix it with `VITE_`."""

BUDGET = """LOVABLE BUDGET (HARD CAP: ONE-SHOT, ~5 CREDITS TOTAL):
The participant has FIVE Lovable credits for the whole build. This prompt MUST
ship a working demo on the FIRST message with zero follow-ups. Engineer for that.
- ONE TanStack Start app, ONE route (`src/routes/index.tsx`). No extra pages, no auth, no nav.
- ONE TanStack server function in `src/lib/*.functions.ts` that proxies ElevenLabs
  and keeps `ELEVENLABS_API_KEY` on the server. No other server fns.
- ONE client surface (a button, a mic, or a prompt box) wired to that server fn.
- NO database, NO Lovable Cloud, NO auth, NO file uploads, NO extra integrations.
- NO tests, NO docs pages, NO settings screens, NO theming toggles.
- Use ONLY libraries already in the template plus, if the kernel requires it,
  a single `bun add @elevenlabs/react`. Nothing else.
- Keep the diff small enough to land in one build pass. If a feature is not on
  screen in the user flow below, do not build it. Cut scope before adding scope."""

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

TTS_BODY = """SERVER FUNCTION (src/lib/tts.functions.ts):
```ts
import {{ createServerFn }} from "@tanstack/react-start";
import {{ z }} from "zod";

/** {CREDIT} */
export const speak = createServerFn({{ method: "POST" }})
  .inputValidator((d) => z.object({{ text: z.string().min(1).max(4000) }}).parse(d))
  .handler(async ({{ data }}) => {{
    const r = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb/stream?output_format=mp3_44100_128",
      {{
        method: "POST",
        headers: {{
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        }},
        body: JSON.stringify({{ text: data.text, model_id: "eleven_turbo_v2_5" }}),
      }},
    );
    if (!r.ok) throw new Error(`TTS failed: ${{r.status}}`);
    const buf = await r.arrayBuffer();
    return {{ audio: Buffer.from(buf).toString("base64") }};
  }});
```

CLIENT (in the page component):
```tsx
import {{ useServerFn }} from "@tanstack/react-start";
import {{ speak }} from "@/lib/tts.functions";

const tts = useServerFn(speak);
const play = async (text: string) => {{
  const {{ audio }} = await tts({{ data: {{ text }} }});
  await new Audio(`data:audio/mpeg;base64,${{audio}}`).play();
}};
```

VOICE: George (`JBFqnCBsd6RMkjVDRZzb`) is the default; swap for any voice id from
https://elevenlabs.io/voice-library. Use `eleven_multilingual_v2` instead of
`eleven_turbo_v2_5` when broadcast quality matters more than first-token latency.
"""

AGENT_BODY = """SERVER FUNCTION (src/lib/agent.functions.ts):
```ts
import {{ createServerFn }} from "@tanstack/react-start";
import {{ z }} from "zod";

/** {CREDIT} */
export const mintAgentToken = createServerFn({{ method: "POST" }})
  .inputValidator((d) => z.object({{ agentId: z.string() }}).parse(d))
  .handler(async ({{ data }}) => {{
    const r = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${{data.agentId}}`,
      {{ headers: {{ "xi-api-key": process.env.ELEVENLABS_API_KEY! }} }},
    );
    const {{ token }} = await r.json();
    return {{ token }};
  }});
```

CLIENT (`bun add @elevenlabs/react` first):
```tsx
import {{ useConversation }} from "@elevenlabs/react";
import {{ useServerFn }} from "@tanstack/react-start";
import {{ mintAgentToken }} from "@/lib/agent.functions";

const c = useConversation();
const getToken = useServerFn(mintAgentToken);

const start = async () => {{
  await navigator.mediaDevices.getUserMedia({{ audio: true }});
  const {{ token }} = await getToken({{ data: {{ agentId: import.meta.env.VITE_AGENT_ID }} }});
  await c.startSession({{ conversationToken: token, connectionType: "webrtc" }});
}};
```

AGENT SETUP: create the agent in https://elevenlabs.io/app/agents, give it a
system prompt fit for the {sub} use case, copy its agent id, and expose it as
`VITE_AGENT_ID` in the project (public env, not a secret).
"""

SCRIBE_BODY = """SERVER FUNCTION (src/lib/scribe.functions.ts):
```ts
import {{ createServerFn }} from "@tanstack/react-start";

/** {CREDIT} */
export const mintScribeToken = createServerFn({{ method: "POST" }}).handler(async () => {{
  const r = await fetch(
    "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe",
    {{ method: "POST", headers: {{ "xi-api-key": process.env.ELEVENLABS_API_KEY! }} }},
  );
  const {{ token }} = await r.json();
  return {{ token }};
}});
```

CLIENT (`bun add @elevenlabs/react` first):
```tsx
import {{ useScribe }} from "@elevenlabs/react";
import {{ useServerFn }} from "@tanstack/react-start";
import {{ mintScribeToken }} from "@/lib/scribe.functions";

const scribe = useScribe({{ modelId: "scribe_v2_realtime", commitStrategy: "vad" }});
const getToken = useServerFn(mintScribeToken);

const start = async () => {{
  const {{ token }} = await getToken();
  await scribe.connect({{
    token,
    microphone: {{ echoCancellation: true, noiseSuppression: true }},
  }});
}};
```

RENDER: show `scribe.partialTranscript` live, and append each
`scribe.committedTranscripts[i].text` to the finalized list as VAD detects the
pause. Perfect for {sub} where the user is speaking the work into the page.
"""

MUSIC_BODY = """SERVER FUNCTION (src/lib/music.functions.ts):
```ts
import {{ createServerFn }} from "@tanstack/react-start";
import {{ z }} from "zod";

/** {CREDIT} */
export const conjureSfx = createServerFn({{ method: "POST" }})
  .inputValidator((d) => z.object({{
    prompt: z.string().min(1),
    seconds: z.number().min(0.5).max(22).optional(),
    kind: z.enum(["sfx", "music"]).default("sfx"),
  }}).parse(d))
  .handler(async ({{ data }}) => {{
    const endpoint = data.kind === "music"
      ? "https://api.elevenlabs.io/v1/music"
      : "https://api.elevenlabs.io/v1/sound-generation";
    const body = data.kind === "music"
      ? {{ prompt: data.prompt, duration_seconds: data.seconds ?? 30 }}
      : {{ text: data.prompt, duration_seconds: data.seconds ?? 5, prompt_influence: 0.3 }};
    const r = await fetch(endpoint, {{
      method: "POST",
      headers: {{ "xi-api-key": process.env.ELEVENLABS_API_KEY!, "Content-Type": "application/json" }},
      body: JSON.stringify(body),
    }});
    const buf = await r.arrayBuffer();
    return {{ audio: Buffer.from(buf).toString("base64") }};
  }});
```

CLIENT:
```tsx
const conjure = useServerFn(conjureSfx);
const play = async (prompt: string, kind: "sfx" | "music" = "sfx") => {{
  const {{ audio }} = await conjure({{ data: {{ prompt, kind }} }});
  await new Audio(`data:audio/mpeg;base64,${{audio}}`).play();
}};
```

TIP: the music endpoint uses `prompt`, the SFX endpoint uses `text` — the
server fn above already maps them. Keep SFX under 22 seconds; cap music at ~30s
for the demo so generation finishes inside the pitch slot.
"""

BODIES = {
    "tts-narration": TTS_BODY,
    "voice-agent": AGENT_BODY,
    "realtime-stt": SCRIBE_BODY,
    "music-sfx": MUSIC_BODY,
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
    body = BODIES[hid].format(CREDIT=CREDIT, sub=sub)

    return f"""Build "{title}" as a ONE-SHOT Lovable build. The participant has only
5 credits — this single message must produce a working demo with no follow-ups.
Single-page TanStack Start app. Cut scope ruthlessly.

CONCEPT
{pitch}
Discipline: {theme['name']} ({sub}).
Voice primitive: {hook['name']} ({hook['tag']}).
Why this primitive: {rationale}

{BUDGET}

STACK
- TanStack Start app (the index route).
- All ElevenLabs calls go through a `createServerFn` so the API key stays on the server.
- Client surface fits the kernel: a `<button>` for TTS / music / SFX, a mic for agents, a live caption strip for scribe.
- Tailwind + shadcn for the UI. Keep it editorial: gold accent on a dark or warm-cream background, generous type.
- Footer renders: "{CREDIT}"

{body}

USER FLOW (the entire app — nothing else exists)
1. Land on page; the headline previews what the demo does for {sub}.
2. The primary action ({hook['ui']}) is one tap away; the rest of the layout supports it.
3. After the audio plays / the conversation ends / the transcript commits, the result stays on screen and can be retried or shared.

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
