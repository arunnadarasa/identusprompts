import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CopyButton } from "@/components/copy-button";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Build strategy — real voice demos in one Lovable build" },
      { name: "description", content: "How to ship a streaming-voice ElevenLabs demo in a single Lovable build: one secret, one paste, TanStack server function, useConversation client, no infra." },
      { property: "og:title", content: "Real voice in one Lovable build" },
      { property: "og:description", content: "Build-time pattern for Lovable + ElevenLabs hackathon entries." },
    ],
  }),
  component: StrategyPage,
});

const TTS_SNIPPET = `// src/lib/tts.functions.ts — TanStack server function that streams ElevenLabs TTS
// Built during the Creative AI & Quantum Hackathon — StreetKode Fam · Indian Krump Festival 14
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const speak = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ text: z.string().min(1).max(4000) }).parse(d))
  .handler(async ({ data }) => {
    const r = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb/stream?output_format=mp3_44100_128",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: data.text, model_id: "eleven_turbo_v2_5" }),
      },
    );
    if (!r.ok) throw new Error(\`TTS failed: \${r.status}\`);
    const buf = await r.arrayBuffer();
    return { audio: Buffer.from(buf).toString("base64") };
  });
`;

const AGENT_SNIPPET = `// src/components/voice-agent.tsx — useConversation over WebRTC
import { useConversation } from "@elevenlabs/react";
import { useServerFn } from "@tanstack/react-start";
import { mintAgentToken } from "@/lib/agent.functions";

export function VoiceAgent({ agentId }: { agentId: string }) {
  const getToken = useServerFn(mintAgentToken);
  const c = useConversation();
  const start = async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const { token } = await getToken({ data: { agentId } });
    await c.startSession({ conversationToken: token, connectionType: "webrtc" });
  };
  return c.status === "connected"
    ? <button onClick={() => c.endSession()}>End conversation</button>
    : <button onClick={start}>Start conversation</button>;
}
`;

const MUSIC_SNIPPET = `// src/lib/music.functions.ts — generate music or a sound effect on demand
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const conjureSfx = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ prompt: z.string(), seconds: z.number().min(0.5).max(22).optional() }).parse(d))
  .handler(async ({ data }) => {
    const r = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "Content-Type": "application/json" },
      body: JSON.stringify({ text: data.prompt, duration_seconds: data.seconds ?? 5, prompt_influence: 0.3 }),
    });
    const buf = await r.arrayBuffer();
    return { audio: Buffer.from(buf).toString("base64") };
  });
`;

const RECIPE = `# 1. In your Lovable project, add the single required secret (Settings -> Secrets):
ELEVENLABS_API_KEY=sk_...        # https://elevenlabs.io/app/settings/api-keys

# 2. Copy a mega-prompt from this repo into Lovable. One paste:
#    - scaffolds the React + TanStack Start app
#    - writes a server function that proxies ElevenLabs (TTS / agents / scribe / music)
#    - wires the client hook (useConversation / useScribe / <audio>) for the chosen kernel
#    - includes the hackathon credit in the footer and in JSDoc on the server fn

# 3. Hit play. Your demo is streaming real voice from ElevenLabs.
`;

function StrategyPage() {
  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-5 pt-14 pb-20">
        <div className="eyebrow text-primary mb-4">build strategy · voice</div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[0.95] tracking-tight text-foreground">
          Real voice, <span className="text-primary italic">one key</span>, one build.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed font-light">
          Every mega-prompt in this repo uses the same pattern, because it's the
          only pattern that lets a Lovable account ship a streaming ElevenLabs demo in one shot.
        </p>

        <section className="mt-10 p-6 border border-primary/30 bg-card">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Why ElevenLabs and not a stock browser voice?</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-light">
            The browser's built-in speechSynthesis sounds like 2007. ElevenLabs gives you broadcast-grade
            voices, multilingual models, low-latency turbo streaming, conversational agents over WebRTC,
            realtime scribe transcripts with word timestamps, and on-demand music + sound effects — all
            behind one HTTP API and one secret. That is the difference between a demo and a presentation
            that actually opens with sound.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">The recipe</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">recipe</span>
            <CopyButton text={RECIPE} label="Copy recipe" />
          </div>
          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-[12px] sm:text-[13px] leading-relaxed p-4 sm:p-5 max-w-full overflow-x-hidden border border-border bg-card text-foreground/90">{RECIPE}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">1. The TTS server function</h2>
          <p className="text-sm text-muted-foreground mb-3 font-light">
            Every prompt in the library follows the same shape: keep the API key on the server
            with a TanStack <code>createServerFn</code>, forward the body to ElevenLabs, return
            base64 audio (or pipe the SSE stream) to the client.
          </p>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">src/lib/tts.functions.ts</span>
            <CopyButton text={TTS_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-[11px] sm:text-[12px] leading-relaxed p-4 sm:p-5 max-w-full overflow-x-hidden border border-border bg-card text-foreground/90">{TTS_SNIPPET}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">2. Conversational agent on the client</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">src/components/voice-agent.tsx</span>
            <CopyButton text={AGENT_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-[11px] sm:text-[12px] leading-relaxed p-4 sm:p-5 max-w-full overflow-x-hidden border border-border bg-card text-foreground/90">{AGENT_SNIPPET}</pre>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3 text-foreground italic">3. Music &amp; SFX on demand</h2>
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow text-primary">src/lib/music.functions.ts</span>
            <CopyButton text={MUSIC_SNIPPET} label="Copy" />
          </div>
          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-[11px] sm:text-[12px] leading-relaxed p-4 sm:p-5 max-w-full overflow-x-hidden border border-border bg-card text-foreground/90">{MUSIC_SNIPPET}</pre>
        </section>

        <section className="mt-10 p-6 border border-border bg-card">
          <h2 className="font-display text-xl font-semibold text-foreground italic">Hackathon rules of thumb</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground font-light">
            <li>· One mega-prompt = one build message. Don't iterate the architecture, iterate the UI.</li>
            <li>· Keep the API key on the server. Browsers do not touch <code>xi-api-key</code>.</li>
            <li>· Stream by default. <code>eleven_turbo_v2_5</code> for chat-speed playback, <code>eleven_multilingual_v2</code> when quality matters more than latency.</li>
            <li>· Always show a microphone permission UX before opening realtime hooks, or browsers will silently block them.</li>
            <li>· Add a "Built during the Creative AI &amp; Quantum Hackathon — StreetKode Fam · Indian Krump Festival 14" line to your footer.</li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/themes" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold hover:bg-foreground transition">
            Pick an idea →
          </Link>
          <Link to="/quantum-primer" className="px-5 py-2.5 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition">
            Voice primer
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}
