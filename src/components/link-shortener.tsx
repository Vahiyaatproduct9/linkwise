'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { createShortLinkAction, type ShortLinkState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link, Copy, Check, Loader2, Sparkles } from 'lucide-react';

const initialState: ShortLinkState = {
  status: 'idle',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending} size="lg">
      {pending ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
      {pending ? 'Generating...' : 'Generate Short Link'}
    </Button>
  );
}

export function LinkShortener() {
  const [state, formAction] = useFormState(createShortLinkAction, initialState);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success' && state.message) {
      toast({
        title: 'Success!',
        description: 'Your short link is ready.',
      });
      formRef.current?.reset();
    } else if (state.status === 'error' && state.message) {
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleCopy = () => {
    if (state.shortUrl) {
      navigator.clipboard.writeText(state.shortUrl);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'The short link is now in your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle className="text-3xl font-headline tracking-tight">Make Your Links Wiser</CardTitle>
        <CardDescription>Paste your long URL below to generate a short and wise link. Powered by AI.</CardDescription>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-full relative">
              <Label htmlFor="longUrl" className="sr-only">
                Long URL
              </Label>
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="longUrl"
                name="longUrl"
                type="url"
                placeholder="https://your-super-long-url.com/with/lots-of-params"
                required
                className="pl-10 text-base h-12"
              />
            </div>
            <SubmitButton />
          </div>
        </CardContent>
      </form>
      {state.status === 'success' && state.shortUrl && (
        <CardFooter className="bg-primary/10 p-4 rounded-b-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-lg font-code text-primary-foreground bg-primary/80 px-4 py-2 rounded-md overflow-x-auto w-full text-left">
            {state.shortUrl}
          </p>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary/20 hover:text-primary-foreground flex-shrink-0"
            aria-label="Copy to clipboard"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
