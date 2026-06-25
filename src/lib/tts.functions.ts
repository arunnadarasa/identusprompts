import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Pitch Reader — proves the 5-credit / one-shot budget.
 * Server function that calls ElevenLabs TTS via the standard connector
 * (ELEVENLABS_API_KEY) and returns base64-encoded MP3.
 */
const Input = z.object({
  text: z.string().min(1).max(2000),
  voiceId: z.string().min(1).optional(),
});

export const speakPitch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ElevenLabs is not connected to this project");
    }
    const voiceId = data.voiceId ?? "JBFqnCBsd6RMkjVDRZzb"; // George
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: data.text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      if (res.status === 402) throw new Error("ElevenLabs credits exhausted.");
      if (res.status === 429) throw new Error("Rate limited — try again shortly.");
      throw new Error(`Voice failed (${res.status}). ${detail.slice(0, 140)}`);
    }
    const buf = await res.arrayBuffer();
    return { audio: Buffer.from(buf).toString("base64") };
  });