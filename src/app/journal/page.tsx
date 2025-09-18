"use client";

import { ArtworkCard } from "@/components/artwork-card";
import { PenSquare } from "lucide-react";
import { useArtworks } from "@/context/artwork-context";
import { useLanguage } from "@/context/language-context"; // ✅ use hook

export default function JournalPage() {
  const { artworks } = useArtworks();
  const { t, locale, setLocale } = useLanguage(); // ✅ translation + locale state

  const textArtworks = artworks.filter((artwork) => artwork.type === "text");

  return (
    <div className="container py-8">
      {/* Language Switcher */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLocale(locale === "en" ? "hi" : "en")}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          {locale === "en" ? "हिन्दी" : "English"}
        </button>
      </div>

      <div className="flex flex-col items-center mb-12 text-center">
        <PenSquare className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-4xl font-headline font-bold">
          {t("journal.pageTitle")}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          {t("journal.pageDescription")}
        </p>
      </div>

      {textArtworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-5 duration-500 max-w-5xl mx-auto">
          {textArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-headline">{t("journal.noEntries")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("journal.noEntriesDescription")}
          </p>
        </div>
      )}
    </div>
  );
}
