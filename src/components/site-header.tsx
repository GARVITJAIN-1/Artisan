
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Palette, User, PenSquare, Trophy, Mic, MicOff, Globe, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useRef, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { navigateWithVoice } from "@/ai/community_flow/voice-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageContext } from "@/context/language-context1";
import { translations } from "@/lib/translations";


export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { language, setLanguage } = useContext(LanguageContext);
  const t = translations[language];

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/challenges", label: t.nav.challenges },
    { href: "/journal", label: t.nav.journal },
  ];

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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
             toast({
              title: t.toasts.listening.title,
              description: t.toasts.listening.description,
            });
            const { path } = await navigateWithVoice(base64Audio);
            if (path && path !== 'unknown') {
               toast({
                title: t.toasts.navigating.title,
                description: `${t.toasts.navigating.description} ${path.replace('/', '') || 'Home'}.`,
              });
              router.push(path);
            } else {
              throw new Error("Navigation failed.");
            }
          } catch (error) {
            console.error("Voice navigation error:", error);
            toast({
              variant: "destructive",
              title: t.toasts.navigationError.title,
              description: t.toasts.navigationError.description,
            });
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: t.toasts.listening.title,
        description: t.toasts.listening.description,
      });
    } catch (error) {
      console.error("Microphone access denied:", error);
      toast({
        variant: "destructive",
        title: t.toasts.micAccessDenied.title,
        description: t.toasts.micAccessDenied.description,
      });
    }
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Palette className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block font-headline text-lg">
            {t.siteTitle}
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm lg:gap-6 flex-1">
          {navLinks.map((link) => (
             <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-2">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">{t.nav.changeLanguage}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLanguage('hi')}>
                  हिन्दी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-9 w-9 rounded-full", isRecording && "text-red-500")}
            onClick={handleMicClick}
            aria-label={t.nav.voiceNavAriaLabel}
            >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Link
            href="/profile"
            className={cn(
              "transition-colors hover:text-foreground/80 hidden sm:block",
              pathname === "/profile" ? "text-foreground font-semibold" : "text-foreground/60"
            )}
          >
            {t.nav.myProfile}
          </Link>
          <Button asChild variant="ghost" size="icon" aria-label="Create Post">
            <Link href="/create">
                <PlusCircle className="h-5 w-5" />
            </Link>
          </Button>
           <Button asChild variant="ghost" size="icon" aria-label="User Profile">
            <Link href="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
