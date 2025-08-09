'use server';

import { z } from 'zod';
import { generateShortLink } from '@/ai/flows/generate-short-link';

const FormSchema = z.object({
  longUrl: z.string().url({ message: 'Please enter a valid URL starting with http:// or https://' }),
});

export interface ShortLinkState {
  status: 'error' | 'success' | 'idle';
  message: string;
  shortUrl?: string;
  longUrl?: string;
}

export async function createShortLinkAction(
  prevState: ShortLinkState,
  formData: FormData
): Promise<ShortLinkState> {
  const rawFormData = {
    longUrl: formData.get('longUrl') as string,
  };

  const validatedFields = FormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.longUrl?.[0] || 'Invalid input.',
      longUrl: rawFormData.longUrl,
    };
  }
  
  const { longUrl } = validatedFields.data;

  try {
    const result = await generateShortLink({ longUrl });
    
    // In a real app, you'd use your actual domain.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://w.ise';
    const shortUrl = `${baseUrl}/${result.shortUrl}`;

    return {
      status: 'success',
      message: 'Short link generated!',
      shortUrl: shortUrl,
      longUrl: longUrl,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return {
      status: 'error',
      message: `Failed to generate link: ${errorMessage}`,
      longUrl: longUrl,
    };
  }
}
