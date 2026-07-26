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
  "sprite-create": ({ sub, who }) =>
    `${cap(who)} tap once and a fresh public micro-VM spins up for ${sub} — the app hands them a shareable Sprite URL in seconds, no infra to configure.`,
  "sprite-fs": ({ sub, who }) =>
    `${cap(who)} compose the piece for ${sub}, the app writes the finished HTML and assets straight into a running Sprite, and everyone opens a real live URL.`,
  "sprite-service": ({ sub, who }) =>
    `${cap(who)} boot a long-running service inside a Sprite for ${sub} — the process wakes on the first visit, streams to the browser, and sleeps when the room clears.`,
  "sprite-exec": ({ sub, who }) =>
    `${cap(who)} run a shell command inside a Sprite for ${sub} and watch the stdout stream back — ffmpeg, imagemagick, a python one-liner — in an isolated micro-VM they never had to install.`,
};

export function getPlainProposition(idea: Idea, theme: Theme): string {
  const ctx: Ctx = {
    sub: idea.subDiscipline,
    who: audienceWord(theme.audience),
  };
  const tmpl = templates[idea.quantumHookId];
  if (tmpl) return tmpl(ctx);
  return `Sprites runs the primitive server-side and ${ctx.who} get a live sandbox URL they can share without leaving the app.`;
}
