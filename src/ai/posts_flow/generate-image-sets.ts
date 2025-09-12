'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating sets of marketing images with distinct visual themes.
 *
 * - generateImageSets - A function that generates marketing images with AI based on a product image and desired themes.
 * - GenerateImageSetsInput - The input type for the generateImageSets function.
 * - GenerateImageSetsOutput - The return type for the generateImageSets function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageSetsInputSchema = z.object({
  userImage: z
    .string()
    .describe(
      "A product image uploaded by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  theme1: z.string().describe('The first design theme (e.g., Earthy & Rustic).'),
  theme2: z.string().describe('The second design theme (e.g., Clean & Modern).'),
  optionalPrompt: z.string().optional().describe('Optional prompt for more details about the item.'),
});
export type GenerateImageSetsInput = z.infer<typeof GenerateImageSetsInputSchema>;

const GenerateImageSetsOutputSchema = z.object({
  imageSet1: z.array(z.string()).describe('URLs for the first set of 3 images.').length(3),
  imageSet2: z.array(z.string()).describe('URLs for the second set of 3 images.').length(3),
});
export type GenerateImageSetsOutput = z.infer<typeof GenerateImageSetsOutputSchema>;

export async function generateImageSets(input: GenerateImageSetsInput): Promise<GenerateImageSetsOutput> {
  return generateImageSetsFlow(input);
}

const generateImagePrompts = ai.definePrompt({
  name: 'generateImagePrompts',
  input: {schema: GenerateImageSetsInputSchema},
  output: {
    schema: z.object({
      prompts1: z.array(z.string()).length(3),
      prompts2: z.array(z.string()).length(3),
    }),
  },
  prompt: `You are an expert creative director. Based on the provided product image and notes, generate prompts for an image generation model. You need to create prompts for 2 distinct 'Design Sets' for a social media campaign. Each set must contain 3 thematically consistent 1080x1080 images.

Your response MUST be a JSON object with two keys: "prompts1" and "prompts2", each containing an array of 3 detailed string prompts for an image generation model.

Product Image: {{media url=userImage}}

{{#if optionalPrompt}}
Artisan's note: {{optionalPrompt}}
{{/if}}

Set 1 (Theme: '{{theme1}}'):
Image 1: A prompt for the full product on a background relevant to the theme.
Image 2: A prompt for a conceptual lifestyle shot showing the product in a context relevant to the theme.
Image 3: A prompt for a text-based graphic with a phrase relevant to the theme.

Set 2 (Theme: '{{theme2}}'):
Image 1: A prompt for the product on a background relevant to the theme.
Image 2: A prompt for a minimalist composition focusing on a single detail of the product, relevant to the theme.
Image 3: A prompt for a text-based graphic with a phrase relevant to the theme.

Provide ONLY the JSON object in your response.`,
});

async function generateImagesFromPrompts(prompts: string[]): Promise<string[]> {
  // Use a free image generation service.
  return prompts.map(
    (prompt) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
  );
}

const generateImageSetsFlow = ai.defineFlow(
  {
    name: 'generateImageSetsFlow',
    inputSchema: GenerateImageSetsInputSchema,
    outputSchema: GenerateImageSetsOutputSchema,
  },
  async (input) => {
    const {output: promptOutput} = await generateImagePrompts(input);
    if (!promptOutput) {
      throw new Error('Failed to generate image prompts.');
    }

    const [imageSet1, imageSet2] = await Promise.all([
      generateImagesFromPrompts(promptOutput.prompts1),
      generateImagesFromPrompts(promptOutput.prompts2),
    ]);

    return {imageSet1, imageSet2};
  }
);
