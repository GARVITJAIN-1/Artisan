'use server';

/**
 * @fileOverview Finds currently trending products in the artisan and handmade market.
 *
 * - getTrendingProducts - A function that returns a list of trending products.
 * - GetTrendingProductsOutput - The return type for the getTrendingProducts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetTrendingProductsOutputSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().describe("The name of the trending product."),
      description: z.string().describe("A brief (1-sentence) explanation of why this product is currently trending."),
      imageUrl: z.string().url().describe("A URL for a high-quality, inspirational image of the product."),
    })
  ).describe("A list of 5 currently trending handmade or artisan products."),
});
export type GetTrendingProductsOutput = z.infer<typeof GetTrendingProductsOutputSchema>;

export async function getTrendingProducts(): Promise<GetTrendingProductsOutput> {
  return getTrendingProductsFlow();
}

const prompt = ai.definePrompt({
  name: 'getTrendingProductsPrompt',
  output: { schema: GetTrendingProductsOutputSchema },
  prompt: `You are a market trend analyst specializing in the handmade and artisan goods sector.

Your task is to identify 5 products that are currently trending. For each product, provide:
1.  Its name.
2.  A concise, one-sentence explanation for its popularity (e.g., "Custom Pet Portraits - Driven by the 'pet humanization' trend and social media sharing.").
3.  A URL for a real, high-quality, and inspirational image of the product from a platform like Etsy or Pinterest. The image should be visually appealing and representative of the trend.

Scan for popular items on platforms like Etsy, Pinterest, Instagram, and craft market reports. Focus on what's popular right now.
`,
});

const getTrendingProductsFlow = ai.defineFlow(
  {
    name: 'getTrendingProductsFlow',
    outputSchema: GetTrendingProductsOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    if (!output || !output.products) {
      throw new Error("Failed to generate trending products.");
    }
    return output;
  }
);
