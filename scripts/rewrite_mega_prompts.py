#!/usr/bin/env python3
"""Re-stamp every idea with a Sprites-native mega-prompt.

- Remaps legacy hookId (AIsa / ElevenLabs / blockchain eras) to one of the four
  Sprites primitives in hooks.json:
    sprite-create  — POST /sprites  (spin up a public micro-VM)
    sprite-fs      — PUT  /fs/write (drop files into the sandbox)
    sprite-service — PUT  /services + /start (long-running wake-on-request)
    sprite-exec    — POST /exec     (one-shot shell command)
- Rewrites `quantumHook`, `quantumTag`, `quantumRationale`, `pitch`.
- Replaces `megaPrompt` with a single-message Lovable prompt that builds the
  matching TanStack server function + client surface against api.sprites.dev.

No API calls. Idempotent. Keeps title / subDiscipline / market sizing intact.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"
THEMES = json.loads((DATA / "themes.json").read_text())
HOOKS = {h["id"]: h for h in json.loads((DATA / "hooks.json").read_text())}

CREDIT = ("Built during the Sprites Creative Hackathon organised by "
          "StreetKode Fam during Indian Krump Festival 14")

SECRETS = """KEY — only ONE secret is required:
1. `SPRITES_TOKEN`. Grab the 4-part token (org-slug/org-id/token-id/token-value)
   from https://sprites.dev/account and paste it into Project Settings ->
   Secrets. Read it only on the server via `process.env.SPRITES_TOKEN`. Never
   prefix with `VITE_`, never expose to the client. This single token unlocks
   create, filesystem, services, and exec on api.sprites.dev."""

BUDGET = """LOVABLE BUDGET (HARD CAP: ONE-SHOT, ~5 CREDITS TOTAL):
The participant has FIVE Lovable credits for the whole build. This prompt MUST
ship a working demo on the FIRST message with zero follow-ups. Engineer for that.
- ONE TanStack Start app, ONE route (`src/routes/index.tsx`). No extra pages, no auth, no nav.
- ONE TanStack server function in `src/lib/sprites.functions.ts` that proxies the Sprites call.
- ONE client surface (a textarea + launch button, or console box, or compose form) wired to it.
- NO database, NO Lovable Cloud, NO auth, NO file uploads to Lovable, NO extra integrations.
- NO tests, NO docs pages, NO settings screens, NO theming toggles.
- Libraries: template defaults + `zod`. Nothing else.
- Keep the diff small enough to land in one build pass. If a feature is not on
  screen in the user flow below, do not build it. Cut scope before adding scope."""

# ---------------------------------------------------------------------------
# Legacy hook id -> new Sprites primitive.
LEGACY_MAP = {
    # AIsa era
    "aisa-chat":   "sprite-create",
    "aisa-image":  "sprite-fs",
    "aisa-video":  "sprite-service",
    "aisa-skills": "sprite-exec",
    # ElevenLabs era
    "tts-narration":  "sprite-create",
    "voice-agent":    "sprite-service",
    "realtime-stt":   "sprite-exec",
    "music-sfx":      "sprite-fs",
    # blockchain era
    "sepolia-deploy": "sprite-create",
    "ipfs-pinata":    "sprite-fs",
    "privy-social":   "sprite-service",
    "nft-provenance": "sprite-exec",
}

def remap_kernel(idea: dict) -> str:
    hid = idea.get("quantumHookId") or "sprite-create"
    if hid in HOOKS:
        return hid
    return LEGACY_MAP.get(hid, "sprite-create")

RATIONALES = {
    "sprite-create": lambda sub, theme: (
        f"Sprite Sandbox fits {sub} in {theme} because every session wants its own "
        f"disposable, shareable canvas — spin one up on demand, hand over the URL, "
        f"tear it down when done."
    ),
    "sprite-fs": lambda sub, theme: (
        f"Filesystem Drop suits {sub} in {theme} because the output is a file the user "
        f"needs to see live — push generated HTML or assets straight into a running sandbox "
        f"and share a URL that renders it immediately."
    ),
    "sprite-service": lambda sub, theme: (
        f"A Long-running Service matches {sub} in {theme} because the experience needs a "
        f"process that keeps running — an HTTP server, a streaming loop, a playback engine — "
        f"waking on the first request and sleeping when idle."
    ),
    "sprite-exec": lambda sub, theme: (
        f"One-shot Exec fits {sub} in {theme} because the user really wants to run a command "
        f"and see stdout — ffmpeg, imagemagick, a python one-liner — inside an isolated micro-VM "
        f"they don't have to set up."
    ),
}

# Rewrites the pitch into a Sprites-native one-liner that keeps the title/theme flavour.
PITCH_TEMPLATES = {
    "sprite-create": lambda title, sub: (
        f"{title} spins up a fresh public Sprite for each session so {sub} gets its own "
        f"shareable sandbox URL in seconds."
    ),
    "sprite-fs": lambda title, sub: (
        f"{title} composes {sub} in the browser, then writes the finished HTML and assets "
        f"straight into a live Sprite so the user opens a real URL."
    ),
    "sprite-service": lambda title, sub: (
        f"{title} boots a long-running service inside a Sprite for {sub} — the process wakes "
        f"on the first visit and streams straight to the user's browser."
    ),
    "sprite-exec": lambda title, sub: (
        f"{title} runs a one-shot shell command inside a Sprite for {sub} and streams the "
        f"stdout back so the user watches the work happen live."
    ),
}

STALE_PITCH_MARKERS = re.compile(
    r"(Lovable AI|AIsa|ElevenLabs|LLM|voice|Voice|scribe|Scribe|TTS|blockchain|"
    r"NFT|Sepolia|IPFS|Pinata|Privy|MetaMask|onchain|smart contract)",
)

STALE_RATIONALE_MARKERS = STALE_PITCH_MARKERS


# ---------------------------------------------------------------------------
# Per-primitive build snippets (TanStack server fn + client surface).

CREATE_BODY = """SERVER FUNCTION (src/lib/sprites.functions.ts) — create a public Sprite:
```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://api.sprites.dev/v1";
const auth = () => ({ Authorization: `Bearer ${process.env.SPRITES_TOKEN!}` });

/** {CREDIT} */
export const launch = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ label: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    // sprite names must be lowercase, hyphens, letters, digits.
    const slug = data.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "sprite";
    const name = `{sub_slug}-${slug}-${Math.random().toString(36).slice(2, 6)}`;

    // 1. Create (idempotent: 409 on repeat is fine).
    const r = await fetch(`${API}/sprites`, {
      method: "POST",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ name, url_settings: { auth: "public" } }),
    });
    if (!r.ok && r.status !== 409) throw new Error(`Sprite create failed: ${r.status} ${await r.text()}`);

    // The response body carries the public URL. Fallback to the conventional pattern if absent.
    const j = (r.ok ? await r.json() : null) as { url?: string; public_url?: string } | null;
    const url = j?.public_url ?? j?.url ?? `https://${name}.sprites.run`;
    return { name, url };
  });
