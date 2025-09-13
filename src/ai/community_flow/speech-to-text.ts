
'use server';
/**
 * @fileOverview A speech-to-text AI agent.
 *
 * - speechToText - A function that handles audio transcription.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

import { Buffer } from 'buffer';

export async function speechToText(audioDataUri: string): Promise<{ text: string }> {
  return speechToTextFlow(audioDataUri);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ text: z.string() }),
  },
  async (audioDataUri) => {
    // Gemini 1.5 Flash model for speech-to-text currently only supports WAV.
    // We get webm from the browser, so we need to convert it.
    // For now, let's assume the client sends WAV until we can add conversion.
    
    // Note: The ideal model for this is a dedicated speech-to-text model,
    // but we'll use a multimodal model here for demonstration.
    const { text } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: [
        { media: { url: audioDataUri } },
        { text: 'Transcribe the spoken words in this audio file. Only return the transcribed text.' },
      ],
      config: {
        // Higher temperature can be better for creative tasks, but for transcription,
        // we want more deterministic output.
        temperature: 0.1, 
      }
    });

    return { text: text.trim() };
  }
);
