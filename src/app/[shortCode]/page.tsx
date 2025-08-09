import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db-connect';
import Link from '@/models/link';

interface Params {
  params: {
    shortCode: string;
  };
}

export default async function ShortLinkPage({ params }: Params) {
  const { shortCode } = params;

  if (!shortCode || typeof shortCode !== 'string') {
    return redirect('/');
  }

  try {
    await dbConnect();
    
    // Find the link by shortCode
    const link = await Link.findOne({ shortCode: decodeURIComponent(shortCode) });

    if (link) {
      // Increment the visit count and save
      link.visitCount += 1;
      await link.save();
      
      // Redirect to the original long URL
      return redirect(link.longUrl);
    } else {
      // If the link is not found, redirect to a 'not found' error page
      return redirect('/?error=notfound');
    }
  } catch (error) {
    console.error('Error handling short link:', error);
    // If any other server error occurs, redirect to a generic server error page
    return redirect('/?error=servererror');
  }
}
