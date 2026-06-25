import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * AIsa Pitch Critic — proves the 5-credit / one-shot budget on AIsa.
 * Sends the pitch to AIsa's OpenAI-compatible chat completions endpoint
 * and returns a short markdown critique.
 *
 * Built during the AIsa Creative Hackathon — StreetKode Fam · Indian Krump Festival 14
 */
const Input = z.object({
  pitch: z.string().min(10).max(2000),
});

const SYSTEM = `You are a sharp, kind hackathon judge. Given a one-liner project pitch,
respond in markdown with exactly these sections:

**Hook** — one sentence on why this could land.
**Risks** — two concrete weaknesses.
**Sharpen** — three specific tweaks to make the pitch unmistakable.

Keep the whole reply under 160 words. No preamble. No emoji.`;

export const critiquePitch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.AISA_API_KEY;
    if (!apiKey) throw new Error("AISA_API_KEY is not configured");

    const res = await fetch("https://api.aisa.one/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: data.pitch },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      if (res.status === 402) throw new Error("AIsa balance exhausted — top up at console.aisa.one.");
      if (res.status === 429) throw new Error("AIsa is rate limiting — try again shortly.");
      throw new Error(`AIsa failed (${res.status}). ${detail.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const critique = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!critique) throw new Error("AIsa returned an empty response.");
    return { critique };
  });
