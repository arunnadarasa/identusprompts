import { createFileRoute } from "@tanstack/react-router";
import { DeckViewer } from "@/components/slides/deck-viewer";
import { SLIDES } from "@/components/slides/registry";

export const Route = createFileRoute("/deck/$slide")({
  head: ({ params }) => {
    const i = Number(params.slide) - 1;
    const slide = SLIDES[i];
    const title = slide
      ? `${slide.title} — Identus community-call deck`
      : "Identus community-call deck";
    const description =
      "Slide deck on three Hyperledger Identus builds: the 1,000-idea Catalyst, the Identus Hub / NHS console, and IPS Compass.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: DeckSlide,
});

function DeckSlide() {
  const { slide } = Route.useParams();
  const index = Number.isFinite(Number(slide)) ? Number(slide) - 1 : 0;
  return <DeckViewer index={index} />;
}
