import { LinkShortener } from '@/components/link-shortener';
import { Link } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-background">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary p-3 rounded-full shadow-lg">
              <Link className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter font-headline text-foreground">
              LinkWise
            </h1>
          </div>
          <p className="max-w-xl text-lg text-muted-foreground">
            The smart and simple way to shorten your URLs. Just paste, generate, and share.
          </p>
        </div>
        <LinkShortener />
      </main>
      <footer className="w-full p-4 text-center text-sm text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} LinkWise. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
