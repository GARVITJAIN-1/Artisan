'use server';
/**
 * @fileOverview Finds relevant places for artisans to sell products or buy materials using an AI model.
 *
 * - findPlaces - A function that returns a list of relevant places.
 * - FindPlacesInput - The input type for the findPlaces function.
 * - FindPlacesOutput - The return type for the findPlaces function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Place } from '@/lib/types';

const FindPlacesInputSchema = z.object({
  query: z.string().describe('The product to sell or material to buy.'),
  city: z.string().describe('The city to search for places in.'),
  mode: z.enum(['sell', 'buy']).describe('Whether the user wants to sell a product or buy a material.'),
});
export type FindPlacesInput = z.infer<typeof FindPlacesInputSchema>;

const FindPlacesOutputSchema = z.object({
  places: z.array(
    z.object({
      name: z.string().describe("The name of the shop or business."),
      address: z.string().describe("The full address of the shop."),
      // lat and lon are removed as the model won't reliably provide them.
      // The address can be used for a map link.
    })
  ).describe('A list of up to 10 relevant places.'),
});
export type FindPlacesOutput = z.infer<typeof FindPlacesOutputSchema>;

export async function findPlaces(input: FindPlacesInput): Promise<FindPlacesOutput> {
  return findPlacesFlow(input);
}

const prompt = ai.definePrompt({
    name: 'findPlacesPrompt',
    input: { schema: FindPlacesInputSchema },
    output: { schema: FindPlacesOutputSchema },
    prompt: `You are an expert assistant and local market researcher for artisans. Your goal is to find highly relevant, real-world physical stores for them in a specific city.

The user is in '{{mode}}' mode and is in the city of '{{city}}'.
The item they are interested in is '{{query}}'.

1.  **Analyze the Request**:
    -   If the mode is 'sell', identify the types of stores that would be the best fit to sell "{{query}}". Think about independent boutiques, specialty stores, gift shops, or art galleries. Avoid large chain stores unless they have a known local artisan section.
    -   If the mode is 'buy', identify the types of stores where an artisan would source "{{query}}". Think about art supply stores, craft stores, specialty material suppliers, or wholesalers.

2.  **Find Real Shops**: Based on your analysis, search your knowledge for up to 10 real, existing shops in {{city}} that match these types. For each shop, provide its name and full street address. Do not invent shops.

Return a list of these places.
`,
});

const findPlacesFlow = ai.defineFlow(
  {
    name: 'findPlacesFlow',
    inputSchema: FindPlacesInputSchema,
    outputSchema: z.object({
        places: z.array(z.object({
            name: z.string(),
            address: z.string(),
            lat: z.number().optional(), // Make lat/lon optional as model won't provide it
            lon: z.number().optional(),
        }))
    }),
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output || !output.places) {
        return { places: [] };
    }
    
    const uniquePlaces = output.places.reduce((acc: Place[], current: Place) => {
        if (!acc.find((item) => item.address === current.address)) {
            // Add optional lat/lon for type compatibility, though they won't exist
            acc.push({ ...current, lat: 0, lon: 0 });
        }
        return acc;
    }, []);

    return { places: uniquePlaces };
  }
);
