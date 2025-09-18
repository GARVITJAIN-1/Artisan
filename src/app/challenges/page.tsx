"use client";

import { Trophy } from "lucide-react";
import Image from "next/image";
import { ArtworkCard } from "@/components/artwork-card";
import { useArtworks } from "@/context/artwork-context";
import { useLanguage } from "@/context/language-context"; // ✅ same hook as ProfilePage

export default function ChallengesPage() {
  const { artworks } = useArtworks();
  const { t, locale, setLocale } = useLanguage(); // ✅ destructure t + locale + setLocale

  const challengeArtworks = artworks.filter((artwork) =>
    artwork.tags.includes("challenge")
  );

  const currentChallenge = {
    title: t("challenges.currentChallenge.title"),
    description: t("challenges.currentChallenge.description"),
    imageUrl: "https://picsum.photos/1200/400?random=100",
    aiHint: "city plants",
  };

  return (
    <div>
      {/* Language Switcher */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setLocale(locale === "en" ? "hi" : "en")}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          {locale === "en" ? "हिन्दी" : "English"}
        </button>
      </div>

      <div className="relative mb-12 bg-secondary/50">
        <div className="absolute inset-0">
          <Image
            src={currentChallenge.imageUrl}
            alt={currentChallenge.title}
            fill
            className="object-cover opacity-20"
            data-ai-hint={currentChallenge.aiHint}
          />
        </div>
        <div className="container relative py-16 sm:py-24 text-center">
          <Trophy className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl sm:text-5xl font-headline font-bold">
            {t("challenges.pageTitle")}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-headline text-primary/90 mt-2">
            {currentChallenge.title}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-3xl mx-auto text-base sm:text-lg">
            {currentChallenge.description}
          </p>
        </div>
      </div>

      <div className="container pb-8">
        <h3 className="text-3xl font-headline font-semibold mb-8 text-center">
          {t("challenges.submissionsTitle")}
        </h3>
        {challengeArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-5 duration-500">
            {challengeArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg bg-secondary/50">
            <h2 className="text-2xl font-headline">
              {t("challenges.noSubmissions")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("challenges.beTheFirst")} "{currentChallenge.title}"{" "}
              {t("challenges.challenge")}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