```

CLIENT (in `src/routes/index.tsx`):
```tsx
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { launch } from "@/lib/sprites.functions";

const run = useServerFn(launch);
const [label, setLabel] = useState("");
const [sprite, setSprite] = useState<{ name: string; url: string } | null>(null);
const [busy, setBusy] = useState(false);

const onLaunch = async () => {
  setBusy(true);
  try { setSprite(await run({ data: { label } })); }
  finally { setBusy(false); }
};
```

Show the returned URL as a clickable share link; render an `<iframe>` preview if
the sprite renders a page. Copy-to-clipboard on click."""

FS_BODY = """SERVER FUNCTION (src/lib/sprites.functions.ts) — create a Sprite and drop an index.html:
```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://api.sprites.dev/v1";
const auth = () => ({ Authorization: `Bearer ${process.env.SPRITES_TOKEN!}` });

/** {CREDIT} */
export const publish = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ html: z.string().min(10).max(200_000), slug: z.string().min(1).max(48) }).parse(d))
  .handler(async ({ data }) => {
    const name = `{sub_slug}-${data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${Math.random().toString(36).slice(2, 6)}`;

    // 1. Create the sprite (409 already-exists is fine).
    const c = await fetch(`${API}/sprites`, {
      method: "POST",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ name, url_settings: { auth: "public" } }),
    });
    if (!c.ok && c.status !== 409) throw new Error(`Sprite create failed: ${c.status}`);

    // 2. Write the composed HTML straight into /root/www — parents auto-created.
    const w = await fetch(`${API}/sprites/${name}/fs/write?path=/root/www/index.html&workingDir=/`, {
      method: "PUT",
      headers: { ...auth(), "Content-Type": "application/octet-stream" },
      body: data.html,
    });
    if (!w.ok) throw new Error(`Sprite fs write failed: ${w.status}`);

    // 3. Start a python http.server on port 8080 (wake-on-request).
    await fetch(`${API}/sprites/${name}/services/webapp`, { method: "DELETE", headers: auth() });
    await fetch(`${API}/sprites/${name}/services/webapp`, {
      method: "PUT",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ cmd: "python3", args: ["-m", "http.server", "8080"], dir: "/root/www", needs: [], http_port: 8080 }),
    });
    await fetch(`${API}/sprites/${name}/services/webapp/start`, {
      method: "POST",
      headers: { ...auth(), Accept: "application/x-ndjson" },
    });

    return { name, url: `https://${name}.sprites.run` };
  });
