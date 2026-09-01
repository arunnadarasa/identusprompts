import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ScaledSlide } from "./scaled-slide";
import { SLIDES, TOTAL_SLIDES } from "./registry";

export function DeckViewer({ index }: { index: number }) {
  const navigate = useNavigate();
  const [grid, setGrid] = useState(false);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_SLIDES - 1, next));
      navigate({ to: "/deck/$slide", params: { slide: String(clamped + 1) } });
    },
    [navigate],
  );

  useEffect(() => {
    const slide = SLIDES[index];
    if (slide) document.title = `${index + 1}/${TOTAL_SLIDES} — ${slide.title}`;
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key.toLowerCase() === "g") {
        setGrid((g) => !g);
      } else if (e.key === "Escape") {
        setGrid(false);
      } else if (e.key === "F5") {
        e.preventDefault();
        void document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const Current = SLIDES[Math.max(0, Math.min(TOTAL_SLIDES - 1, index))]!.Component;

  if (grid) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="eyebrow">All slides — press G to close</span>
          <button
            onClick={() => setGrid(false)}
            className="border border-border px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-primary"
          >
            Close
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          {SLIDES.map((s, i) => {
            const C = s.Component;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setGrid(false);
                  go(i);
                }}
                className={`group relative aspect-video w-full overflow-hidden border text-left ${
                  i === index ? "border-primary" : "border-border"
                }`}
              >
                <ScaledSlide>
                  <C page={i + 1} total={TOTAL_SLIDES} />
                </ScaledSlide>
                <span className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  {i + 1}. {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background">
      <div className="relative min-h-0 flex-1">
        <ScaledSlide>
          <Current page={index + 1} total={TOTAL_SLIDES} />
        </ScaledSlide>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-4 py-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        <div className="flex items-center gap-2">
          <button
            onClick={() => go(index - 1)}
            className="border border-border px-3 py-2 hover:text-primary"
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            onClick={() => go(index + 1)}
            className="border border-border px-3 py-2 hover:text-primary"
            aria-label="Next slide"
          >
            →
          </button>
          <span className="ml-2">
            {index + 1} / {TOTAL_SLIDES}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGrid(true)} className="border border-border px-3 py-2 hover:text-primary">
            Grid (G)
          </button>
          <a href="/deck/print" className="border border-border px-3 py-2 hover:text-primary">
            Print
          </a>
          <button
            onClick={() => void document.documentElement.requestFullscreen?.()}
            className="border border-primary/60 px-3 py-2 text-primary"
          >
            Present
          </button>
        </div>
      </div>
    </div>
  );
}
