"use client";

import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AppStateProvider } from '@/context/app-state-context';
import { Leaf, Languages } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LanguageProvider, useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// export const metadata: Metadata = {
//   title: 'Krishak Mitra',
//   description: 'AI-powered assistance for the PM-KISAN scheme.',
// };

function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Leaf className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-2xl font-bold text-primary">
          {t('title')}
        </h1>
      </Link>
      <nav className='flex items-center gap-4'>
        <Link href="/" className={cn("text-sm font-medium hover:underline", pathname === '/' ? 'text-accent' : 'text-primary')}>
          {t('userDashboard')}
        </Link>
        <Link href="/admin" className={cn("text-sm font-medium hover:underline", pathname === '/admin' ? 'text-accent' : 'text-primary')}>
          {t('adminPanel')}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Languages className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Change language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLocale('en')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale('hi')}>
              हिन्दी (Hindi)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Krishak Mitra</title>
        <meta name="description" content="AI-powered assistance for the PM-KISAN scheme." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className={'font-body antialiased'} suppressHydrationWarning>
        <LanguageProvider>
          <AppStateProvider>
            <div className="min-h-screen w-full bg-background">
              <Header />
              {children}
              <Toaster />
            </div>
          </AppStateProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
