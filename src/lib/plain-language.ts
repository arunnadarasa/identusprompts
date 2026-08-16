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
  "identus-did": ({ sub, who }) =>
    `${cap(who)} tap once and the app mints a published did:prism for ${sub} — a decentralised identifier they own outright, resolvable by anyone, portable off this platform the day they leave it.`,
  "identus-connection": ({ sub, who }) =>
    `${cap(who)} scan an invitation and two wallets settle into a private DIDComm channel for ${sub} — mutually authenticated, no accounts, no email addresses handed over.`,
  "identus-credential": ({ sub, who }) =>
    `${cap(who)} press issue and the fact at the heart of ${sub} becomes a signed verifiable credential in the recipient's wallet — theirs to keep, present and reuse anywhere.`,
  "identus-verify": ({ sub, who }) =>
    `${cap(who)} request a proof and the holder answers from their wallet for ${sub} — the gate turns green on the predicate alone, with no personal data copied into your database.`,
};

export function getPlainProposition(idea: Idea, theme: Theme): string {
  const ctx: Ctx = {
    sub: idea.subDiscipline,
    who: audienceWord(theme.audience),
  };
  const tmpl = templates[idea.quantumHookId];
  if (tmpl) return tmpl(ctx);
  return `The Identus Cloud Agent handles the identity work server-side and ${ctx.who} get verifiable proof they can carry anywhere.`;
}
