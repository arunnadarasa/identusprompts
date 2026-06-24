#!/usr/bin/env python3
"""Regenerate all 1000 Creative AI hackathon ideas via the AISA API.

Run:  AISA_API_KEY=... python3 scripts/regenerate_ideas.py

Calls AISA (OpenAI-compatible) in batches: 1 call per (theme x hook) producing 25 ideas each.
10 themes * 4 hooks = 40 calls. Concurrency = 5. Each batch is anchored to one of the
four ElevenLabs primitives in hooks.json (TTS, voice agent, scribe, music/SFX).

Writes back to src/data/ideas/<theme>.json (overwrites). Skips already-completed (theme, hook)
batches if a checkpoint exists at scripts/.regen-checkpoint.json so reruns resume.

IMPORTANT: delete scripts/.regen-checkpoint.json before running after pivoting kernels,
otherwise this resumes against cached blockchain-flavored ideas.
"""
import json, os, re, sys, time, pathlib, traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"
CKPT = pathlib.Path(__file__).parent / ".regen-checkpoint.json"

AISA_URL = "https://api.aisa.one/v1/chat/completions"
AISA_KEY = os.environ.get("AISA_API_KEY")
AISA_MODEL = os.environ.get("AISA_MODEL", "qwen3.7-max")

AISA_ONLY = os.environ.get("AISA_ONLY", "1") != "0"
LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions"
LOVABLE_KEY = None if AISA_ONLY else os.environ.get("LOVABLE_API_KEY")
LOVABLE_MODEL = "google/gemini-3-flash-preview"

if not AISA_KEY and not LOVABLE_KEY:
    print("ERROR: need AISA_API_KEY (AISA_ONLY mode) or LOVABLE_API_KEY", file=sys.stderr); sys.exit(1)

THEMES = json.loads((DATA / "themes.json").read_text())
HOOKS = json.loads((DATA / "hooks.json").read_text())

CREDIT = "Built during the Creative AI & Quantum Hackathon organised by StreetKode Fam during Indian Krump Festival 14"

# ----------------------------------------------------------------------------- mega-prompt template

# ----------------------------------------------------------------------------- AISA call

def slug(s: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")[:48] or "idea"

def call_aisa(theme: dict, hook: dict, batch_idx: int, retries: int = 6) -> list:
    prompt = f"""You are designing 25 distinct hackathon project ideas for the discipline "{theme['name']}"
(audience: {theme['audience']}; market: {theme['market_anchor']}).

EVERY idea must be built around this single ElevenLabs voice primitive:
  {hook['name']} — {hook['kernel']}

The idea must put that primitive at the centre of the user experience. No blockchain, no NFTs,
no wallets, no smart contracts — this is a voice + audio app.

For each of the 25 ideas, output:
- title: 2-4 words, evocative, voice/audio flavoured (e.g. "Spoken Storyboard", "Live Caption Stage"), NOT generic
- subDiscipline: short noun phrase naming the creative sub-area (e.g. "live-set sampling", "color study")
- pitch: ONE short sentence (max 22 words) describing the user value in plain language
- chainRationale: one short sentence explaining why THIS voice primitive (not another) fits this idea
- tam, sam, som: each is a string "{{$X}} — {{one-line context}}" (e.g. "$5B — global dance studio software")

Return STRICT JSON: {{ "ideas": [ {{title, subDiscipline, pitch, chainRationale, tam, sam, som}} x25 ] }}.
No markdown, no commentary. All 25 ideas must be meaningfully different from each other."""

    # try AISA first, then fall back to Lovable AI Gateway if AISA fails (e.g. 402 balance)
    providers = []
    if AISA_KEY:
        providers.append(("AISA", AISA_URL, AISA_KEY, AISA_MODEL))
    if LOVABLE_KEY:
        providers.append(("LOVABLE", LOVABLE_URL, LOVABLE_KEY, LOVABLE_MODEL))

    last_err = None
    for attempt in range(retries):
        provider = providers[min(attempt, len(providers) - 1)] if len(providers) > 1 and attempt > 0 else providers[0]
        # after first failure, force fallback to Lovable if available
        if attempt > 0 and len(providers) > 1:
            provider = providers[1]
        name, url, key, model = provider
        body = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You output strict JSON only. No markdown fences, no prose."},
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.9,
        }
        try:
            r = requests.post(url, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"}, json=body, timeout=180)
            if r.status_code >= 400:
                raise RuntimeError(f"{name} {r.status_code}: {r.text[:300]}")
            data = r.json()
            content = data["choices"][0]["message"]["content"]
            content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip(), flags=re.MULTILINE)
            parsed = json.loads(content)
            ideas = parsed.get("ideas") or parsed.get("data") or parsed
            if not isinstance(ideas, list):
                raise ValueError(f"expected list, got {type(ideas)}")
            if len(ideas) < 18:
                raise ValueError(f"only {len(ideas)} ideas returned")
            print(f"  ok via {name}: {theme['slug']}/{hook['id']} -> {len(ideas)}", file=sys.stderr)
            return ideas[:25]
        except Exception as e:
            last_err = e
            print(f"  [retry {attempt+1}/{retries} via {name}] {theme['slug']}/{hook['id']}: {e}", file=sys.stderr)
            time.sleep(2 + 3 * attempt)
    raise RuntimeError(f"all providers failed for {theme['slug']}/{hook['id']}: {last_err}")

