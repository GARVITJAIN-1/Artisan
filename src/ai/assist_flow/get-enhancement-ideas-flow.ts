
'use server';

/**
 * @fileOverview Generates personalized product enhancement ideas for artisans based on their product description, and provides a Google search query for each idea.
 *
 * - getEnhancementIdeas - A function that returns a list of enhancement ideas with search queries.
 * - GetEnhancementIdeasInput - The input type for the getEnhancementIdeas function.
 * - GetEnhancementIdeasOutput - The return type for the getEnhancementIdeasOutput function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetEnhancementIdeasInputSchema = z.object({
  productName: z.string().describe("The name or type of the artisan's product."),
  productDescription: z.string().describe("A brief description of the artisan's product."),
});
export type GetEnhancementIdeasInput = z.infer<typeof GetEnhancementIdeasInputSchema>;

const GetEnhancementIdeasOutputSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string().describe('A catchy title for the enhancement idea.'),
        description: z
          .string()
          .describe('A detailed but concise (1-2 sentences) description of the idea, explaining the enhancement and why it would appeal to current market trends.'),
        googleSearchQuery: z.string().describe("A concise Google search query that will return inspirational images for this idea."),
      })
    )
    .min(3)
    .max(3)
    .describe('A list of 3 distinct and creative product enhancement ideas, each with a title, description, and a Google search query.'),
});
export type GetEnhancementIdeasOutput = z.infer<typeof GetEnhancementIdeasOutputSchema>;

export async function getEnhancementIdeas(input: GetEnhancementIdeasInput): Promise<GetEnhancementIdeasOutput> {
  return getEnhancementIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getEnhancementIdeasPrompt',
  input: { schema: GetEnhancementIdeasInputSchema },
  output: { schema: GetEnhancementIdeasOutputSchema },
  prompt: `You are an expert product designer and marketing strategist specializing in the artisan and handmade goods sector. Your goal is to provide innovative, out-of-the-box ideas.

An artisan has provided the following information about their product:
- Product Name: {{productName}}
- Product Description: {{productDescription}}

Your task is to:
1.  Analyze the artisan's product based on the provided description.
2.  Research current market trends and think beyond the obvious.
3.  Generate 3 distinct, creative, and actionable enhancement ideas. Avoid simple variations. Think about new materials, collaborations, unique use cases, or blending different art forms.
4.  For each idea, provide a catchy title and a **concise (1-2 sentences)** description explaining the enhancement and its market potential.
5.  For each idea, create an effective Google search query that would return high-quality, inspirational images. For example, if the idea is "Collaborate with a local poet to inscribe verses onto mugs", a good query would be "ceramic mug with handwritten poetry".
`,
});

const getEnhancementIdeasFlow = ai.defineFlow(
  {
    name: 'getEnhancementIdeasFlow',
    inputSchema: GetEnhancementIdeasInputSchema,
    outputSchema: GetEnhancementIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.ideas) {
        throw new Error("Failed to generate enhancement ideas.");
    }
    return output;
  }
);
