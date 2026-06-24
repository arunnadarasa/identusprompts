# Mobile UX pass

Screenshot shows the mega-prompt `<pre>` block on `/ideas/:id` blowing past the viewport — long unbreakable URLs (`https://sepolia.etherscan.io/address/<addre…`) push horizontal scroll on the whole page. Same pattern in `strategy.tsx`.

## Fixes

1. **`<pre>` overflow** — `src/routes/ideas.$id.tsx` and `src/routes/strategy.tsx`
   - Add `break-words [overflow-wrap:anywhere]` to every `<pre className="whitespace-pre-wrap …">`. Long URLs and CIDs will wrap instead of pushing the page wide.
   - Tighten mobile padding: `p-4 sm:p-6` (currently `p-6 sm:p-8` / `p-5`).
   - Drop mobile font to `text-[12px]` so wrapped lines stay readable.

2. **Page horizontal containment**
   - Add `overflow-x-hidden` to `<main>` in `src/components/site-shell.tsx` as a safety net so a single misbehaving child can't shift the whole page.

3. **Showcase demo input** — `src/routes/showcase.choreo-ledger.tsx`
   - Address line + tx-hash links: already `break-all` for the contract address; apply the same to the feed entry CID column (`break-all` on the `font-mono` cell) so long CIDs wrap.
   - Submit input: `text-[13px]` on mobile so a typed CID fits.

4. **Header** — `src/components/site-shell.tsx`
   - The "Vol. 01" eyebrow + long title can crowd the burger on small screens. Hide the eyebrow below `sm` (already `hidden sm:inline` — keep). Shrink title to `text-lg` on the smallest widths to give the burger button breathing room.

5. **Idea card grids** — verify `min-w-0` is present on flex children that hold long titles; add where missing in `src/components/idea-card.tsx` if a long title would push the badge.

## Out of scope

- No redesign, no palette/type changes.
- No new routes or components.
- No backend changes.

Five small file edits, then a Playwright check at 390px to confirm no horizontal scroll on `/ideas/:id`, `/strategy`, `/showcase/choreo-ledger`.
