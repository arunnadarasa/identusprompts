import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "Showcase — Creative Blockchain" },
      { name: "description", content: "Live working demos built from the Creative Blockchain prompts." },
      { property: "og:title", content: "Showcase — Creative Blockchain" },
      { property: "og:description", content: "Live working demos built from the Creative Blockchain prompts." },
    ],
  }),
  component: () => (
    <SiteShell>
      <Outlet />
    </SiteShell>
  ),
});
