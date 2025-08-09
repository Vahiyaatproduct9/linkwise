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

  try {
    // Connect to the database
    await dbConnect();

    // Check if the link already exists
    const existingLink = await Link.findOne({ longUrl });
    if (existingLink) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://linkwise-sage.vercel.app';
        const shortUrl = `${baseUrl}/${existingLink.shortCode}`;
        return {
            status: 'success',
            message: 'This link has already been shortened!',
            shortUrl: shortUrl,
            longUrl: longUrl,
        };
    }

    // If it doesn't exist, generate a new short code
    const result = await generateShortLink({ longUrl });
    const { shortCode } = result;
    
    // Save the new link to the database
    const newLink = new Link({
      longUrl,
      shortCode,
      visitCount: 0,
    });
    await newLink.save();

    // Construct the full short URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://linkwise-sage.vercel.app';
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
