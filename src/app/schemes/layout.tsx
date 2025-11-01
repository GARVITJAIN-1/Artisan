
"use client";

import { Leaf, Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function Header() {
  const pathname = usePathname();
  const { setLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Leaf className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-2xl font-bold text-primary">
          {t("title")}
        </h1>
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          href="/"
          className={cn(
            "text-sm font-medium hover:underline",
            pathname === "/" ? "text-accent" : "text-primary"
          )}
        >
          {t("userDashboard")}
        </Link>
        <Link
          href="/admin"
          className={cn(
            "text-sm font-medium hover:underline",
            pathname === "/admin" ? "text-accent" : "text-primary"
          )}
        >
          {t("adminPanel")}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Languages className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Change language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLocale("en")}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale("hi")}>
              हिन्दी (Hindi)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This div now acts as the main container for your pages
    // Note: No <html> or <body> tags here
    <div className="min-h-screen w-full bg-background">
      <Header />
      <main>{children}</main>
    </div>
  );
}
