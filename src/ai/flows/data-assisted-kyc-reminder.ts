'use server';
/**
 * @fileOverview An AI agent to help farmers complete their e-KYC.
 *
 * - assistKycReminder - A function that assists farmers with their e-KYC process.
 * - AssistKycReminderInput - The input type for the assistKycReminder function.
 * - AssistKycReminderOutput - The return type for the assistKycReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistKycReminderInputSchema = z.object({
  farmerId: z.string().describe('The ID of the farmer.'),
  farmerName: z.string().describe('The name of the farmer.'),
  aadhaarNumber: z.string().describe('The Aadhaar number of the farmer.'),
  bankAccountNumber: z.string().describe('The bank account number of the farmer.'),
  landRecords: z.string().describe('The land records of the farmer.'),
});
export type AssistKycReminderInput = z.infer<typeof AssistKycReminderInputSchema>;

const AssistKycReminderOutputSchema = z.object({
  eKycAssistance: z.string().describe('Assistance provided to the farmer for completing e-KYC.'),
});
export type AssistKycReminderOutput = z.infer<typeof AssistKycReminderOutputSchema>;

export async function assistKycReminder(input: AssistKycReminderInput): Promise<AssistKycReminderOutput> {
  return assistKycReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistKycReminderPrompt',
  input: {schema: AssistKycReminderInputSchema},
  output: {schema: AssistKycReminderOutputSchema},
  prompt: `You are an AI assistant helping farmers complete their e-KYC for the PM-KISAN scheme.
  Based on the farmer's information, provide clear and concise instructions on how to complete the e-KYC process either online or by visiting a Common Service Center (CSC).
  Include the necessary documents and information required for both methods.

  Farmer ID: {{{farmerId}}}
  Farmer Name: {{{farmerName}}}
  Aadhaar Number: {{{aadhaarNumber}}}
  Bank Account Number: {{{bankAccountNumber}}}
  Land Records: {{{landRecords}}}

  Provide assistance to the farmer for completing e-KYC.
  `,
});

const assistKycReminderFlow = ai.defineFlow(
  {
    name: 'assistKycReminderFlow',
    inputSchema: AssistKycReminderInputSchema,
    outputSchema: AssistKycReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
