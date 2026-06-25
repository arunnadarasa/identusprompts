import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { critiquePitch } from "@/lib/aisa-chat.functions";

export const Route = createFileRoute("/showcase/pitch-critic")({
  head: () => ({
    meta: [
      { title: "Pitch Critic — AIsa Showcase Vol. 01" },
      {
        name: "description",
        content:
          "A live AIsa demo built in one Lovable prompt. Paste a pitch and get a sharp markdown critique back.",
      },
      { property: "og:title", content: "Pitch Critic — AIsa Showcase Vol. 01" },
      {
        property: "og:description",
        content:
          "Proof the 5-credit budget works: a single Lovable build calls AIsa to critique any pitch.",
      },
    ],
  }),
  component: PitchCritic,
});

const EXAMPLE =
  "Krump Fuel Coach: a one-page app that writes a personalised pre-session nutrition plan for krump dancers based on their training schedule and dietary prefs.";

function PitchCritic() {
  const critique = useServerFn(critiquePitch);
  const [pitch, setPitch] = useState(EXAMPLE);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onRun = async () => {
    setError(null);
    setReply(null);
    setBusy(true);
    try {
      const { critique: out } = await critique({ data: { pitch: pitch.trim() } });
      setReply(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AIsa request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <span className="eyebrow">Showcase · Vol. 01 · Pitch Critic</span>
      <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05]">
        Sharpen your <span className="italic text-primary">pitch</span> with AIsa.
      </h1>
      <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
        Paste any one-liner project pitch. A TanStack server function calls{" "}
        <span className="text-foreground">AIsa Chat Completions</span> (gpt-4o-mini)
        and returns a structured markdown critique. Shipped in a{" "}
        <span className="text-foreground">single Lovable prompt</span> to prove the
        5-credit budget is enough for a working AIsa demo.
      </p>

      <div className="mt-10 border border-border bg-card p-5 sm:p-6">
        <label htmlFor="pitch" className="eyebrow block mb-3">
          Your pitch
        </label>
        <textarea
          id="pitch"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          rows={5}
          className="w-full bg-background border border-border p-3 text-sm sm:text-base text-foreground focus:outline-none focus:border-primary/60 resize-y"
          placeholder="A one or two sentence pitch…"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground">
            {pitch.length.toLocaleString()} chars
          </span>
          <button
            onClick={onRun}
            disabled={busy || pitch.trim().length < 10}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-[11px] tracking-[0.28em] uppercase font-semibold hover:bg-foreground transition-colors duration-500 disabled:opacity-60 disabled:cursor-wait"
          >
            {busy ? "Asking AIsa…" : "Critique it"}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-destructive">
            {error}
          </p>
        )}
      </div>

      {reply && (
        <div className="mt-10 border border-primary/40 bg-card p-5 sm:p-8">
          <span className="eyebrow text-primary">AIsa · openai/gpt-4o-mini</span>
          <div className="prose prose-invert prose-sm sm:prose-base mt-3 max-w-none whitespace-pre-wrap break-words text-foreground/90 font-light leading-relaxed">
            {reply}
          </div>
        </div>
      )}

      <p className="mt-12 text-xs uppercase tracking-[0.28em] text-muted-foreground">
        Built in 1 prompt · AIsa API · Lovable
      </p>
    </div>
  );
}
