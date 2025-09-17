
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AppStateProvider } from "@/context/app-state-context";
import { LanguageProvider } from "@/context/language-context";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The lang attribute will be managed by your LanguageProvider if needed
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Source+Code+Pro:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={"font-body antialiased"} suppressHydrationWarning>
        {/* Providers wrap everything to make state globally available */}
        <LanguageProvider>
          <AppStateProvider>
            {children}
            <Toaster />
          </AppStateProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
