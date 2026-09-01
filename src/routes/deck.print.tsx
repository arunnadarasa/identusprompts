import { createFileRoute } from "@tanstack/react-router";
import { SLIDES, TOTAL_SLIDES } from "@/components/slides/registry";

const title = "Print handout — Identus community-call deck";
const description =
  "Printable handout of the Identus community-call deck: Catalyst, Identus Hub / NHS, and IPS Compass.";

export const Route = createFileRoute("/deck/print")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeckPrint,
});

function DeckPrint() {
  return (
    <div className="bg-background">
      <div className="print-hide border-b border-border px-6 py-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
        Cmd/Ctrl + P → Save as PDF · one slide per page
      </div>
      <div className="flex flex-col items-center">
        {SLIDES.map((s, i) => {
          const C = s.Component;
          return (
            <div
              key={s.id}
              className="print-slide origin-top-left"
              style={{ width: 1920, height: 1080 }}
            >
              <C page={i + 1} total={TOTAL_SLIDES} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
