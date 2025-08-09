'use server';

import { z } from 'zod';
import { generateShortLink } from '@/ai/flows/generate-short-link';
import dbConnect from '@/lib/db-connect';
import Link from '@/models/link';

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://linkwise-sage.vercel.app';

  try {
    await dbConnect();

    const existingLink = await Link.findOne({ longUrl });
    if (existingLink) {
        const shortUrl = `${baseUrl}/${existingLink.shortCode}`;
        return {
            status: 'success',
            message: 'This link has already been shortened!',
            shortUrl: shortUrl,
            longUrl: longUrl,
        };
    }

    let shortCode = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      const result = await generateShortLink({ longUrl });
      const generatedCode = result.shortCode;
      
      const existingCode = await Link.findOne({ shortCode: generatedCode });
      if (!existingCode) {
        shortCode = generatedCode;
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return {
        status: 'error',
        message: 'Failed to generate a unique short link. Please try again.',
        longUrl: longUrl,
      };
    }

    const newLink = new Link({
      longUrl,
      shortCode,
      visitCount: 0,
    });
    await newLink.save();
    
    const shortUrl = `${baseUrl}/${shortCode}`;

    return {
      status: 'success',
      message: 'Short link generated!',
      shortUrl: shortUrl,
      longUrl: longUrl,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    console.error('Action Error:', errorMessage);
    return {
      status: 'error',
      message: `Failed to generate link. Please try again.`,
      longUrl: longUrl,
    };
  }
}