```

CLIENT: compose surface for {sub} (textarea, form, or generator). On submit, POST the finished
HTML to the server fn, then render the returned URL as a live `<iframe>` and a copyable share link.

Serve from `/root/www` — `/home/sprite` may not exist and the service fails to start with
`cd: No such file or directory`. `http_port` is REQUIRED for wake-on-request; without it the
sprite reports Running but every request 502s."""

SERVICE_BODY = """SERVER FUNCTION (src/lib/sprites.functions.ts) — long-running service inside a Sprite:
```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://api.sprites.dev/v1";
const auth = () => ({ Authorization: `Bearer ${process.env.SPRITES_TOKEN!}` });

/** {CREDIT} */
export const boot = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ label: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const slug = data.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "svc";
    const name = `{sub_slug}-${slug}-${Math.random().toString(36).slice(2, 6)}`;

    // 1. Create sprite.
    const c = await fetch(`${API}/sprites`, {
      method: "POST",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ name, url_settings: { auth: "public" } }),
    });
    if (!c.ok && c.status !== 409) throw new Error(`Sprite create failed: ${c.status}`);

    // 2. Drop the payload the service will read.
    const html = `<!doctype html><meta charset="utf-8"><title>${data.label}</title>` +
                 `<body style="font:16px system-ui;padding:2rem"><h1>${data.label}</h1>` +
                 `<p>Long-running Sprite service for {sub}.</p></body>`;
    await fetch(`${API}/sprites/${name}/fs/write?path=/root/www/index.html&workingDir=/`, {
      method: "PUT",
      headers: { ...auth(), "Content-Type": "application/octet-stream" },
      body: html,
    });

    // 3. PUT a named service. http_port is REQUIRED for wake-on-request.
    await fetch(`${API}/sprites/${name}/services/webapp`, { method: "DELETE", headers: auth() });
    await fetch(`${API}/sprites/${name}/services/webapp`, {
      method: "PUT",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ cmd: "python3", args: ["-m", "http.server", "8080"], dir: "/root/www", needs: [], http_port: 8080 }),
    });

    // 4. Start (NDJSON stream — parse for error/exit events if you need them).
    await fetch(`${API}/sprites/${name}/services/webapp/start`, {
      method: "POST",
      headers: { ...auth(), Accept: "application/x-ndjson" },
    });

    // 5. Warm-poll the URL so the user gets a live URL, not a cold-boot 502.
    const url = `https://${name}.sprites.run`;
    for (let i = 0; i < 12; i++) {
      try {
        const p = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (p.ok) return { name, url };
      } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }
    return { name, url };
  });
```

CLIENT: "Boot service" button. On success render an `<iframe src={url}>` and a share link.
Reset button DELETEs and re-PUTs the service if the user wants a fresh boot.

Swap the cmd/args for the service that fits {sub} — ffmpeg loop, node websocket relay,
static site behind /root/www, etc. Keep `dir: "/root/www"` and `http_port: 8080`."""

EXEC_BODY = """SERVER FUNCTION (src/lib/sprites.functions.ts) — one-shot exec inside a Sprite:
```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://api.sprites.dev/v1";
const auth = () => ({ Authorization: `Bearer ${process.env.SPRITES_TOKEN!}` });

