## Goal
Tighten mobile UX across the theme detail page (and apply the same conventions to home, themes index, and idea detail) so content reads cleanly on a 384px viewport.

## Issues visible in the screenshot
1. Hook filter chips overflow off the right edge — "AMPLITUDE ENCODI…" gets clipped because the scroll row uses negative-margin overflow but no fade/scroll indicator, and chips are uppercase mono so they're wide.
2. H1 (`Fashion & Textile Design`) wraps awkwardly next to the emoji; the emoji column eats horizontal space.
3. The mono subhead (`100 ideas · 10 quantum hooks · for fashion designers…`) is dense uppercase text and dominates the viewport.
4. The sticky search + filter section is tall on mobile, pushing idea cards below the fold.
5. Idea cards have generous padding; only ~1 card fits per screen.

## Plan (mobile-first, no data/route changes)

### 1. `src/routes/themes.$theme.tsx` — hero
- Move emoji above the H1 on mobile (stacked), inline on `sm+`.
- Drop H1 to `text-[26px] leading-[1.05]` on mobile, keep `sm:text-5xl`.
- Replace the dense mono subhead with two small chips: `100 ideas` and `10 hooks`, plus an "Audience" line in normal sentence case (not mono uppercase) and `line-clamp-2`.
- Breadcrumb stays but smaller (`text-[10px]`).

### 2. Sticky filter bar
- Make the bar non-sticky on mobile (sticky only `md+`) so it doesn't constantly cover content while scrolling.
- Add a horizontal fade mask on the chip scroller (`mask-image` gradient) so the last chip clearly indicates "scroll for more".
- Shorten chip labels: `ALL`, plus hook short names; lowercase the chips (not uppercase) so widths are reasonable.
- Slightly smaller search input on mobile (`py-2.5 text-[15px]`).

### 3. Idea cards (`src/components/idea-card.tsx`)
- Reduce mobile padding `p-5 → p-4`, gap-3 → gap-2.5.
- Title `text-lg` on mobile (was `text-xl`).
- Pitch `line-clamp-2` on mobile, `line-clamp-3` on `sm+`.
- Make the whole row of meta wrap with smaller chip.

### 4. Theme index cards (`src/routes/themes.index.tsx`)
- Tighten mobile card padding, reduce sample list to 2 items on mobile (3 on `sm+`).

### 5. Home (`src/routes/index.tsx`)
- Reduce hero top padding on mobile so the H1 lands above the fold without scrolling.
- Stat grid: 2 cols stays, but reduce vertical gap.

### 6. Global / shell (`src/components/site-shell.tsx`)
- Tighten header `py-3 → py-2.5` on mobile so the sticky header doesn't claim as much vertical space.
- Ensure `scroll-mt-16` on section anchors so they aren't covered by the header.

## Out of scope
- No data changes.
- No route/layout changes.
- No new design tokens or fonts — same palette, same Fraunces/Inter/JetBrains pairing.

## Verify
- Use the mobile preview at 384px, navigate Home → Themes → Fashion → an idea.
- Confirm: hook chips no longer clip; H1 fits; at least one full idea card visible above the filter; idea detail page legible without horizontal scroll.