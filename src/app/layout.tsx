
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AppStateProvider } from "@/context/app-state-context";
import { LanguageProvider } from "@/context/language-context";
import { SessionProvider } from "@/context/session-context";
import { ProtectedLayout } from "@/components/protected-layout";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        ></script>
      </head>
      <body className={"font-body antialiased"} suppressHydrationWarning>
        <LanguageProvider>
          <AppStateProvider>
            <FirebaseClientProvider>
              <SessionProvider>
                <ProtectedLayout>{children}</ProtectedLayout>
              </SessionProvider>
            </FirebaseClientProvider>
            <Toaster />
          </AppStateProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
