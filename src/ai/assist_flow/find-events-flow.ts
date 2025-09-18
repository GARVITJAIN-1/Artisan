'use server';

/**
 * @fileOverview Finds upcoming events and exhibitions for artisans in a given country.
 *
 * - findEvents - A function that returns a list of future events.
 * - FindEventsInput - The input type for the findEvents function.
 * - FindEventsOutput - The return type for the findEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindEventsInputSchema = z.object({
  country: z.string().describe('The country to search for events in.'),
  state: z.string().optional().describe('The state or region within the country to search for events in.'),
});
export type FindEventsInput = z.infer<typeof FindEventsInputSchema>;

const FindEventsOutputSchema = z.object({
  events: z.array(
    z.object({
        name: z.string().describe("The name of the event."),
        date: z.string().describe("The date(s) of the event."),
        location: z.string().describe("The city and venue of the event."),
        link: z.string().describe("The URL to the event's website for registration or more information."),
    })
  ).describe('A list of 5 upcoming events for artisans.'),
});
export type FindEventsOutput = z.infer<typeof FindEventsOutputSchema>;

export async function findEvents(input: FindEventsInput): Promise<FindEventsOutput> {
  return findEventsFlow(input);
}

const InternalFindEventsInputSchema = FindEventsInputSchema.extend({
    currentDate: z.string().describe('The current date.'),
});

const prompt = ai.definePrompt({
  name: 'findEventsPrompt',
  input: {schema: InternalFindEventsInputSchema},
  output: {schema: FindEventsOutputSchema},
  prompt: `You are an expert researcher specializing in events for local artisans and crafters.
The current date is {{currentDate}}.

{{#if state}}
Find a list of 5 real, upcoming craft fairs, art exhibitions, or artisan markets in the state of {{{state}}}, {{{country}}}.
{{else}}
Find a list of 5 real, upcoming craft fairs, art exhibitions, or artisan markets in {{{country}}}.
{{/if}}

IMPORTANT: All events you return MUST take place after the current date of {{currentDate}}. Do not include any events that have already passed.

For each event, provide:
- The official name of the event.
- The dates it will be held.
- The location (city and venue if available).
- A valid, direct URL to the event's website for registration or more information. The link must be a real, working URL.
`,
});

const findEventsFlow = ai.defineFlow(
  {
    name: 'findEventsFlow',
    inputSchema: FindEventsInputSchema,
    outputSchema: FindEventsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt({
        ...input,
        currentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    });
    return output!;
  }
);
