import type { Idea, Theme } from "@/data/ideas";

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function audienceWord(audience: string): string {
  const first = audience.split(",")[0]?.trim() ?? "users";
  return first.toLowerCase();
}

type Ctx = { sub: string; who: string };

const templates: Record<string, (ctx: Ctx) => string> = {
  "tts-narration": ({ sub, who }) =>
    `${cap(sub)} gets its own broadcast voice: a server function streams ElevenLabs text-to-speech back to the page, and ${who} hear lifelike narration without leaving the app.`,
  "voice-agent": ({ sub, who }) =>
    `${cap(who)} press a microphone button and hold a real-time, back-and-forth conversation with an ElevenLabs agent tuned for ${sub} — WebRTC under the hood, no transcripts to read.`,
  "realtime-stt": ({ sub, who }) =>
    `${cap(who)} speak; the ElevenLabs scribe model streams live captions back as they go, finalizing each line during the natural pauses in ${sub}.`,
  "music-sfx": ({ sub, who }) =>
    `${cap(who)} type a short prompt and ElevenLabs conjures a fitting sound effect or music bed for ${sub} on demand, ready to drop into the timeline.`,
};

export function getPlainProposition(idea: Idea, theme: Theme): string {
  const ctx: Ctx = {
    sub: idea.subDiscipline,
    who: audienceWord(theme.audience),
  };
  const tmpl = templates[idea.quantumHookId];
  if (tmpl) return tmpl(ctx);
  return `The voice primitive runs at the right moment in the flow and gives ${ctx.who} an audible, real-time result they can act on without leaving the app.`;
}
