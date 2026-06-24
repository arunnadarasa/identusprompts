## Goal
On every idea detail page, lead the "Quantum hook" section with a **plain-language product proposition** — "what this app actually does for a user" — before the existing quantum-jargon rationale.

Example for *Field Drafting* (QTDA + dance):
> **NEW (plain):** Choreography drafts get analyzed by a quantum kernel, and the results come back as a simple shape map — clusters, loops, and gaps — that a dancer can read at a glance to spot structure.
>
> **EXISTING (technical):** QTDA is the right primitive here because choreography drafting reduces to a shape of data problem; the kernel returns a result you can drop straight into the UI.

The plain line never says "QTDA", "SWAP test", "amplitude encoding", etc. — it says what the user sees and does.

## Approach
Derive the plain-language sentence at render time from three pieces of data we already have:
- `idea.subDiscipline` (e.g. "choreography drafting")
- `theme.audience` (e.g. "dancers, choreographers")
- `hook.ui` from `hooks.json` (e.g. "a 'shape signature' visualization with connected-component, loop, and void counts")

No JSON edits, no new content per idea — one template per hook produces a coherent sentence using the idea's specific subDiscipline and audience.

## Changes

### 1. New file: `src/lib/plain-language.ts`
A function `getPlainProposition(idea, theme)` returning a one-sentence proposition keyed off `idea.quantumHookId`. Roughly:

```ts
const templates: Record<string, (ctx) => string> = {
  "swap-test": ({ sub, who }) =>
    `Two ${sub} candidates go into a quantum similarity check; the app shows ${who} a single 0–100% match score so they can pick the closest one in a tap.`,
  "qtda": ({ sub, who }) =>
    `${cap(sub)} gets fed into a quantum shape-finder; ${who} see clusters, loops, and gaps drawn on top of their work instead of having to spot structure by eye.`,
  "amplitude-encoding": ({ sub, who }) =>
    `${cap(sub)} is encoded as a quantum vector and projected onto a 2D map; ${who} navigate the option space visually instead of guessing parameters.`,
  "grover": ({ sub, who }) =>
    `Instead of trying every combination, a quantum search jumps to a valid ${sub} configuration in a fraction of the tries and shows ${who} the winning pick with a confidence score.`,
  "qft": ({ sub, who }) =>
    `A quantum frequency analyzer scans ${sub} and surfaces the dominant cycles — rhythms and repetitions ${who} would otherwise miss — as simple bars.`,
  "quantum-walk": ({ sub, who }) =>
    `${cap(sub)} is laid out as a graph; a quantum walker explores it and lights up the most promising next step for ${who} to take.`,
  "vqe": ({ sub, who }) =>
    `${who} set a creative goal; a quantum optimizer tunes the ${sub} parameters until they converge, and returns the dialed-in knobs.`,
  "sampling": ({ sub, who }) =>
    `A quantum circuit acts as a creative dice-roll; each "regenerate" feeds fresh quantum noise into the ${sub} so ${who} get genuinely novel variants instead of recycled outputs.`,
  "phase-estimation": ({ sub, who }) =>
    `${cap(sub)} is matched against a target resonance using quantum phase estimation; ${who} see a single dial that snaps when alignment is strongest.`,
  "entanglement": ({ sub, who }) =>
    `Two ${who} share an entangled session: when one makes a move on the ${sub}, the other's side updates in correlated lockstep.`,
};
```

Plus a `cap()` helper for first-letter capitalization and a safe fallback string.

### 2. Update `src/routes/ideas.$id.tsx`
In the "Quantum hook" `<section>`, insert the plain proposition as the lead paragraph, then the existing `quantumRationale` as a smaller secondary line.

```tsx
<h2 className="font-display text-xl font-semibold">Quantum hook</h2>
{/* NEW: plain-language proposition */}
<p className="text-base text-foreground/90 leading-relaxed mt-2">
  {getPlainProposition(idea, theme)}
</p>
{/* EXISTING, demoted to secondary */}
<p className="text-sm text-muted-foreground leading-relaxed mt-3">
  <span className="font-mono-q text-[10px] uppercase tracking-wider text-accent mr-2">why this primitive</span>
  {idea.quantumRationale}
</p>
```

This makes the plain line the primary read and the quantum-jargon line clearly labelled as the technical "why".

## Out of scope
- No edits to any JSON data files
- No changes to the idea card grid, theme pages, or routing
- No new UI components — text + one tiny label chip only

## Result
Every idea detail page leads with a sentence a hackathon judge with zero quantum background can understand on first read, with the quantum rationale demoted to a labelled "why this primitive" follow-up.