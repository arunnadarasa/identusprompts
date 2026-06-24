## Goal
Fix mobile UX issues visible on a ~384px viewport: header overflows off-screen (nav + Hackathon button), hero text is too large, CTAs and grids feel cramped.

## Changes

### 1. `src/components/site-shell.tsx` — responsive header
- On mobile (`<md`): show logo + hamburger button only. Hide inline nav.
- Tap hamburger → open shadcn `Sheet` (right side) with vertical nav links (Themes, Strategy, Quantum primer, About, Hackathon ↗). Close on link click.
- On `md+`: keep current inline nav unchanged.
- Shrink logo wordmark on mobile (`text-base md:text-lg`) and drop the `|0⟩+|1⟩` prefix below `sm` so the title doesn't wrap.
- Footer: stack on mobile (already `flex-wrap`, OK) — minor: smaller text + `gap-2`.

### 2. `src/routes/index.tsx` — hero + grids
- Hero `h1`: `text-4xl sm:text-5xl md:text-7xl` (currently jumps straight to 6xl).
- Hero padding: `pt-12 sm:pt-20`.
- Lede paragraph: `text-base sm:text-lg`.
- CTA buttons: full-width on mobile (`w-full sm:w-auto`) inside `flex-col sm:flex-row`.
- Stats grid: keep 2-col on mobile but reduce number size to `text-3xl sm:text-4xl`.
- Themes grid: already 2-col on mobile ✓.
- Section vertical padding: `py-8 sm:py-12`.

### 3. Other pages — quick parity pass
Apply the same hero scale-down pattern (h1 starts at `text-4xl sm:text-5xl`) to:
- `src/routes/themes.tsx`
- `src/routes/themes.$theme.tsx`
- `src/routes/ideas.$id.tsx`
- `src/routes/strategy.tsx`
- `src/routes/quantum-primer.tsx`
- `src/routes/about.tsx`

No structural/content changes — only Tailwind class adjustments + the Sheet-based mobile nav.

## Verification
After build, set preview viewport to mobile and confirm: header fits, no horizontal scroll, hamburger opens drawer, hero readable, CTAs tappable.
