import { createFileRoute } from "@tanstack/react-router";
import { DeckViewer } from "@/components/slides/deck-viewer";

const title = "Identus, shipped — 15-minute community-call deck";
const description =
  "Slide deck on three Hyperledger Identus builds: the 1,000-idea Catalyst, the Identus Hub / NHS console, and IPS Compass.";

export const Route = createFileRoute("/deck/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <DeckViewer index={0} />,
});
