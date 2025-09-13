
'use server';
/**
 * @fileOverview A voice navigation AI agent.
 *
 * - navigateWithVoice - A function that handles voice-based navigation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

export async function navigateWithVoice(audioDataUri: string): Promise<{ path: string }> {
  return voiceNavigationFlow(audioDataUri);
}

const voiceNavigationFlow = ai.defineFlow(
  {
    name: 'voiceNavigationFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ path: z.string().describe("The URL path to navigate to, e.g., '/journal'. Should be one of: '/', '/challenges', '/journal', '/profile', or 'unknown'.") }),
  },
  async (audioDataUri) => {
    
    const { text } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: [
        { media: { url: audioDataUri } },
        { text: 'Transcribe the spoken words in this audio file. Only return the transcribed text.' },
      ],
      config: {
        temperature: 0.1, 
      }
    });

    const transcribedText = text.trim().toLowerCase();

    const { output } = await ai.generate({
        prompt: `You are a website navigation assistant. Based on the user's request, determine which page they want to go to. The available pages are Home, Challenges, Journal, and Profile. Respond with the corresponding URL path. For example, if the user says "Go to my journal", you should respond with "/journal". If you can't determine the page, respond with "unknown". User request: "${transcribedText}"`,
        output: {
            schema: z.object({ path: z.string() })
        },
        model: googleAI.model('gemini-1.5-flash'),
        config: {
            temperature: 0.1
        }
    });

    if (output) {
      const path = output.path.toLowerCase();
      if (path.includes('journal')) return { path: '/journal' };
      if (path.includes('challenge')) return { path: '/challenges' };
      if (path.includes('profile')) return { path: '/profile' };
      if (path.includes('home')) return { path: '/' };
    }

    return { path: 'unknown' };
  }
);
