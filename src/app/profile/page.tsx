
"use client";

import { useContext } from "react";
import { ArtworkCard } from "@/components/artwork-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { LanguageContext } from "@/context/language-context1";
import { translations } from "@/lib/translations";
import { useArtworks } from "@/context/artwork-context";

export default function ProfilePage() {
  const { artworks } = useArtworks();
  const { language } = useContext(LanguageContext);
  const t = translations[language].profile;

  const userArtworks = artworks.filter((artwork) => artwork.isUserSubmission);

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center mb-12 text-center">
        <Avatar className="h-24 w-24 mb-4 border-2 border-muted">
          <AvatarImage src="https://picsum.photos/100/100?random=99" alt="User Avatar" data-ai-hint="person face" />
          <AvatarFallback>
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-headline font-bold">{t.pageTitle}</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          {t.pageDescription}
        </p>
      </div>

      {userArtworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-5 duration-500">
          {userArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-secondary/50">
          <h2 className="text-2xl font-headline">{t.noSubmissions}</h2>
          <p className="text-muted-foreground mt-2">
            {t.noSubmissionsDescription}
          </p>
        </div>
      )}
    </div>
  );
}
