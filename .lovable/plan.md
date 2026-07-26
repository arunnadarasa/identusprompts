
## Goal

Hackathon participants won't have the internal `fly-sprites` skill, so every one of the 1,000 mega-prompts must carry enough Sprites knowledge to succeed on the first Lovable message. Today each prompt embeds the code snippet + a few primitive-specific gotchas, but assumes the reader already knows what Sprites is, the base URL, the token shape, the URL pattern, and the cross-primitive pitfalls.

## Changes to `scripts/rewrite_mega_prompts.py`

Add two new blocks that get inlined into every generated mega-prompt, then re-run the script to regenerate all 12 theme JSON files (1,000 ideas).

### 1. New `SPRITES_PRIMER` block (inserted right after the `CONCEPT` section)

Compact "assume the reader has never used Sprites" briefing:

- What Sprites are: fly.io micro-sandboxes managed via a REST API at `https://api.sprites.dev/v1`.
- Sign-up path: create an account at https://sprites.dev, generate a token at https://sprites.dev/account.
- Public URL pattern: `https://{name}.sprites.run` (auto-issued for `url_settings.auth: "public"`).
- Docs: https://docs.sprites.dev/ for anything beyond this prompt.
- Sprite name rules: lowercase, digits, hyphens only.
- Auth header: `Authorization: Bearer <SPRITES_TOKEN>`, server-side only.

### 2. New `GOTCHAS` block (inserted right before the `KEY` / secrets section)

Universal pitfalls that apply regardless of primitive, mined from the skill:

- Token must be the 4-part `org-slug/org-id/token-id/token-value` — a raw Fly.io token returns 401.
- `POST /sprites` only — `PUT /sprites/{name}` returns 404.
- Services are PUT-addressed at `/sprites/{name}/services/{service}` — `POST` returns 405.
- `http_port` is REQUIRED on service PUTs, else every request 502s despite "Running".
- Serve from `/root/www` — `/home/sprite` may not exist.
- `/exec`: `Authorization` header only; adding `Accept: application/octet-stream` returns 406. Response stream ends with `0x03 <exitCode>`.
- Cold-boot: warm-poll the public URL before returning it to the user.
- Never call Sprites from the browser — the token is a bearer secret; always go through `createServerFn`.

### 3. Wire both blocks into `make_prompt(...)`

Update the f-string in `make_prompt` so the assembled prompt reads:

```text
CONCEPT
...

SPRITES PRIMER
...

LOVABLE BUDGET
...

STACK
...

<primitive-specific SERVER FUNCTION + CLIENT body>

USER FLOW
...

GOTCHAS (universal — apply to every Sprites call in this build)
...

KEY — only ONE secret is required
...

CREDIT
...
```

### 4. Firm up the "docs link" line

The showcase already links to https://docs.sprites.dev/; the primer block references the same URL so participants can dig deeper without our skill.

## Execution

1. Edit `scripts/rewrite_mega_prompts.py` — add the two constants and update `make_prompt`.
2. Run `python3 scripts/rewrite_mega_prompts.py` to rewrite all 1,000 `megaPrompt` fields across the 12 theme JSONs.
3. Spot-check one idea per primitive (`sprite-create`, `sprite-fs`, `sprite-service`, `sprite-exec`) to confirm the primer + gotchas render correctly.
4. Type-check.

## Out of scope

- Title / pitch / market sizing / rationale — already Sprites-native from the last pivot.
- UI copy on routes — the primer is added inside the mega-prompt payload, not the site copy.
- Any new primitives beyond the four in `hooks.json`.
