'use server';

/**
 * @fileOverview A flow that translates a note to a specified language.
 *
 * - translateNote - A function that translates a note.
 * - TranslateNoteInput - The input type for the translateNote function.
 * - TranslateNoteOutput - The return type for the translateNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const languageToName: Record<string, string> = {
  gu: 'Gujarati',
  hi: 'Hindi',
  en: 'English',
};

const TranslateNoteInputSchema = z.object({
  title: z.string().describe('The title of the note.'),
  body: z.string().describe('The body of the note.'),
  targetLanguage: z.string().describe('The target language code (e.g., "en", "hi", "gu").'),
});
export type TranslateNoteInput = z.infer<typeof TranslateNoteInputSchema>;

const TranslateNoteOutputSchema = z.object({
  translatedTitle: z.string().describe('The translated title of the note.'),
  translatedBody: z.string().describe('The translated body of the note.'),
});
export type TranslateNoteOutput = z.infer<typeof TranslateNoteOutputSchema>;

export async function translateNote(input: TranslateNoteInput): Promise<TranslateNoteOutput> {
  return translateNoteFlow(input);
}

const translateNotePrompt = ai.definePrompt({
  name: 'translateNotePrompt',
  input: {schema: TranslateNoteInputSchema},
  output: {schema: TranslateNoteOutputSchema},
  prompt: `Translate the following note title and body into {{targetLanguageName}}.

Title: {{{title}}}
Body:
{{{body}}}

Provide the translated title and body in the specified output format.`,
});

const translateNoteFlow = ai.defineFlow(
  {
    name: 'translateNoteFlow',
    inputSchema: TranslateNoteInputSchema,
    outputSchema: TranslateNoteOutputSchema,
  },
  async (input) => {
    const targetLanguageName = languageToName[input.targetLanguage] || input.targetLanguage;
    const {output} = await translateNotePrompt({...input, targetLanguageName});
    return output!;
  }
);
