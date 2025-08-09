'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a short, unique URL from a long URL using AI.
 *
 * The flow takes a long URL as input and returns a shortened URL.
 * @exports generateShortLink
 * @exports GenerateShortLinkInput
 * @exports GenerateShortLinkOutput
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShortLinkInputSchema = z.object({
  longUrl: z.string().url().describe('The long URL to be shortened.'),
});
export type GenerateShortLinkInput = z.infer<typeof GenerateShortLinkInputSchema>;

const GenerateShortLinkOutputSchema = z.object({
  shortUrl: z.string().describe('The generated short URL.'),
});
export type GenerateShortLinkOutput = z.infer<typeof GenerateShortLinkOutputSchema>;

export async function generateShortLink(input: GenerateShortLinkInput): Promise<GenerateShortLinkOutput> {
  return generateShortLinkFlow(input);
}

const generateShortLinkPrompt = ai.definePrompt({
  name: 'generateShortLinkPrompt',
  input: {schema: GenerateShortLinkInputSchema},
  output: {schema: GenerateShortLinkOutputSchema},
  prompt: `You are a URL shortening service. Given a long URL, your task is to generate a short, unique, and memorable short URL.

  Long URL: {{{longUrl}}}

  Short URL:`,
});

const generateShortLinkFlow = ai.defineFlow(
  {
    name: 'generateShortLinkFlow',
    inputSchema: GenerateShortLinkInputSchema,
    outputSchema: GenerateShortLinkOutputSchema,
  },
  async input => {
    const {output} = await generateShortLinkPrompt(input);
    return output!;
  }
);
