#!/usr/bin/env python3
"""Regenerate all 1,000 Hyperledger Identus hackathon ideas via the AIsa API.

Run:  AISA_API_KEY=... python3 scripts/regenerate_ideas.py

One call per (theme x primitive) = 40 calls, 25 ideas each, concurrency 5.
Themes stay the ten creative disciplines; every idea applies ONE Identus
primitive (DID Registrar / DIDComm Connection / Credential Issuance / Proof
Presentation) to a real identity problem in that creative industry.

Ideas are written back in strict round-robin order so each theme file holds
exactly 25 ideas per primitive. Market sizing (tam/sam/som) is carried over
from the existing file by index.

Checkpoint at scripts/.regen-checkpoint.json lets reruns resume. Delete it to
start clean. If AISA_API_KEY is missing the script falls back to deterministic
composition so the catalog is always fully populated.
"""
import json, os, re, sys, time, pathlib
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"
CKPT = pathlib.Path(__file__).parent / ".regen-checkpoint.json"

AISA_URL = "https://api.aisa.one/v1/chat/completions"
AISA_KEY = os.environ.get("AISA_API_KEY")
AISA_MODEL = os.environ.get("AISA_MODEL", "gpt-4o-mini")  # bare id — never vendor-prefixed

THEMES = json.loads((DATA / "themes.json").read_text())
HOOKS = json.loads((DATA / "hooks.json").read_text())
HOOK_ORDER = [h["id"] for h in HOOKS]

PER_BATCH = 25


def slug(s: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")[:48] or "idea"


def prompt_for(theme: dict, hook: dict) -> str:
    return f"""You are designing {PER_BATCH} distinct hackathon ideas for the creative discipline
"{theme['name']}" (audience: {theme['audience']}; market: {theme['market_anchor']}).

Every idea is a small web app built with Hyperledger Identus — open-source
self-sovereign identity: decentralised identifiers (did:prism), DIDComm, and
W3C verifiable credentials issued and verified by an Identus Cloud Agent.

EVERY idea in this batch uses exactly ONE Identus primitive:
  {hook['name']} ({hook['tag']}) — {hook['kernel']}
That primitive must be the centre of the user experience.

The identity problem must be REAL and specific to {theme['name']}: who claims
what, who needs to prove it, and to whom. Think credits and attribution,
licensing and rights, memberships and accreditation, provenance and
authenticity, access and backstage passes, age or eligibility gates, consent,
payouts, safeguarding, union/guild status, edition authenticity, agent
delegation. Never generic "login with your DID".

STRICTLY FORBIDDEN: NFTs, tokens, coins, crypto trading, minting for profit,
DAOs, gas fees, wallets-as-speculation. Identus is identity infrastructure,
not web3 finance.

Return ONLY a JSON array of {PER_BATCH} objects, no prose, no markdown fence:
[{{"title": "...", "subDiscipline": "...", "concept": "..."}}]
- title: 2-4 words, evocative, no colon, no quotes, unique within the batch.
- subDiscipline: 1-3 lowercase words naming the niche inside {theme['name']}
  (e.g. "ballet pedagogy", "session musicians", "costume archives"). Vary them.
- concept: ONE sentence (max 26 words) saying what the app does and who proves
  what to whom. Plain language, no buzzwords."""


def call_aisa(theme: dict, hook: dict, retries: int = 5) -> list:
    body = {
        "model": AISA_MODEL,
        "messages": [
            {"role": "system", "content": "You output strict JSON arrays and nothing else."},
            {"role": "user", "content": prompt_for(theme, hook)},
        ],
        "temperature": 0.9,
    }
    for attempt in range(retries):
        try:
            r = requests.post(
                AISA_URL,
                headers={"Authorization": f"Bearer {AISA_KEY}"},
                json=body,
                timeout=600,
            )
        except requests.RequestException as exc:
            print(f"  network error ({exc}); retrying", file=sys.stderr)
            time.sleep(3 * (attempt + 1))
            continue
        if r.status_code == 402:
            raise SystemExit("AIsa balance exhausted — top up at https://console.aisa.one")
        if r.status_code == 429:
            time.sleep(5 * (attempt + 1))
            continue
        if r.status_code != 200:
            print(f"  AIsa {r.status_code}: {r.text[:200]}", file=sys.stderr)
            time.sleep(3 * (attempt + 1))
            continue
        text = r.json()["choices"][0]["message"]["content"]
        text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M).strip()
        m = re.search(r"\[.*\]", text, re.S)
        if not m:
            continue
        try:
            items = json.loads(m.group(0))
        except json.JSONDecodeError:
            continue
        out = [
            {
                "title": str(i.get("title", "")).strip(),
                "subDiscipline": str(i.get("subDiscipline", "")).strip().lower(),
                "concept": str(i.get("concept", "")).strip(),
            }
            for i in items
            if i.get("title") and i.get("concept")
        ]
        if len(out) >= 15:
            return out[:PER_BATCH]
    return []


# --------------------------------------------------------------- fallback

