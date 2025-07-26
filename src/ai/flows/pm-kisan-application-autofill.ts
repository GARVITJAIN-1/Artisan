'use server';
/**
 * @fileOverview An AI agent to auto-fill PM-KISAN application forms by fetching user data.
 *
 * - pmKisanApplicationAutofill - A function that handles the auto-filling process.
 * - PmKisanApplicationAutofillInput - The input type for the pmKisanApplicationAutofill function.
 * - PmKisanApplicationAutofillOutput - The return type for the pmKisanApplicationAutofill function.
 */

import {ai} from '@/ai/genkit';
import {db} from '@/lib/db';
import {z} from 'genkit';

// Input now takes the farmerId, which we will use to fetch data.
const PmKisanApplicationAutofillInputSchema = z.object({
  farmerId: z.string().describe('The ID of the farmer to fill the application for.'),
  formDataSchema: z.string().describe('The JSON schema of the form to be filled.'),
  currentFormData: z
    .string()
    .optional()
    .describe('The current form data as a JSON string, to be used for multi-form filling, should be an empty object if not available.'),
});
export type PmKisanApplicationAutofillInput = z.infer<typeof PmKisanApplicationAutofillInputSchema>;

const PmKisanApplicationAutofillOutputSchema = z.object({
  filledFormData: z.string().describe('The filled form data as a JSON string.'),
});
export type PmKisanApplicationAutofillOutput = z.infer<typeof PmKisanApplicationAutofillOutputSchema>;

// The schema for the prompt now includes the full farmer data, not just the ID.
const PromptInputSchema = PmKisanApplicationAutofillInputSchema.extend({
  farmerData: z.any().describe('The full data object for the farmer.'),
});

export async function pmKisanApplicationAutofill(input: PmKisanApplicationAutofillInput): Promise<PmKisanApplicationAutofillOutput> {
  return pmKisanApplicationAutofillFlow(input);
}

// The prompt is simplified. It no longer needs to use a tool.
// It just receives the data and performs the mapping.
const prompt = ai.definePrompt({
  name: 'pmKisanApplicationAutofillPrompt',
  input: {
    schema: PromptInputSchema,
  },
  output: {
    schema: PmKisanApplicationAutofillOutputSchema,
  },
  prompt: `You are an AI assistant specialized in auto-filling application forms for the PM-KISAN scheme.

  Your task is to populate a form using the provided user data, adhering to the specified JSON schema.

  User Data:
  {{{jsonStringify farmerData}}}

  JSON Schema for the form:
  {{{formDataSchema}}}

  Here is the existing form data, which you should use as a base if available:
  {{#if currentFormData}}
  {{{currentFormData}}}
  {{else}}
  {}
  {{/if}}

  Please map the data from the fetched user details to the form fields according to these specific instructions:
  - 'state' should be mapped from 'address.state'.
  - 'district' should be mapped from 'address.district'.
  - 'subDistrict' should be mapped from 'address.subDistrict'.
  - 'block' should be mapped from 'address.block'.
  - 'village' should be mapped from 'address.village'.
  - 'farmerName' should be mapped from 'name'.
  - 'gender' should be mapped from 'gender'.
  - 'category' should be mapped from 'category'.
  - 'farmerType' should be mapped from 'farmerType'.
  - 'aadhaarNumber' should be mapped from 'aadhaarNumber'.
  - 'bankName' should be mapped from 'bank.name'.
  - 'ifscCode' should be mapped from 'bank.ifsc'.
  - 'accountNumber' should be mapped from 'bank.accountNumber'.

  If a value is not found in the user data, leave the corresponding form field as it is (if it has a default value) or set it to null.
  Return the completed form data as a valid JSON string in the 'filledFormData' field.
  `,
});

// The flow now contains the logic to fetch data first, then call the prompt.
const pmKisanApplicationAutofillFlow = ai.defineFlow(
  {
    name: 'pmKisanApplicationAutofillFlow',
    inputSchema: PmKisanApplicationAutofillInputSchema,
    outputSchema: PmKisanApplicationAutofillOutputSchema,
  },
  async (input) => {
    // 1. Fetch the farmer's data from the database.
    const farmerData = await db.getFarmerById(input.farmerId);
    if (!farmerData) {
      throw new Error(`Farmer with ID ${input.farmerId} not found.`);
    }

    // 2. Call the AI prompt with the fetched data included.
    const {output} = await prompt({
      ...input,
      farmerData: farmerData,
    });
    
    return output!;
  }
);
