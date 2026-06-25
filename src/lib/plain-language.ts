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
  "aisa-chat": ({ sub, who }) =>
    `${cap(sub)} gets a frontier-model brain: a server function calls AIsa's LLM router and ${who} read a tailored, on-brand answer they can act on.`,
  "aisa-image": ({ sub, who }) =>
    `${cap(who)} type a brief and AIsa renders a fresh image for ${sub} in seconds — moodboard, cover, scene, or poster, ready to drop into the work.`,
  "aisa-video": ({ sub, who }) =>
    `${cap(who)} describe the moment and AIsa's video models stitch a short reel for ${sub} — motion sketch, loop, or scene block — playable on the page.`,
  "aisa-skills": ({ sub, who }) =>
    `${cap(who)} ask a question and AIsa pulls live web/search signal first, then has an LLM synthesise a sourced answer for ${sub} — research, not invention.`,
};

export function getPlainProposition(idea: Idea, theme: Theme): string {
  const ctx: Ctx = {
    sub: idea.subDiscipline,
    who: audienceWord(theme.audience),
  };
  const tmpl = templates[idea.quantumHookId];
  if (tmpl) return tmpl(ctx);
  return `AIsa runs the kernel server-side and ${ctx.who} get a result they can act on without leaving the app.`;
}
