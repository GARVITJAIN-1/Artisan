
"use client";

import { useContext } from "react";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { ArtworkCard } from "@/components/artwork-card";
import { useArtworks } from "@/context/artwork-context";
import { LanguageContext } from "@/context/language-context1";
import { translations } from "@/lib/translations";


export default function ChallengesPage() {
  const { artworks } = useArtworks();
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const challengeT = t.challenges;

  const challengeArtworks = artworks.filter((artwork) =>
    artwork.tags.includes("challenge")
  );
  
  const currentChallenge = {
    title: challengeT.currentChallenge.title,
    description: challengeT.currentChallenge.description,
    imageUrl: "https://picsum.photos/1200/400?random=100",
    aiHint: "city plants",
  };

  return (
    <div>
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
            {challengeT.pageTitle}
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
        <h3 className="text-3xl font-headline font-semibold mb-8 text-center">{challengeT.submissionsTitle}</h3>
        {challengeArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-5 duration-500">
            {challengeArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg bg-secondary/50">
            <h2 className="text-2xl font-headline">{challengeT.noSubmissions}</h2>
            <p className="text-muted-foreground mt-2">
              {challengeT.beTheFirst} "{currentChallenge.title}" {challengeT.challenge}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
