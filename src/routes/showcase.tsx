import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "Showcase — Sprites Creative" },
      { name: "description", content: "Reference implementations built from the Sprites Creative prompts." },
      { property: "og:title", content: "Showcase — Sprites Creative" },
      { property: "og:description", content: "Reference implementations built from the Sprites Creative prompts." },
    ],
  }),
  component: () => (
    <SiteShell>
      <Outlet />
    </SiteShell>
  ),
});
