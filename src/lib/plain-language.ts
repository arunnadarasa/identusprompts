import type { Idea, Theme } from "@/data/ideas";

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function audienceWord(audience: string): string {
  // Take the first listed group, e.g. "choreographers, dancers, ..." -> "choreographers"
  const first = audience.split(",")[0]?.trim() ?? "users";
  return first.toLowerCase();
}

type Ctx = { sub: string; who: string };

const templates: Record<string, (ctx: Ctx) => string> = {
  "swap-test": ({ sub, who }) =>
    `Two ${sub} candidates go into a quantum similarity check; the app shows ${who} a single 0–100% match score so they can pick the closest one in a tap.`,
  "qtda": ({ sub, who }) =>
    `${cap(sub)} gets fed into a quantum shape-finder; ${who} see clusters, loops, and gaps drawn on top of their work instead of having to spot structure by eye.`,
  "amplitude-encoding": ({ sub, who }) =>
    `${cap(sub)} is encoded as a quantum vector and projected onto a 2D map; ${who} navigate the option space visually instead of guessing parameters.`,
  "grover": ({ sub, who }) =>
    `Instead of trying every combination, a quantum search jumps to a valid ${sub} configuration in a fraction of the tries and shows ${who} the winning pick with a confidence score.`,
  "qft": ({ sub, who }) =>
    `A quantum frequency analyzer scans ${sub} and surfaces the dominant cycles — rhythms and repetitions ${who} would otherwise miss — as simple bars.`,
  "quantum-walk": ({ sub, who }) =>
    `${cap(sub)} is laid out as a graph; a quantum walker explores it and lights up the most promising next step for ${who} to take.`,
  "vqe": ({ sub, who }) =>
    `${cap(who)} set a creative goal; a quantum optimizer tunes the ${sub} parameters until they converge, and returns the dialed-in knobs.`,
  "sampling": ({ sub, who }) =>
    `A quantum circuit acts as a creative dice-roll; each "regenerate" feeds fresh quantum noise into the ${sub} so ${who} get genuinely novel variants instead of recycled outputs.`,
  "phase-estimation": ({ sub, who }) =>
    `${cap(sub)} is matched against a target resonance using quantum phase estimation; ${who} see a single dial that snaps when alignment is strongest.`,
  "entanglement": ({ sub, who }) =>
    `Two ${who} share an entangled session: when one makes a move on the ${sub}, the other's side updates in correlated lockstep.`,
};

export function getPlainProposition(idea: Idea, theme: Theme): string {
  const ctx: Ctx = {
    sub: idea.subDiscipline,
    who: audienceWord(theme.audience),
  };
  const tmpl = templates[idea.quantumHookId];
  if (tmpl) return tmpl(ctx);
  return `Quantum results from the kernel are converted into a simple on-screen output that ${ctx.who} can act on directly — no quantum background required.`;
}