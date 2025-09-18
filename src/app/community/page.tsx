"use client";

import { useState, useEffect, useRef } from "react";
import { type Artwork } from "@/lib/data";
import { ArtworkCard } from "@/components/artwork-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mic, MicOff } from "lucide-react";
import { speechToText } from "@/ai/community_flow/speech-to-text";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context"; // ✅ use hook
import { useArtworks } from "@/context/artwork-context";

export default function Home() {
  const { artworks } = useArtworks();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>(artworks);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const { t, locale, setLocale } = useLanguage(); // ✅ access t + locale

  useEffect(() => {
    const allArtworks = artworks;
    const timer = setTimeout(() => {
      if (searchTerm === "") {
        setFilteredArtworks(allArtworks);
      } else {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const results = allArtworks.filter(
          (artwork) =>
            artwork.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            artwork.artist.toLowerCase().includes(lowerCaseSearchTerm) ||
            t(`artworks.${artwork.id}.title`)
              .toLowerCase()
              .includes(lowerCaseSearchTerm) ||
            t(`artworks.${artwork.id}.artist`)
              .toLowerCase()
              .includes(lowerCaseSearchTerm) ||
            artwork.tags.some((tag) =>
              tag.toLowerCase().includes(lowerCaseSearchTerm)
            )
        );
        setFilteredArtworks(results);
      }
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [searchTerm, artworks, t]);

  // Reset artworks when data changes
  useEffect(() => {
    setFilteredArtworks(artworks);
  }, [artworks]);

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            toast({
              title: t("toasts.transcribing.title"),
              description: t("toasts.transcribing.description"),
            });
            const { text } = await speechToText(base64Audio);
            if (text) {
              setSearchTerm(text);
              toast({
                title: t("toasts.transcribedSuccess.title"),
                description: t("toasts.transcribedSuccess.description"),
              });
            } else {
              throw new Error("Transcription failed.");
            }
          } catch (error) {
            console.error("Speech-to-text error:", error);
            toast({
              variant: "destructive",
              title: t("toasts.transcribingError.title"),
              description: t("toasts.transcribingError.description"),
            });
          }
        };
        // stop mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
      toast({
        variant: "destructive",
        title: t("toasts.micAccessDenied.title"),
        description: t("toasts.micAccessDenied.description"),
      });
    }
  };

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

      {/* Search bar */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("home.searchPlaceholder")}
            className="w-full rounded-full h-12 pl-12 pr-12 text-base shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={t("home.searchAriaLabel")}
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full",
              isRecording && "text-red-500"
            )}
            onClick={handleMicClick}
            aria-label={t("home.voiceSearchAriaLabel")}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Artworks */}
      {filteredArtworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-5 duration-500">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-headline">
            {t("home.noArtworksFound")}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t("home.adjustSearchTerms")}
          </p>
        </div>
      )}
    </div>
  );
}
