import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { ALL_IDEAS, type Idea } from "@/data/ideas";
import { speakPitch } from "@/lib/tts.functions";

export const Route = createFileRoute("/showcase/pitch-reader")({
  head: () => ({
    meta: [
      { title: "Pitch Reader — Showcase Vol. 01" },
      {
        name: "description",
        content:
          "A live ElevenLabs TTS demo built in one Lovable prompt. Tap any pitch and hear it spoken aloud.",
      },
      { property: "og:title", content: "Pitch Reader — Showcase Vol. 01" },
      {
        property: "og:description",
        content:
          "Proof the 5-credit budget works: a single Lovable build streams real ElevenLabs voice for any idea in the index.",
      },
    ],
  }),
  component: PitchReader,
});

// One curated pick per discipline so the page stays fast and varied.
const FEATURED_THEMES = [
  "music",
  "dance",
  "writing",
  "film-animation",
  "games",
  "fashion",
] as const;

function pickFeatured(): Idea[] {
  const out: Idea[] = [];
  for (const theme of FEATURED_THEMES) {
    const pick = ALL_IDEAS.find((i) => i.theme === theme);
    if (pick) out.push(pick);
  }
  return out;
}

type RowState = "idle" | "loading" | "playing";

function PitchReader() {
  const ideas = pickFeatured();
  const speak = useServerFn(speakPitch);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [state, setState] = useState<RowState>("idle");
  const [error, setError] = useState<{ id: string; msg: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  };

  const onPlay = async (idea: Idea) => {
    setError(null);
    if (activeId === idea.id && state === "playing") {
      stop();
      setActiveId(null);
      setState("idle");
      return;
    }
    stop();
    setActiveId(idea.id);
    setState("loading");
    try {
      const { audio } = await speak({
        data: { text: `${idea.title}. ${idea.pitch}` },
      });
      const el = new Audio(`data:audio/mpeg;base64,${audio}`);
      audioRef.current = el;
      el.onended = () => {
        setActiveId((cur) => (cur === idea.id ? null : cur));
        setState("idle");
      };
      await el.play();
      setState("playing");
    } catch (e) {
      setError({ id: idea.id, msg: e instanceof Error ? e.message : "Voice failed" });
      setActiveId(null);
      setState("idle");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <span className="eyebrow">Showcase · Vol. 01 · Pitch Reader</span>
      <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
        Hear any <span className="italic text-primary">pitch</span>, spoken aloud.
      </h1>
      <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
        Six ideas, one button each, streamed through ElevenLabs in real time. This
        page was shipped in a <span className="text-foreground">single Lovable prompt</span> —
        proof that the 5-credit budget is enough for a working voice demo.
      </p>

      <ul className="mt-12 divide-y divide-border border-y border-border">
        {ideas.map((idea) => {
          const isActive = activeId === idea.id;
          const rowState: RowState = isActive ? state : "idle";
          const label =
            rowState === "loading"
              ? "Loading…"
              : rowState === "playing"
                ? "■ Stop"
                : "▶ Hear the pitch";
          return (
            <li key={idea.id} className="py-6 sm:py-7 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
              <div className="flex-1 min-w-0">
                <div className="eyebrow text-primary/80">{idea.theme.replace("-", " · ")}</div>
                <h2 className="font-display text-2xl sm:text-3xl mt-2 leading-tight">
                  {idea.title}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {idea.pitch}
                </p>
                {error && error.id === idea.id && (
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-destructive">
                    {error.msg}
                  </p>
                )}
              </div>
              <button
                onClick={() => onPlay(idea)}
                disabled={rowState === "loading"}
                className="shrink-0 self-start px-5 py-2.5 border border-primary/50 text-[11px] tracking-[0.28em] uppercase font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300 disabled:opacity-60 disabled:cursor-wait"
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-12 text-xs uppercase tracking-[0.28em] text-muted-foreground">
        Built in 1 prompt · ElevenLabs connector · Lovable
      </p>
    </div>
  );
}