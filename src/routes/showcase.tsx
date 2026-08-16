import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "Showcase — Hyperledger Identus Catalyst" },
      { name: "description", content: "Reference implementations built from the Hyperledger Identus Catalyst prompts." },
      { property: "og:title", content: "Showcase — Hyperledger Identus Catalyst" },
      { property: "og:description", content: "Reference implementations built from the Hyperledger Identus Catalyst prompts." },
    ],
  }),
  component: () => (
    <SiteShell>
      <Outlet />
    </SiteShell>
  ),
});
