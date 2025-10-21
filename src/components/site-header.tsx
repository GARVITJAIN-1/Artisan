
"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";
import { useSession } from "@/context/session-context";

export function SiteHeader() {
  const { t } = useLanguage();
  const { session, logout } = useSession();

  if (!session.isLoggedIn) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-end">
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
                <Link href="/profile" aria-label={t("nav.myProfile")}>
                  <User className="h-5 w-5" />
                </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Logout" onClick={logout}>
                <LogOut className="h-5 w-5" />
            </Button>
        </div>
      </div>
    </header>
  );
}
