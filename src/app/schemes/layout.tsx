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
    // ## Updated Header Style ##
    // Uses the "glassmorphism" effect and our theme's border color
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-2 border-b border-stone-200/80 bg-white/70 px-4 backdrop-blur-lg md:px-6">
      <Link href="/" className="flex items-center gap-2">
        {/* ## Updated Logo Color ## */}
        <Leaf className="h-6 w-6 text-amber-700" />
        <h1 className="font-headline text-2xl font-bold text-amber-700">
          {t("title")}
        </h1>
      </Link>
      <nav className="flex items-center gap-4">
        {/* ## Updated Nav Link Colors ## */}
        <Link
          href="/"
          className={cn(
            "text-sm font-medium transition-colors hover:text-rose-600",
            pathname === "/" ? "text-rose-600 font-bold" : "text-stone-700"
          )}
        >
          {t("userDashboard")}
        </Link>
        <Link
          href="/admin"
          className={cn(
            "text-sm font-medium transition-colors hover:text-rose-600",
            pathname === "/admin" ? "text-rose-600 font-bold" : "text-stone-700"
          )}
        >
          {t("adminPanel")}
        </Link>

        {/* ## Updated Language Dropdown ## */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* Using a themed 'ghost' button */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-amber-100 text-stone-600 hover:text-amber-700"
            >
              <Languages className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Change language</span>
            </Button>
          </DropdownMenuTrigger>
          {/* Styled the dropdown content */}
          <DropdownMenuContent
            align="end"
            className="bg-white/90 backdrop-blur-lg border-stone-200"
          >
            <DropdownMenuItem
              onClick={() => setLocale("en")}
              className="hover:bg-amber-50/50"
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLocale("hi")}
              className="hover:bg-amber-50/50"
            >
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
    // ## Updated Main Background ##
    // Applied the soft gradient background to the entire layout
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FBF9F6] to-amber-50 text-stone-800">
      <Header />
      <main>{children}</main>
    </div>
  );
}
