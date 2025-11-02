"use client";

import { useState, useTransition, useEffect } from "react";
import type { EnhancementIdea, TrendingProduct } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Sparkles,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Lightbulb,
  Camera,
} from "lucide-react";
import {
  getEnhancementIdeasAction,
  getTrendingProductsAction,
} from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";

export default function InspirationCornerPage() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isGeneratingIdeas, startGeneratingIdeas] = useTransition();
  const [isFetchingTrends, startFetchingTrends] = useTransition();

  const [productName, setProductName] = useState<string>("Mugs");
  const [enhancementIdeas, setEnhancementIdeas] = useState<EnhancementIdea[]>(
    []
  );
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>(
    []
  );

  // cache: query -> array of image objects [{link, contextLink, title}, ...]
  const [imageCache, setImageCache] = useState<Record<string, any[]>>({});

  // Fetch images from our server endpoint (Google CSE)
  const fetchImagesForQuery = async (query: string, num = 1) => {
    if (!query) return [];
    if (imageCache[query]) return imageCache[query];

    try {
      const res = await fetch(
        `/api/imageSearch?q=${encodeURIComponent(query)}&num=${num}`
      );
      const data = await res.json();
      const images = data?.imageUrls || [];
      setImageCache((prev) => ({ ...prev, [query]: images }));
      return images;
    } catch (err) {
      console.error("Image fetch error", err);
      return [];
    }
  };

  // Generate enhancement ideas using existing action and attach images
  const handleGetEnhancementIdeas = () => {
    if (!productName) {
      toast({
        variant: "destructive",
        title: t("inspirationCornerPage.errorInputMissing"),
        description: t("inspirationCornerPage.errorInputMissingDesc"),
      });
      return;
    }
    setEnhancementIdeas([]);
    startGeneratingIdeas(async () => {
      const result = await getEnhancementIdeasAction(productName, "");
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }
      if (result.ideas) {
        // for each idea, fetch top 3 images via Google API
        const ideasWithImages = await Promise.all(
          result.ideas.map(async (idea: EnhancementIdea) => {
            // Prefer searching by productName + idea query to get more relevant images
            const query = `${productName} ${
              idea.googleSearchQuery || ""
            }`.trim();
            const imgs = await fetchImagesForQuery(query, 3);
            return { ...idea, imageResults: imgs };
          })
        );
        setEnhancementIdeas(ideasWithImages);
      }
    });
  };

  // Fetch trending products and attach images
  const handleFetchTrends = () => {
    setTrendingProducts([]);
    startFetchingTrends(async () => {
      const result = await getTrendingProductsAction();
      if (result.error) {
        toast({
          variant: "destructive",
          title: t("inspirationCornerPage.errorFetchingTrends"),
          description: result.error,
        });
        return;
      }
      if (result.products) {
        const productsWithImages = await Promise.all(
          result.products.map(async (product: TrendingProduct) => {
            const query = `${product.name} ${
              product.googleSearchQuery || ""
            }`.trim();
            const imgs = await fetchImagesForQuery(query, 3);
            return { ...product, imageResults: imgs };
          })
        );
        setTrendingProducts(productsWithImages);
      }
    });
  };

  useEffect(() => {
    handleFetchTrends();
    handleGetEnhancementIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // Page inherits background, just add padding
    <div className="flex-grow flex flex-col gap-6 p-4 md:p-8">
      {/* Product Input */}
      {/* ## Updated Card Style ## */}
      <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
        <CardHeader>
          {/* ## Updated Text Colors ## */}
          <CardTitle className="text-stone-900">{t("inspirationCornerPage.productIdeas")}</CardTitle>
          <CardDescription className="text-stone-600">
            {t("inspirationCornerPage.productIdeasDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-end gap-2">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="product-name" className="text-stone-700">
                {t("inspirationCornerPage.productNameLabel")}
              </Label>
              {/* ## Updated Input Style ## */}
              <Input
                id="product-name"
                placeholder={t("inspirationCornerPage.productNamePlaceholder")}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleGetEnhancementIdeas()
                }
                className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            {/* ## Updated Button Style ## */}
            <Button
              onClick={handleGetEnhancementIdeas}
              disabled={isGeneratingIdeas}
              className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
            >
              {isGeneratingIdeas ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {t("inspirationCornerPage.getIdeas")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {isGeneratingIdeas && enhancementIdeas.length === 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            // ## Updated Skeleton Card ##
            <Card
              key={i}
              className="overflow-hidden bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg"
            >
              <Skeleton className="h-48 w-full bg-stone-200/80" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-stone-200/80" />
              </CardHeader>
              <CardContent className="grid gap-2">
                <Skeleton className="h-4 w-full bg-stone-200/80" />
                <Skeleton className="h-4 w-5/6 bg-stone-200/80" />
                <Skeleton className="h-10 w-48 mt-2 bg-stone-200/80" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enhancement Ideas */}
      {enhancementIdeas.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-stone-900 mb-4">
            {t("inspirationCornerPage.enhancementIdeasFor", { productName })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enhancementIdeas.map((idea, idx) => (
              // ## Updated Idea Card ##
              <Card
                key={idx}
                className="overflow-hidden flex flex-col bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80"
              >
                {/* image grid */}
                <div className="w-full p-2 grid grid-cols-3 gap-2 bg-stone-50/50">
                  {idea.imageResults && idea.imageResults.length > 0 ? (
                    idea.imageResults.slice(0, 3).map((img: any, i: number) => (
                      <div
                        key={i}
                        className="relative w-full h-24 bg-stone-100 overflow-hidden rounded"
                      >
                        <Image
                          src={img.link}
                          alt={img.title || idea.title || `image-${i}`}
                          fill
                          style={{ objectFit: "cover" }}
                          unoptimized={true}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 h-24 flex items-center justify-center text-stone-500">
                      {t("inspirationCornerPage.noImageFound")}
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-grow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-800">
                      {/* ## Updated Icon Color ## */}
                      <Lightbulb className="text-amber-600 h-5 w-5" />
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 flex-grow">
                    <p className="text-stone-600 text-sm flex-grow">
                      {idea.description}
                    </p>
                    {/* ## Updated Link Buttons ## */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-fit border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                      >
                        <a
                          href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                            idea.googleSearchQuery
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {t("inspirationCornerPage.google")}
                        </a>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-fit border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                      >
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                            idea.googleSearchQuery + " tutorial"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {t("inspirationCornerPage.youtube")}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AR Card */}
      <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
        <CardHeader>
          <CardTitle className="text-stone-900">{t("inspirationCornerPage.arVisualization")}</CardTitle>
          <CardDescription className="text-stone-600">
            {t("inspirationCornerPage.arVisualizationDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ## Updated Button Style ## */}
          <Button
            onClick={() =>
              toast({
                title: t("inspirationCornerPage.errorFeatureNotAvailable"),
                description: t(
                  "inspirationCornerPage.errorFeatureNotAvailableDesc"
                ),
              })
            }
            className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
          >
            <Camera className="mr-2 h-4 w-4" />
            {t("inspirationCornerPage.launchArViewer")}
          </Button>
        </CardContent>
      </Card>

      {/* Trending Products Card */}
      <Card className="flex flex-col flex-grow bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {/* ## Updated Text/Icon Color ## */}
            <div className="flex items-center gap-2 text-stone-900">
              <TrendingUp className="text-amber-600" /> {t("inspirationCornerPage.trendingArtisanProducts")}
            </div>
            {/* ## Updated Ghost Button ## */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFetchTrends}
              disabled={isFetchingTrends}
              className="hover:bg-amber-100 text-stone-600 hover:text-amber-700"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetchingTrends ? "animate-spin" : ""}`}
              />
            </Button>
          </CardTitle>
          <CardDescription className="text-stone-600">
            {t("inspirationCornerPage.trendingArtisanProductsDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow h-[500px]">
            <div className="pr-4">
              {isFetchingTrends && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      {/* ## Updated Skeletons ## */}
                      <Skeleton className="h-[200px] w-full rounded-lg bg-stone-200/80" />
                      <Skeleton className="h-5 w-2/3 bg-stone-200/80" />
                      <Skeleton className="h-4 w-full bg-stone-200/80" />
                    </div>
                  ))}
                </div>
              )}

              {!isFetchingTrends && trendingProducts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingProducts.map((product, i) => (
                    // ## Updated Nested Card ##
                    <Card
                      key={i}
                      className="flex flex-col overflow-hidden bg-white/50 border-stone-200/80 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="w-full p-2 grid grid-cols-3 gap-2 bg-stone-50/50">
                        {product.imageResults &&
                        product.imageResults.length > 0 ? (
                          product.imageResults
                            .slice(0, 3)
                            .map((img: any, j: number) => (
                              <div
                                key={j}
                                className="relative w-full h-24 bg-stone-100 overflow-hidden rounded"
                              >
                                <Image
                                  src={img.link}
                                  alt={img.title || product.name}
                                  fill
                                  style={{ objectFit: "cover" }}
                                  unoptimized
                                />
                              </div>
                            ))
                        ) : (
                          <div className="col-span-3 h-24 flex items-center justify-center text-stone-500">
                            {t("inspirationCornerPage.noImageFound")}
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-grow">
                        <h4 className="font-semibold text-base mb-1 text-stone-800">
                          {product.name}
                        </h4>
                        <p className="text-sm text-stone-600">
                          {product.description}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {!isFetchingTrends && trendingProducts.length === 0 && (
                <div className="text-center h-40 flex flex-col justify-center items-center">
                  <p className="text-stone-500">
                    {t("inspirationCornerPage.refreshTrends")}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
