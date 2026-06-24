#!/usr/bin/env python3
"""Regenerate all 1000 Creative Blockchain ideas via the AISA API.

Run:  AISA_API_KEY=... python3 scripts/regenerate_ideas.py

Calls AISA (OpenAI-compatible) in batches: 1 call per (theme x hook) producing 25 ideas each.
10 themes * 4 hooks = 40 calls. Concurrency = 5.

Writes back to src/data/ideas/<theme>.json (overwrites). Skips already-completed (theme, hook)
batches if a checkpoint exists at scripts/.regen-checkpoint.json so reruns resume.
"""
import json, os, re, sys, time, pathlib, traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "ideas"
CKPT = pathlib.Path(__file__).parent / ".regen-checkpoint.json"

AISA_URL = "https://api.aisa.one/v1/chat/completions"
AISA_KEY = os.environ.get("AISA_API_KEY")
AISA_MODEL = os.environ.get("AISA_MODEL", "gpt-4.1-mini")

LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions"
LOVABLE_KEY = os.environ.get("LOVABLE_API_KEY")
LOVABLE_MODEL = "google/gemini-3-flash-preview"

if not AISA_KEY and not LOVABLE_KEY:
    print("ERROR: need AISA_API_KEY or LOVABLE_API_KEY", file=sys.stderr); sys.exit(1)

THEMES = json.loads((DATA / "themes.json").read_text())
HOOKS = json.loads((DATA / "hooks.json").read_text())

CREDIT = "Built during the Creative AI & Quantum Hackathon organised by StreetKode Fam during Indian Krump Festival 14"

# ----------------------------------------------------------------------------- mega-prompt template

SECRETS_BLOCK = """REQUIRED SECRETS (add in Lovable: Project Settings -> Secrets):
- METAMASK_PRIVATE_KEY  ->  Export from MetaMask. Fund it on Sepolia via the Google Cloud faucet:
                            https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- ETHERSCAN_API_KEY     ->  Get from https://etherscan.io/myapikey  (for `npx hardhat verify`)
- PRIVY_APP_ID          ->  Get from https://dashboard.privy.io  (docs: https://docs.privy.io/llms-full.txt)
- PINATA_JWT            ->  Get from https://app.pinata.cloud/developers/api-keys  (docs: https://docs.pinata.cloud/llms-full.txt)
- SEPOLIA_RPC_URL       ->  Optional. A public RPC is used if omitted.
"""

def sol_contract(name: str, idea_title: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9]", "", name)[:40] or "Provenance"
    return f"""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title {safe}
/// @notice {idea_title}
/// @notice {CREDIT}
contract {safe} {{
    event Logged(address indexed author, string cid, uint256 at);

    /// @notice {CREDIT}
    function log(string calldata cid) external {{
        emit Logged(msg.sender, cid, block.timestamp);
    }}
}}"""

def nft_contract(name: str, idea_title: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9]", "", name)[:40] or "ProvenanceNFT"
    return f"""// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title {safe}
/// @notice ERC-721 provenance mint for: {idea_title}
/// @notice {CREDIT}
contract {safe} is ERC721 {{
    uint256 public nextId;
    mapping(uint256 => string) public cidOf;

    constructor() ERC721("{safe}", "{safe[:6].upper()}") {{}}

    /// @notice Mint a provenance token pointing at an IPFS CID.
    /// @notice {CREDIT}
    function mint(string calldata cid) external returns (uint256 id) {{
        id = ++nextId;
        cidOf[id] = cid;
        _safeMint(msg.sender, id);
    }}

    function tokenURI(uint256 id) public view override returns (string memory) {{
        return string(abi.encodePacked("ipfs://", cidOf[id]));
    }}
}}"""