# ----------------------------------------------------------------------------- orchestration

def build_idea(raw: dict, theme: dict, hook: dict, n: int) -> dict:
    title = (raw.get("title") or f"Voice {hook['name']}").strip()
    sub = (raw.get("subDiscipline") or theme["name"].lower()).strip()
    pitch = (raw.get("pitch") or "A voice-first creative tool.").strip()
    rationale = (raw.get("chainRationale") or f"This idea fits {hook['name']} because it needs {hook['tag']}.").strip()
    tam = (raw.get("tam") or theme["market_anchor"]).strip()
    sam = (raw.get("sam") or theme["market_anchor"]).strip()
    som = (raw.get("som") or "$10M — early-adopter wedge").strip()
    idea = {
        "id": f"{theme['slug']}-{slug(title)}-{n}",
        "theme": theme["slug"],
        "title": title,
        "pitch": pitch,
        "subDiscipline": sub,
        "quantumHook": hook["name"],
        "quantumHookId": hook["id"],
        "quantumTag": hook["tag"],
        "quantumRationale": rationale,
        "megaPrompt": "",
        "tam": tam, "sam": sam, "som": som,
    }
    # Use the lean 5-credit prompt builder from rewrite_mega_prompts.py
    import importlib.util, pathlib as _pl
    _spec = importlib.util.spec_from_file_location("rmp", _pl.Path(__file__).parent / "rewrite_mega_prompts.py")
    _rmp = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_rmp)
    idea["megaPrompt"] = _rmp.make_prompt(idea, theme)
    return idea

def load_ckpt() -> dict:
    return json.loads(CKPT.read_text()) if CKPT.exists() else {}

def save_ckpt(ckpt: dict):
    CKPT.write_text(json.dumps(ckpt))

def main():
    ckpt = load_ckpt()
    tasks = []  # (theme, hook)
    for t in THEMES:
        for h in HOOKS:
            key = f"{t['slug']}::{h['id']}"
            if key in ckpt: continue
            tasks.append((t, h, key))
    print(f"{len(tasks)} batches to run ({len(THEMES)*len(HOOKS)} total; {len(ckpt)} cached).")

    results: dict = {k: v for k, v in ckpt.items()}  # key -> list of raw ideas

    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(call_aisa, t, h, i): (t, h, key) for i, (t, h, key) in enumerate(tasks)}
        done = 0
        for f in as_completed(futs):
            t, h, key = futs[f]
            try:
                raw_ideas = f.result()
                results[key] = raw_ideas
                ckpt[key] = raw_ideas
                save_ckpt(ckpt)
                done += 1
                print(f"  [{done}/{len(tasks)}] {key} -> {len(raw_ideas)} ideas")
            except Exception as e:
                print(f"  FAIL {key}: {e}", file=sys.stderr)

    # Assemble per-theme files
    for t in THEMES:
        ideas = []
        for h in HOOKS:
            key = f"{t['slug']}::{h['id']}"
            raws = results.get(key, [])
            for n, raw in enumerate(raws[:25]):
                ideas.append(build_idea(raw, t, h, n))
        out = {"theme": t, "ideas": ideas}
        path = DATA / f"{t['slug']}.json"
        path.write_text(json.dumps(out, indent=2, ensure_ascii=False))
        print(f"wrote {path} ({len(ideas)} ideas)")

if __name__ == "__main__":
    main()
