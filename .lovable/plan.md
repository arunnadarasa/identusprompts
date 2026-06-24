## Goal
Make “View all 100 ideas” open a real dedicated theme page where the 100 idea cards are visible, instead of appearing to jump back to the top of the themes list.

## Root cause
`/themes/$theme` already exists, but `src/routes/themes.tsx` is acting as both the `/themes` page and the parent route for `/themes/$theme`. In TanStack Router, a parent route with children must render an `<Outlet />`; this file does not, so the child theme page can match but has nowhere to appear. That explains why clicking looks like it just scrolls to the top of the themes page.

## Plan
1. Convert `src/routes/themes.tsx` into a proper parent/layout route
   - Import and render `<Outlet />` only.
   - Keep route metadata for the broader themes section if appropriate.

2. Move the current themes grid into a new dedicated index route
   - Create `src/routes/themes.index.tsx` for the `/themes` page.
   - Move the existing “Ten disciplines…” hero and theme cards there.
   - Keep the “View all 100 ideas” links as typed TanStack links: `to="/themes/$theme"` with `params={{ theme: t.slug }}`.

3. Keep `src/routes/themes.$theme.tsx` as the dedicated page for each theme
   - `/themes/dance`, `/themes/music`, etc. will all render through this dynamic route.
   - No need to create 10 separate near-duplicate files.
   - Keep the 100-card grid and idea detail links intact.

4. Improve the destination page just enough for mobile clarity
   - Add a clear “100 idea cards” count near the top.
   - Keep the hero/filter compact so users immediately see they landed on the theme page.

5. Verify
   - Click “View all 100 ideas” from the mobile preview.
   - Confirm the rendered page changes from the themes grid to the selected theme’s 100 ideas.
   - Confirm idea cards open `/ideas/$id` and show the full mega-prompt.