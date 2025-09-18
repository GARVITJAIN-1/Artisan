'use server';

/**
 * @fileOverview Suggests a selling price for a given product in a specified currency.
 *
 * - getPriceSuggestion - A function that returns a suggested price range.
 * - GetPriceSuggestionInput - The input type for the getPriceSuggestion function.
 * - GetPriceSuggestionOutput - The return type for the getPriceSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPriceSuggestionInputSchema = z.object({
    product: z.string().describe('The artisanal product to be priced (e.g., "handmade ceramic mug").'),
    currency: z.string().describe('The three-letter currency code (e.g., "USD", "INR", "EUR").'),
});
export type GetPriceSuggestionInput = z.infer<typeof GetPriceSuggestionInputSchema>;

const GetPriceSuggestionOutputSchema = z.object({
  priceRange: z.string().describe('The suggested selling price range for the product in the specified currency (e.g., "$15 - $25", "₹1200 - ₹1800").'),
  justification: z.string().describe('A brief justification for the suggested price range based on market research.'),
});
export type GetPriceSuggestionOutput = z.infer<typeof GetPriceSuggestionOutputSchema>;

export async function getPriceSuggestion(input: GetPriceSuggestionInput): Promise<GetPriceSuggestionOutput> {
  return getPriceSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPriceSuggestionPrompt',
  input: {schema: GetPriceSuggestionInputSchema},
  output: {schema: GetPriceSuggestionOutputSchema},
  prompt: `You are a pricing expert for artisanal and handmade goods.
Your task is to research the market and suggest a realistic selling price range for a given product.

Product: {{{product}}}
Currency: {{{currency}}}

Based on your research of similar products online, provide:
1.  A suggested price range in the specified currency. The format should be like "MIN - MAX" (e.g., "$25 - $40").
2.  A one-sentence justification explaining the price range, considering factors like materials, craftsmanship, and market demand.
`,
});

const getPriceSuggestionFlow = ai.defineFlow(
  {
    name: 'getPriceSuggestionFlow',
    inputSchema: GetPriceSuggestionInputSchema,
    outputSchema: GetPriceSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