FALLBACK_ANGLES = [
    ("credit attribution", "who made which part of the work"),
    ("licensing terms", "what a buyer is allowed to do with the work"),
    ("guild membership", "that the person is in good standing"),
    ("edition authenticity", "that this copy is the real one"),
    ("backstage access", "who may enter the restricted space"),
    ("age eligibility", "that the participant is old enough"),
    ("teaching accreditation", "that the teacher is certified"),
    ("consent record", "that the subject agreed to this use"),
    ("residency status", "that the artist completed the programme"),
    ("payout routing", "who is owed a share of the revenue"),
    ("archive provenance", "the chain of custody of the artefact"),
    ("commission history", "the work delivered for a client"),
    ("safeguarding check", "that the adult is cleared to work with minors"),
    ("collaborator roster", "who took part in the production"),
    ("press accreditation", "that the journalist is credentialed"),
    ("delegated agent", "that an AI assistant acts for the artist"),
    ("workshop attendance", "that the learner completed the session"),
    ("equipment custody", "who currently holds the gear"),
    ("competition entry", "that the entrant qualifies"),
    ("rights reversion", "that the rights returned to the creator"),
    ("union rate card", "the minimum the engagement must pay"),
    ("sample clearance", "that the source material is cleared"),
    ("venue approval", "that the space signed off on the show"),
    ("mentorship record", "the hours a mentor gave"),
    ("insurance cover", "that the production is insured"),
]

FALLBACK_TITLES = [
    "Ledger", "Signet", "Passport", "Atlas", "Beacon", "Cadence", "Halo",
    "Keystone", "Lantern", "Meridian", "Nucleus", "Orbit", "Prism", "Quill",
    "Relay", "Sable", "Talisman", "Umbra", "Vellum", "Waypoint", "Anchor",
    "Bastion", "Compass", "Ember", "Foundry",
]


def fallback_batch(theme: dict, hook: dict) -> list:
    out = []
    for n in range(PER_BATCH):
        sub, what = FALLBACK_ANGLES[n % len(FALLBACK_ANGLES)]
        word = FALLBACK_TITLES[n % len(FALLBACK_TITLES)]
        out.append({
            "title": f"{word} {sub.split()[0].capitalize()}",
            "subDiscipline": sub,
            "concept": (
                f"A {theme['name'].split('&')[0].strip().lower()} app where "
                f"{theme['audience'].split(',')[0].strip()} use {hook['name']} to establish {what}."
            ),
        })
    return out


# --------------------------------------------------------------- assembly

def load_ckpt() -> dict:
    return json.loads(CKPT.read_text()) if CKPT.exists() else {}


def save_ckpt(ck: dict) -> None:
    CKPT.write_text(json.dumps(ck, indent=0))


def main() -> None:
    if not AISA_KEY:
        print("WARNING: AISA_API_KEY not set — using deterministic fallback ideas", file=sys.stderr)
    ck = load_ckpt()
    jobs = [(t, h) for t in THEMES for h in HOOKS if f"{t['slug']}::{h['id']}" not in ck]

    if jobs:
        with ThreadPoolExecutor(max_workers=5) as pool:
            futures = {
                pool.submit(call_aisa if AISA_KEY else (lambda t, h: []), t, h): (t, h)
                for t, h in jobs
            }
            for fut in as_completed(futures):
                t, h = futures[fut]
                try:
                    items = fut.result()
                except SystemExit:
                    raise
                except Exception as exc:  # noqa: BLE001
                    print(f"  {t['slug']}/{h['id']} failed: {exc}", file=sys.stderr)
                    items = []
                if len(items) < PER_BATCH:
                    filler = fallback_batch(t, h)
                    items = (items + filler)[:PER_BATCH]
                ck[f"{t['slug']}::{h['id']}"] = items
                save_ckpt(ck)
                print(f"  done {t['slug']}/{h['id']} ({len(items)})")

    for theme in THEMES:
        path = DATA / f"{theme['slug']}.json"
        existing = json.loads(path.read_text())["ideas"] if path.exists() else []
        buckets = {h: list(ck[f"{theme['slug']}::{h}"]) for h in HOOK_ORDER}
        ideas, seen = [], set()
        for n in range(PER_BATCH * len(HOOK_ORDER)):
            hook_id = HOOK_ORDER[n % len(HOOK_ORDER)]
            src = buckets[hook_id][n // len(HOOK_ORDER)]
            base = slug(src["title"])
            key = f"{theme['slug']}-{base}"
            idx = 0
            while f"{key}-{idx}" in seen:
                idx += 1
            seen.add(f"{key}-{idx}")
            prev = existing[n] if n < len(existing) else {}
            ideas.append({
                "id": f"{key}-{idx}",
                "theme": theme["slug"],
                "title": src["title"],
                "pitch": src["concept"],
                "concept": src["concept"],
                "subDiscipline": src["subDiscipline"] or "independent practice",
                "quantumHook": "",
                "quantumHookId": hook_id,
                "quantumTag": "",
                "quantumRationale": "",
                "megaPrompt": "",
                "tam": prev.get("tam", theme["market_anchor"]),
                "sam": prev.get("sam", theme["market_anchor"]),
                "som": prev.get("som", theme["market_anchor"]),
            })
        path.write_text(json.dumps({"theme": theme, "ideas": ideas}, indent=2, ensure_ascii=False) + "\n")
        print(f"wrote {path.name} ({len(ideas)} ideas)")

    print("\nNow run: python3 scripts/rewrite_mega_prompts.py")


if __name__ == "__main__":
    main()
