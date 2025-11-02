'use server';

/**
 * @fileOverview Provides task suggestions based on customer name or order details.
 *
 * - generateTaskSuggestions - A function that suggests task descriptions based on input.
 * - GenerateTaskSuggestionsInput - The input type for the generateTaskSuggestions function.
 * - GenerateTaskSuggestionsOutput - The return type for the generateTaskSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskSuggestionsInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  orderDetails: z.string().describe('Details of the order, including items and quantity.'),
});
export type GenerateTaskSuggestionsInput = z.infer<typeof GenerateTaskSuggestionsInputSchema>;

const GenerateTaskSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested task descriptions.'),
});
export type GenerateTaskSuggestionsOutput = z.infer<typeof GenerateTaskSuggestionsOutputSchema>;

export async function generateTaskSuggestions(input: GenerateTaskSuggestionsInput): Promise<GenerateTaskSuggestionsOutput> {
  return generateTaskSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaskSuggestionsPrompt',
  input: {schema: GenerateTaskSuggestionsInputSchema},
  output: {schema: GenerateTaskSuggestionsOutputSchema},
  config: {
    model: 'gemini-1.5-flash-latest',
  },
  prompt: `You are an expert assistant for artisans, helping them manage their tasks efficiently.\n\n  Based on the customer's name and order details, suggest a few common task descriptions that the artisan might need to perform.\n  Provide at least 3 suggestions. Be as specific as possible.\n  Customer Name: {{{customerName}}}\n  Order Details: {{{orderDetails}}}`,
});

const generateTaskSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateTaskSuggestionsFlow',
    inputSchema: GenerateTaskSuggestionsInputSchema,
    outputSchema: GenerateTaskSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
