# Add the IPS Compass demo to the showcase

Reading "IPA demo" as the IPS Compass demo (ipsmidnight.lovable.app) — the third project, alongside the Identus console. If you meant something else, say the word and I'll swap it.

## Changes

All in `src/routes/showcase.index.tsx`.

1. **Second featured demo card** — under the existing "Identus console" card, add a matching large card for IPS Compass:
   - Eyebrow: `Vol. 01 · No. 02 · Live · ipsmidnight.lovable.app`
   - Title: IPS Compass — a clinical summary you can prove.
   - Body: FHIR International Patient Summary → digest → Identus verifiable credential → Midnight ledger anchor, with the agent stack provisioned from inside the app.
   - Call to action: Open the live demo ↗

2. **Repo link inside each demo card** — the featured cards get their GitHub repo shown directly on the card, as a mono caption line under the call to action:
   - Identus console → github.com/arunnadarasa/identus
   - IPS Compass → github.com/arunnadarasa/ipsmidnight
   Since the whole card is already one `<a>` to the app, the repo renders as a separate sibling link row beneath the card body (not nested inside the anchor) so both links stay clickable and valid.

3. **Source row** — add a third tile for `arunnadarasa/ipsmidnight` next to the existing `arunnadarasa/identus` and identus.io docs tiles, and a tile for `arunnadarasa/identusprompts` (this app's own source), so the grid lists all three repos plus the docs.

4. **Head metadata** — update the route's description and og:description to mention both live demos rather than only the console.

Styling reuses the existing card, eyebrow and mono classes; no new tokens or components.
