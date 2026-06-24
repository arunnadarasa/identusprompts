## Editorial Folio Noir — sleek, premium, WOW

Re-skin the Creative Quantum repo as a leather-bound luxury folio. Same routes, same content, totally new visual register.

### 1. Design tokens (src/styles.css)

Swap the dark indigo/cyan palette for **Noir & Gold**:

- `--background` #0d0d0d, `--card` #1a1a1a, `--foreground` #f0d78c, `--muted-foreground` #f0d78c at 60% alpha
- `--primary` #c9a84c (gold) on #0d0d0d, `--accent` #f0d78c (champagne)
- `--border` #c9a84c at 10–20% alpha (gold hairlines)
- Remove the blue grid-paper background-image; replace with a subtle warm grain / radial gold bloom
- Add `--gradient-gold-bloom` and `--shadow-folio` tokens

### 2. Typography

- Install `@fontsource/instrument-serif` and `@fontsource/work-sans`, import in `src/start.ts`
- Set body to Work Sans, `.font-display` to Instrument Serif (with italic variant for accents)
- Retire `font-mono-q` styling cues to small-caps Work Sans 600 with 0.3em tracking (gold)

### 3. Site shell (src/components/site-shell.tsx)

- Header: thin gold hairline border, `Creative Quantum` in Instrument Serif, nav as small-caps Work Sans with gold underline-draw on hover
- "Collection No." volume chip on the left, gold CTA button on the right
- Footer: editorial colophon row (volume / series / Quantinuum credit)

### 4. Home (src/routes/index.tsx)

Editorial hero in the prototype's voice:
- Eyebrow: `COLLECTION NO. 04 — 1000 IDEAS`
- Display H1 (Instrument Serif, 6xl→8xl, mixed italic + roman): `Creative Quantum`
- Lede paragraph + two CTAs (outlined "Browse themes" + solid gold "Open hackathon")
- Below: a bento row featuring 1 large "primary directive" tile (rotating featured idea), 1 stats tile in solid gold (#themes / #ideas / #disciplines), 1 portrait tile linking to a discipline, 1 wide quote/manifesto tile

### 5. Themes index (src/routes/themes.index.tsx)

Bento grid of the 10 themes:
- 4-col grid, `auto-rows-[280px]`, mixed spans (one feature tile spans 2×2, others 1×1 or 2×1)
- Each tile: small-caps eyebrow (`THEME 01 / 10`), Instrument Serif title, sub-count, gold hairline footer with `View narrative →`
- One tile is solid gold (#c9a84c) showing total idea count — high contrast pop
- Soft gold radial glow on hover for feature tiles

### 6. Theme detail (src/routes/themes.$theme.tsx)

- Editorial header (eyebrow + giant serif theme name + lede + idea count)
- Idea cards reflow into the same bento rhythm: first idea per page is the feature tile, rest are uniform
- Sub-discipline filter chips as small-caps gold pills

### 7. Idea card (src/components/idea-card.tsx)

- Charcoal #1a1a1a card, gold hairline border, 10% opacity at rest → 40% on hover
- Eyebrow `IDEA · {subDiscipline}` in gold small-caps
- Title in Instrument Serif (2xl)
- Pitch in Work Sans 60% champagne, 2-line clamp
- Footer hairline + `Open entry →` micro-CTA + circled gold arrow

### 8. Idea detail (src/routes/ideas.$id.tsx)

- Volume breadcrumb in small-caps gold
- Massive Instrument Serif title; italic accent on one keyword if natural
- "Quantum hook" block: charcoal card with gold hairline; keep the plain-proposition lede + `why this primitive` sub-line
- Mega-prompt block: framed as an "Appendix" with a gold corner bracket and the existing CopyButton restyled gold-on-charcoal
- Market sizing: 3 bento tiles, one filled solid gold

### 9. Other pages (about, strategy, quantum-primer)

Apply the same shell: eyebrow + serif display heading + Work Sans body. No structural rewrites — just tokens + heading swaps so they feel part of the folio.

### 10. Motion

- 500ms ease transitions on borders/backgrounds (no bouncy)
- `animate-fade-in` on route mounts
- Gold hairline-draw underline on nav + card CTAs (`story-link` pattern but gold)
- Slow gold radial bloom that brightens on hover for feature tiles only

### Out of scope

- No data, routing, server, or business-logic changes
- No new dependencies beyond the two `@fontsource` packages
- Quantum chip / copy button / sheet primitives stay; only their token colors shift via the new CSS variables