def make_mega_prompt(idea: dict, theme: dict, hook: dict) -> str:
    title = idea["title"]
    pitch = idea["pitch"]
    sub = idea["subDiscipline"]
    hid = hook["id"]
    common_header = f"""Build "{title}" — a Creative Blockchain hackathon entry for Lovable.

WHAT IT DOES
{pitch}

DISCIPLINE: {theme['name']} ({sub})
ONCHAIN PRIMITIVE: {hook['name']} ({hook['tag']})

SCOPE
- Single Lovable build message. One page + a 'How it works' strip.
- No Lovable Cloud / no backend database. State lives onchain (Sepolia) and on IPFS (Pinata).
- All wallet UX through Privy embedded wallet with Google sign-in + sponsored transactions.

{SECRETS_BLOCK}"""

    if hid == "sepolia-deploy":
        body = f"""SOLIDITY (contracts/{re.sub(r'[^A-Za-z0-9]','', title)[:40] or 'Provenance'}.sol):
```solidity
{sol_contract(title, pitch)}
```

DEPLOY (scripts/deploy.ts, hardhat):
- Read METAMASK_PRIVATE_KEY + SEPOLIA_RPC_URL from process.env
- Deploy contract; capture the address
- Run `npx hardhat verify --network sepolia <address>` using ETHERSCAN_API_KEY
- Write the deployed address + tx hash to src/data/contract.json so the frontend can render the live Etherscan link

FRONTEND
- One workspace page for {sub} that calls `log(cid)` on the deployed contract via Privy's sponsored tx
- Show a 'Verified on Sepolia' badge linking to https://sepolia.etherscan.io/address/<address>
"""
    elif hid == "ipfs-pinata":
        body = f"""IPFS PIN (src/lib/pinata.ts):
```ts
export async function pinToIPFS(file: Blob, name = "{sub}") {{
  const fd = new FormData();
  fd.append("file", file, name);
  const r = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {{
    method: "POST",
    headers: {{ Authorization: `Bearer ${{process.env.PINATA_JWT}}` }},
    body: fd,
  }});
  const {{ IpfsHash }} = await r.json();
  return IpfsHash as string;
}}
```

OPTIONAL CONTRACT (contracts/CIDLog.sol) — stores the CID onchain so the {sub} is timestamped:
```solidity
{sol_contract('CIDLog_' + title, pitch)}
```

FRONTEND
- One workspace page for {sub}
- After the user creates / uploads a {sub} artefact, pin it to Pinata, then call `log(cid)` on the Sepolia contract (Privy sponsored)
- Show the CID + an `https://gateway.pinata.cloud/ipfs/<cid>` preview + the Etherscan link
"""
    elif hid == "privy-social":
        body = f"""PRIVY (src/main.tsx):
```tsx
import {{ PrivyProvider }} from "@privy-io/react-auth";
<PrivyProvider
  appId={{import.meta.env.VITE_PRIVY_APP_ID}}
  config={{{{
    loginMethods: ["google", "email"],
    embeddedWallets: {{ createOnLogin: "users-without-wallets" }},
    defaultChain: {{ id: 11155111, name: "Sepolia" }},
  }}}}
>
  <App />
</PrivyProvider>
```

SPONSORED TX HELPER (src/lib/tx.ts): use Privy's `useSendTransaction` with `{{ sponsor: true }}` so users never see gas.

OPTIONAL CONTRACT (contracts/SocialLog.sol):
```solidity
{sol_contract('SocialLog_' + title, pitch)}
```

FRONTEND
- One-tap 'Sign in with Google' (Privy) drops the user straight into the {sub} workspace
- Every {sub} action they take is sent as a sponsored Sepolia tx and shown with an Etherscan link
"""
    else:  # nft-provenance
        body = f"""ERC-721 (contracts/{re.sub(r'[^A-Za-z0-9]','', title)[:40] or 'ProvenanceNFT'}.sol):
```solidity
{nft_contract(title, pitch)}
```

DEPLOY: hardhat + `npx hardhat verify` (uses ETHERSCAN_API_KEY).

PIPELINE
1. User creates a {sub} artefact in the UI
2. Pin to IPFS via Pinata JWT -> get CID
3. Call `mint(cid)` on the Sepolia contract via Privy sponsored tx
4. Show the user: tokenId, owner (their Privy wallet), IPFS gateway preview, and Etherscan link to the mint tx
"""

    footer = f"""
ALWAYS-INCLUDE FOOTER
- Render a footer line in the UI:
  "{CREDIT}"
- Every deployed Solidity contract MUST keep the two NatSpec credit lines shown in the snippets above.

CREDIT
{CREDIT}"""
    return common_header + body + footer

# ----------------------------------------------------------------------------- AISA call

def slug(s: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")[:48] or "idea"

def call_aisa(theme: dict, hook: dict, batch_idx: int, retries: int = 6) -> list:
    prompt = f"""You are designing 25 distinct hackathon project ideas for the discipline "{theme['name']}"
(audience: {theme['audience']}; market: {theme['market_anchor']}).

EVERY idea must be built around this single onchain primitive:
  {hook['name']} — {hook['kernel']}

For each of the 25 ideas, output:
- title: 2-4 words, evocative, NOT generic (e.g. "Loop Provenance", not "NFT App")
- subDiscipline: short noun phrase naming the creative sub-area (e.g. "live-set sampling", "color study")
- pitch: ONE short sentence (max 22 words) describing the user value in plain language
- chainRationale: one short sentence explaining why THIS primitive (not another) fits this idea
- tam, sam, som: each is a string "{{$X}} — {{one-line context}}" (e.g. "$5B — global dance studio software")

Return STRICT JSON: {{ "ideas": [ {{title, subDiscipline, pitch, chainRationale, tam, sam, som}} x25 ] }}.
No markdown, no commentary. All 25 ideas must be meaningfully different from each other."""

    body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You output strict JSON only. No markdown fences, no prose."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.9,
    }
    last_err = None
    for attempt in range(retries):
        try:
            r = requests.post(
                AISA_URL,
                headers={"Authorization": f"Bearer {AISA_KEY}", "Content-Type": "application/json"},
                json=body, timeout=180,
            )
            if r.status_code >= 400:
                raise RuntimeError(f"AISA {r.status_code}: {r.text[:400]}")
            data = r.json()
            content = data["choices"][0]["message"]["content"]
            # strip code fences if present
            content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip(), flags=re.MULTILINE)
            parsed = json.loads(content)
            ideas = parsed.get("ideas") or parsed.get("data") or parsed
            if not isinstance(ideas, list):
                raise ValueError(f"expected list, got {type(ideas)}")
            if len(ideas) < 20:
                raise ValueError(f"only {len(ideas)} ideas returned")
            return ideas[:25]
        except Exception as e:
            last_err = e
            print(f"  [retry {attempt+1}/{retries}] {theme['slug']}/{hook['id']}: {e}", file=sys.stderr)
            time.sleep(3 + 4 * attempt)
    raise RuntimeError(f"AISA failed for {theme['slug']}/{hook['id']}: {last_err}")

# ----------------------------------------------------------------------------- orchestration

def build_idea(raw: dict, theme: dict, hook: dict, n: int) -> dict:
    title = (raw.get("title") or f"Onchain {hook['name']}").strip()
    sub = (raw.get("subDiscipline") or theme["name"].lower()).strip()
    pitch = (raw.get("pitch") or "An onchain creative tool.").strip()
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
    idea["megaPrompt"] = make_mega_prompt(idea, theme, hook)
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

    with ThreadPoolExecutor(max_workers=2) as ex:
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
