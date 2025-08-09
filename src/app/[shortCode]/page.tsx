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

  if (!shortCode) {
    return redirect('/');
  }

  try {
    await dbConnect();
    const link = await Link.findOne({ shortCode: shortCode });

    if (link) {
      link.visitCount += 1;
      await link.save();
      return redirect(link.longUrl);
    } else {
      return redirect('/?error=notfound');
    }
  } catch (error) {
    console.error('Error handling short link:', error);
    return redirect('/?error=servererror');
  }
}
