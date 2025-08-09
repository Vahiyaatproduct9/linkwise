import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db-connect';
import Link from '@/models/link';

interface Params {
  params: {
    // accept either camelCase or lowercase param keys
    shortCode?: string;
    shortcode?: string;
  };
}

function ensureProtocol(url: string) {
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
}

export default async function ShortLinkPage({ params }: Params) {
  // try both possible param names, so folder name case doesn't break it
  const shortCode = params.shortCode ?? params.shortcode;

  if (!shortCode) {
    console.warn('No shortcode param provided', params);
    return redirect('/');
  }

  try {
    await dbConnect();

    // adjust this query if your DB field name is different (short_code / shortcode)
    const link = await Link.findOne({ shortCode });

    if (link && link.longUrl) {
      // increment visit count safely (handle undefined)
      link.visitCount = (link.visitCount ?? 0) + 1;
      await link.save();

      const target = ensureProtocol(link.longUrl);
      
      return redirect(target);
    } else {
      console.warn('Shortcode not found in DB:', shortCode);
      return redirect('/?error=notfound');
    }
  } catch (error) {
    console.error('Error handling short link:', error);
    return redirect('/?error=servererror');
  }
}
