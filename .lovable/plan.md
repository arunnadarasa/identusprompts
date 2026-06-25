## Plan

1. **Verify the generator path, not the balance assumption**
   - Re-check that `AISA_API_KEY` is available without printing it.
   - Run the existing AIsa regeneration again from a clean checkpoint.
   - If the API still rejects a batch, capture the status/body shape and fix the request format before assuming credits are exhausted.

2. **Finish the voice-native idea rewrite**
   - Regenerate all idea titles, pitches, audience framing, rationale, and mega-prompts as native Creative AI apps.
   - Remove residual web3/blockchain concepts rather than merely replacing terms.
   - Ensure every concept uses **Lovable AI as the brain** and **ElevenLabs as the voice/audio layer**.

3. **Keep the 5-credit participant constraint baked in**
   - Every mega-prompt remains one-shot scoped: one route, minimal UI, no auth/database/uploads unless absolutely required.
   - Each app uses one primary voice surface: TTS, conversational agent, realtime speech input, or music/SFX.
   - Translation is included only where it fits the use case, such as coaching, narration, education, accessibility, and multilingual audiences.

4. **Clean up generator/template duplication**
   - Remove the duplicate old body templates from `scripts/rewrite_mega_prompts.py`.
   - Keep the new Lovable AI Gateway + ElevenLabs connector instructions as the only prompt template path.

5. **Refresh supporting app copy**
   - Update `src/lib/plain-language.ts` and idea detail copy so the catalog reads as AI-native, not blockchain-retrofitted.
   - Ensure the required key guidance emphasizes the ElevenLabs connector and Lovable AI availability.

6. **Validate the output**
   - Search the regenerated JSON for banned blockchain/web3 residue.
   - Spot-check several themes, including the dance nutrition/advice example, to confirm ideas feel like native Creative AI apps.
   - Run the relevant verification/build check after regeneration.