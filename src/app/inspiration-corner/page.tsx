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

export default function InspirationCornerPage() {
  const { toast } = useToast();

  const [isGeneratingIdeas, startGeneratingIdeas] = useTransition();
  const [isFetchingTrends, startFetchingTrends] = useTransition();

  const [productName, setProductName] = useState<string>("Mugs");
  const [enhancementIdeas, setEnhancementIdeas] = useState<EnhancementIdea[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);

  // cache: query -> array of image objects [{link, contextLink, title}, ...]
  const [imageCache, setImageCache] = useState<Record<string, any[]>>({});

  // Fetch images from our server endpoint (Google CSE)
  const fetchImagesForQuery = async (query: string, num = 1) => {
    if (!query) return [];
    if (imageCache[query]) return imageCache[query];

    try {
      const res = await fetch(`/api/imageSearch?q=${encodeURIComponent(query)}&num=${num}`);
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
        title: "Input Missing",
        description: "Please provide a product name.",
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
            const query = `${productName} ${idea.googleSearchQuery || ""}`.trim();
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
          title: "Error fetching trends",
          description: result.error,
        });
        return;
      }
      if (result.products) {
        const productsWithImages = await Promise.all(
          result.products.map(async (product: TrendingProduct) => {
            const query = `${product.name} ${product.googleSearchQuery || ""}`.trim();
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
    <div className="flex-grow flex flex-col gap-6 p-4 md:p-6">
      {/* Product Input */}
      <Card>
        <CardHeader>
          <CardTitle>Product Ideas</CardTitle>
          <CardDescription>
            Enter your product name to get AI-powered enhancement ideas with real images.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-end gap-2">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="product-name">Product Name / Type</Label>
              <Input
                id="product-name"
                placeholder="e.g., Handmade Ceramic Mugs"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGetEnhancementIdeas()}
              />
            </div>
            <Button onClick={handleGetEnhancementIdeas} disabled={isGeneratingIdeas}>
              {isGeneratingIdeas ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Get Ideas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {isGeneratingIdeas && enhancementIdeas.length === 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent className="grid gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-48 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enhancement Ideas */}
      {enhancementIdeas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Enhancement ideas for "{productName}":</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enhancementIdeas.map((idea, idx) => (
              <Card key={idx} className="overflow-hidden flex flex-col">
                {/* image grid: up to 3 images */}
                <div className="w-full p-2 grid grid-cols-3 gap-2 bg-white">
                  {idea.imageResults && idea.imageResults.length > 0 ? (
                    idea.imageResults.slice(0, 3).map((img: any, i: number) => (
                      <div key={i} className="relative w-full h-24 bg-gray-100 overflow-hidden rounded">
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
                    <div className="col-span-3 h-24 flex items-center justify-center text-gray-400">No image found</div>
                  )}
                </div>

                <div className="flex flex-col flex-grow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="text-primary h-5 w-5" />
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 flex-grow">
                    <p className="text-muted-foreground text-sm flex-grow">{idea.description}</p>

                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" asChild className="w-fit">
                        <a href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(idea.googleSearchQuery)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Google
                        </a>
                      </Button>

                      <Button variant="outline" size="sm" asChild className="w-fit">
                        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(idea.googleSearchQuery + " tutorial")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" />
                          YouTube
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

      {/* AR + Trending Products (similar approach) */}
      <Card>
        <CardHeader>
          <CardTitle>AR Visualization</CardTitle>
          <CardDescription>Visualize your creations in augmented reality.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => toast({ title: "Feature Not Available", description: "AR not supported here." })}>
            <Camera className="mr-2 h-4 w-4" />
            Launch AR Viewer
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col flex-grow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2"><TrendingUp /> Trending Artisan Products</div>
            <Button variant="ghost" size="icon" onClick={handleFetchTrends} disabled={isFetchingTrends}>
              <RefreshCw className={`h-4 w-4 ${isFetchingTrends ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
          <CardDescription>Discover what's currently popular in the handmade and artisan market.</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow">
            <div className="pr-4">
              {isFetchingTrends && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-[200px] w-full rounded-lg" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              )}

              {!isFetchingTrends && trendingProducts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingProducts.map((product, i) => (
                    <Card key={i} className="flex flex-col overflow-hidden">
                      <div className="w-full p-2 grid grid-cols-3 gap-2 bg-white">
                        {product.imageResults && product.imageResults.length > 0 ? (
                          product.imageResults.slice(0, 3).map((img: any, j: number) => (
                            <div key={j} className="relative w-full h-24 bg-gray-100 overflow-hidden rounded">
                              <Image src={img.link} alt={img.title || product.name} fill style={{ objectFit: "cover" }} unoptimized />
                            </div>
                          ))
                        ) : (
                          <div className="col-span-3 h-24 flex items-center justify-center text-gray-400">No image</div>
                        )}
                      </div>

                      <div className="p-4 flex-grow">
                        <h4 className="font-semibold text-base mb-1">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {!isFetchingTrends && trendingProducts.length === 0 && (
                <div className="text-center h-40 flex flex-col justify-center items-center">
                  <p className="text-muted-foreground">Click refresh to fetch trending products.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
