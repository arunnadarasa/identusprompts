import modesData from "./modes.json";

export type AgentMode = {
  id: "simulated" | "docker" | "fly";
  name: string;
  tag: string;
  blurb: string;
  when: string;
  secrets: string[];
  setup: string;
  gotchas: string;
};

export const MODES: AgentMode[] = modesData as AgentMode[];

export const DEFAULT_MODE: AgentMode["id"] = "simulated";

export function getMode(id: string): AgentMode {
  return MODES.find((m) => m.id === id) ?? MODES[0]!;
}

export const MODE_TOKEN = "<<MODE_BLOCK>>";

/** Substitute the selected agent mode into a stored mega-prompt. */
export function composeMegaPrompt(megaPrompt: string, modeId: string): string {
  const mode = getMode(modeId);
  const block = `${mode.setup}\n\nMODE GOTCHAS\n${mode.gotchas}`;
  return megaPrompt.includes(MODE_TOKEN)
    ? megaPrompt.replace(MODE_TOKEN, block)
    : `${megaPrompt}\n\n${block}`;
}

export const SECRET_NOTES: Record<string, { note: string; href: string }> = {
  AGENT_BASE_URL: {
    note: "The base URL of your Identus Cloud Agent. Local compose stack: http://localhost:8085/cloud-agent. Fly deploy: https://<app>.fly.dev with NO /cloud-agent suffix.",
    href: "https://identus.io/documentation/develop/",
  },
  AGENT_API_KEY: {
    note: "The agent's wallet API key (DEFAULT_WALLET_AUTH_API_KEY), sent as the `apikey` header. Server-side only — never expose it to the browser.",
    href: "https://github.com/hyperledger-identus/cloud-agent",
  },
};
