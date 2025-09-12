"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Download,
  Share2,
  Facebook,
  Instagram,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { DesignSet, GeneratedOutput } from "./types";

type OutputDisplayProps = {
  data: GeneratedOutput;
  onReset: () => void;
};

type SocialPlatform = "instagram" | "facebook" | "whatsapp" | "general";

export default function OutputDisplay({ data, onReset }: OutputDisplayProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<SocialPlatform>("instagram");
  const { toast } = useToast();

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrentSetIndex(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  const currentDesignSet: DesignSet | undefined =
    data.designSets[currentSetIndex];

  const socialContent = {
    instagram: data.textOutputs.instagram,
    facebook: data.textOutputs.facebook,
    whatsapp: data.textOutputs.whatsapp,
  };

  const currentText =
    socialContent[activeTab]?.caption ||
    socialContent[activeTab]?.post ||
    socialContent[activeTab]?.message ||
    "";
  const currentHashtags = socialContent[activeTab]?.hashtags
    ? socialContent[activeTab].hashtags.join(" ")
    : "";

  const handleCopy = () => {
    const textToCopy = `${currentText}\n\n${currentHashtags}`;
    navigator.clipboard.writeText(textToCopy.trim());
    toast({
      title: "Copied to clipboard!",
      description: `Your ${activeTab} content is ready to be pasted.`,
    });
  };

  const handleDownload = async () => {
    if (!currentDesignSet) return;
    toast({
      title: "Starting download...",
      description: `Downloading ${currentDesignSet.images.length} images.`,
    });
    for (const [index, imageUrl] of currentDesignSet.images.entries()) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${currentDesignSet.theme.replace(/\s/g, "_")}_${
          index + 1
        }.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Download failed for image:", imageUrl, error);
        toast({
          variant: "destructive",
          title: "Download failed",
          description: `Could not download image ${index + 1}.`,
        });
      }
    }
  };

  const handleShare = (platform: SocialPlatform) => {
    const textToShare = `${currentText}\n\n${currentHashtags}`.trim();

    if (platform === "instagram" || platform === "general") {
      navigator.clipboard.writeText(textToShare);
      const title =
        platform === "instagram"
          ? "Text copied for Instagram!"
          : "Content copied!";
      const description =
        platform === "instagram"
          ? "Paste this into your new post after saving your images."
          : "Your content is ready to be shared.";
      toast({
        title: title,
        description: description,
      });
      return;
    }

    if (platform === "facebook") {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        "https://example.com" // Using a placeholder URL as required by Facebook
      )}&quote=${encodeURIComponent(textToShare)}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (platform === "whatsapp") {
      const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        textToShare
      )}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      return;
    }
  };

  const getShareButtonForPlatform = (platform: SocialPlatform) => {
    const commonProps = {
      className: "font-headline w-full",
      onClick: () => handleShare(platform),
    };
    switch (platform) {
      case "instagram":
        return (
          <Button {...commonProps}>
            <Instagram className="mr-2" /> Share on Instagram
          </Button>
        );
      case "facebook":
        return (
          <Button {...commonProps}>
            <Facebook className="mr-2" /> Share on Facebook
          </Button>
        );
      case "whatsapp":
        return (
          <Button {...commonProps}>
            <MessageSquare className="mr-2" /> Share on WhatsApp
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-headline text-3xl text-accent">
          Your Post is Ready!
        </h2>
        <p className="font-body text-muted-foreground mt-1">
          Choose a design, copy the text, and share your creation.
        </p>
      </div>

      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {data.designSets.map((designSet, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6">
                  <h3 className="font-headline text-2xl text-primary mb-4">
                    {designSet.theme}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {designSet.images.map((imgSrc, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative aspect-square rounded-lg overflow-hidden shadow-md"
                      >
                        <Image
                          src={imgSrc}
                          alt={`${designSet.theme} design ${imgIndex + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                          data-ai-hint="product lifestyle"
                          priority={imgIndex === 0}
                          unoptimized={true}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-12" />
        <CarouselNext className="hidden md:flex -right-12" />
      </Carousel>

      <Card className="shadow-lg">
        <CardContent className="p-4 md:p-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as SocialPlatform)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-secondary">
              <TabsTrigger value="instagram" className="font-headline">
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="facebook" className="font-headline">
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="font-headline">
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 p-4 min-h-[200px] bg-background rounded-md border">
              <TabsContent
                value="instagram"
                className="font-body text-foreground space-y-4"
              >
                <p className="whitespace-pre-wrap">
                  {socialContent.instagram.caption}
                </p>
                <p className="text-sm text-primary">
                  {socialContent.instagram.hashtags.join(" ")}
                </p>
              </TabsContent>
              <TabsContent
                value="facebook"
                className="font-body text-foreground"
              >
                <p className="whitespace-pre-wrap">
                  {socialContent.facebook?.post}
                </p>
              </TabsContent>
              <TabsContent
                value="whatsapp"
                className="font-body text-foreground"
              >
                <p className="whitespace-pre-wrap">
                  {socialContent.whatsapp?.message}
                </p>
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            <div className="lg:col-span-1 sm:col-span-2">
              {getShareButtonForPlatform(activeTab)}
            </div>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="font-headline"
            >
              <Copy className="mr-2" /> Copy Text
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="font-headline"
            >
              <Download className="mr-2" /> Save Design Set
            </Button>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => handleShare("general")}
              className="font-headline w-full"
            >
              <Share2 className="mr-2" /> General Share (Copy Text)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Button
          variant="ghost"
          onClick={onReset}
          className="font-headline text-muted-foreground"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Start Over
        </Button>
      </div>
    </div>
  );
}
