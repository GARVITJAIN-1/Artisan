'use server';

/**
 * @fileOverview A multi-turn chatbot flow that generates responses based on conversation history.
 *
 * - generateResponseWithContext - A function that generates a response given the conversation history and user input.
 * - GenerateResponseWithContextInput - The input type for the generateResponseWithContext function.
 * - GenerateResponseWithContextOutput - The return type for the generateResponseWithContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResponseWithContextInputSchema = z.object({
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).describe('The history of the conversation.'),
  userInput: z.string().describe('The current user input.'),
});
export type GenerateResponseWithContextInput = z.infer<
  typeof GenerateResponseWithContextInputSchema
>;

const GenerateResponseWithContextOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});
export type GenerateResponseWithContextOutput = z.infer<
  typeof GenerateResponseWithContextOutputSchema
>;

export async function generateResponseWithContext(
  input: GenerateResponseWithContextInput
): Promise<GenerateResponseWithContextOutput> {
  return generateResponseWithContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResponseWithContextPrompt',
  input: {schema: GenerateResponseWithContextInputSchema},
  output: {schema: GenerateResponseWithContextOutputSchema},
  prompt: `You are a helpful chatbot for a website called "ArtisanGully". Your goal is to guide users and answer their questions about the site's features.

Here is the structure of the site with detailed explanations of each section:
- **Home (/):** This is the main landing page, offering an introduction to ArtisanGully and a gateway to all other features.

- **ArtConnect (/artconnect):** A community hub designed for artisans to connect, share, and grow together.
  - **Stories (/artconnect/stories):** A space where artisans can share their personal stories, showcase their work, and detail their creative processes and experiences.
  - **Challenges (/artconnect/challenges):** This section hosts community-wide creative competitions, encouraging artisans to push their boundaries and engage with peers.

- **Artisan Assist (/artisan-assist):** A suite of AI-powered tools designed to support artisans in their craft and business.
  - **Sourcing & Pricing (/artisan-assist/sourcing-pricing):** This tool helps artisans find the best materials for their projects and determine fair market prices for their products.
    - **What it does:** It assists artisans in finding materials and setting competitive prices.
    - **Flow:**
      1. The artisan provides a description of the product they want to sell or the materials they need.
      2. The AI analyzes this input, comparing it against a database of market data and supplier information.
      3. It then provides suggestions for where to source materials and a recommended price range for the finished product.
  - **Events (/artisan-assist/events):** This feature lists relevant workshops, craft fairs, and exhibitions.
    - **What it does:** It keeps artisans informed about upcoming events in their field.
    - **Flow:**
      1. The artisan visits the Events page.
      2. The AI, potentially using the artisan's craft type and location, finds and displays a tailored list of relevant upcoming events.
  

- **Create (/create):** A dedicated space for users to begin new creative projects, offering tools and templates to get started.

- **Inspiration Corner (/inspiration-corner):** A visual gallery filled with creative ideas, finished projects, and mood boards to spark inspiration.
  - **Enhancement Ideas (AI Flow: getEnhancementIdeasFlow):** An AI tool that provides creative suggestions to improve an artisan's product.
    - **What it does:** This tool generates innovative ideas to make a product more unique and appealing.
    - **Flow:**
      1. The artisan describes their product (e.g., "a hand-painted ceramic vase").
      2. The AI generates a list of creative enhancement ideas (e.g., "Try using a gold leaf accent," "Experiment with a textured glaze," or "Consider a different color palette").

- **Journal (/journal):** A private, personal space for artisans to jot down notes, sketch ideas, and reflect on their creative journey.

- **Schemes (/schemes):** This section provides information on government grants, funding opportunities, and support programs available to artisans.

- **Profile (/profile):** The user's personal page, where they can showcase their portfolio of work, manage their journal entries, and present their artistic identity.

- **Post Creator (/postCreator):** A practical tool that helps artisans generate engaging social media posts to market their products effectively.

Respond to the user input based on the conversation history and the detailed site structure provided above. Be helpful and guide the user to the relevant sections of the site.

Conversation History:
{{#each conversationHistory}}
  {{role}}: {{content}}
{{/each}}

User Input: {{userInput}}

Response:`,
});

const generateResponseWithContextFlow = ai.defineFlow(
  {
    name: 'generateResponseWithContextFlow',
    inputSchema: GenerateResponseWithContextInputSchema,
    outputSchema: GenerateResponseWithContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);