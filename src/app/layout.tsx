"use client";

import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AppStateProvider } from '@/context/app-state-context';
import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// export const metadata: Metadata = {
//   title: 'PM-KISAN Saathi',
//   description: 'AI-powered assistance for the PM-KISAN scheme.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PM-KISAN Saathi</title>
        <meta name="description" content="AI-powered assistance for the PM-KISAN scheme." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className={'font-body antialiased'} suppressHydrationWarning>
        <AppStateProvider>
          <div className="min-h-screen w-full bg-background">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
              <Link href="/" className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-primary" />
                <h1 className="font-headline text-2xl font-bold text-primary">
                  PM-KISAN Saathi
                </h1>
              </Link>
              <nav className='flex items-center gap-4'>
                <Link href="/" className={cn("text-sm font-medium hover:underline", pathname === '/' ? 'text-accent' : 'text-primary')}>
                  User Dashboard
                </Link>
                <Link href="/admin" className={cn("text-sm font-medium hover:underline", pathname === '/admin' ? 'text-accent' : 'text-primary')}>
                  Admin Panel
                </Link>
              </nav>
            </header>
            {children}
            <Toaster />
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