/** {CREDIT} */
export const run = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ script: z.string().min(1).max(4000) }).parse(d))
  .handler(async ({ data }) => {
    // Reuse a single sprite per session so exec is fast; create-if-missing.
    const name = `{sub_slug}-console`;
    await fetch(`${API}/sprites`, {
      method: "POST",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ name, url_settings: { auth: "public" } }),
    });

    // POST /exec with repeated ?cmd= params — Authorization ONLY, no Accept header.
    const qs = new URLSearchParams();
    qs.append("cmd", "bash");
    qs.append("cmd", "-lc");
    qs.append("cmd", data.script);

    const res = await fetch(`${API}/sprites/${name}/exec?${qs}`, {
      method: "POST",
      headers: auth(),
    });
    if (!res.ok) throw new Error(`Sprite exec failed: ${res.status}`);

    // Response stream ends with 0x03 <exitCode>.
    const bytes = new Uint8Array(await res.arrayBuffer());
    let exit: number | null = null;
    let end = bytes.length;
    if (bytes.length >= 2 && bytes[bytes.length - 2] === 3) {
      exit = bytes[bytes.length - 1];
      end = bytes.length - 2;
    }
    return { stdout: new TextDecoder().decode(bytes.slice(0, end)), exit };
  });
```

CLIENT: script textarea prefilled with a {sub}-appropriate one-liner + "Run". Render stdout
in a monospace pre with the exit code chip.

Do NOT add `Accept: application/octet-stream` on /exec — Sprites returns 406.
Do NOT create the sprite via PUT — it returns 404. Only POST /sprites creates."""

BODIES = {
    "sprite-create":  CREATE_BODY,
    "sprite-fs":      FS_BODY,
    "sprite-service": SERVICE_BODY,
    "sprite-exec":    EXEC_BODY,
}


def sub_slug(sub: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", sub.lower()).strip("-")
    return (s or "sprite")[:24]


def make_prompt(idea: dict, theme: dict) -> str:
    title = idea["title"]
    pitch = idea["pitch"]
    sub = idea["subDiscipline"]
    hid = remap_kernel(idea)
    hook = HOOKS[hid]
    rationale = idea.get("quantumRationale") or RATIONALES[hid](sub, theme["name"])
    body = (BODIES[hid]
            .replace("{CREDIT}", CREDIT)
            .replace("{sub_slug}", sub_slug(sub))
            .replace("{sub}", sub))

    return f"""Build "{title}" as a ONE-SHOT Lovable build. The participant has only
5 credits — this single message must produce a working demo with no follow-ups.
Single-page TanStack Start app. Cut scope ruthlessly.

CONCEPT
{pitch}
Discipline: {theme['name']} ({sub}).
Recipe: {hook['name']} ({hook['tag']}) as the single Sprites primitive.
Why Sprites: {rationale}

{BUDGET}

STACK
- TanStack Start app, the index route only.
- fly.io Sprites (api.sprites.dev/v1) is the only backend. All calls live inside a
  `createServerFn` handler so `SPRITES_TOKEN` stays on the server.
- Client surface fits the primitive: a form/prompt that returns the sprite URL or stdout.
- Tailwind + shadcn. Editorial look: gold accent on a dark or warm-cream
  background, generous type, one strong headline, one primary action.
- Footer renders: "{CREDIT}".

{body}

USER FLOW (the entire app — nothing else exists)
1. Land on the page; the headline previews what the sandbox does for {sub}.
2. The primary action ({hook['ui']}) is one tap away; the rest of the layout supports it.
3. Sprites runs the primitive server-side, the URL or stdout lands on screen, the user
   can share, retry, or copy.

{SECRETS}

CREDIT (must appear in UI footer AND as JSDoc on the server function):
{CREDIT}
"""


def rewrite_pitch(idea: dict) -> str:
    hid = remap_kernel(idea)
    existing = (idea.get("pitch") or "").strip()
    if existing and not STALE_PITCH_MARKERS.search(existing):
        return existing
    return PITCH_TEMPLATES[hid](idea["title"], idea["subDiscipline"])


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
            existing_rat = idea.get("quantumRationale") or ""
            if not existing_rat or STALE_RATIONALE_MARKERS.search(existing_rat):
                idea["quantumRationale"] = RATIONALES[hid](idea["subDiscipline"], t["name"])
            idea["pitch"] = rewrite_pitch(idea)
            idea["megaPrompt"] = make_prompt(idea, t)
            total += 1
        p.write_text(json.dumps(doc, indent=2, ensure_ascii=False))
        print(f"  {t['slug']}: {len(doc['ideas'])} prompts rewritten")
    print(f"total: {total}")


if __name__ == "__main__":
    main()
