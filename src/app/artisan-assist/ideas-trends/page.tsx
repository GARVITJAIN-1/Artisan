
"use client";

import { useState, useTransition, FC, useEffect } from "react";
import type {
  EnhancementIdea,
  TrendingProduct,
} from "@/lib/types";
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
} from "lucide-react";
import {
  getEnhancementIdeasAction,
  getTrendingProductsAction,
} from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export default function IdeasTrendsPage() {
  const { toast } = useToast();

  const [isGeneratingIdeas, startGeneratingIdeas] = useTransition();
  const [isFetchingTrends, startFetchingTrends] = useTransition();

  const [productName, setProductName] = useState<string>("");
  const [enhancementIdeas, setEnhancementIdeas] = useState<EnhancementIdea[]>(
    []
  );
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>(
    []
  );

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
      const result = await getEnhancementIdeasAction(productName, ""); // Empty description
      console.log('getEnhancementIdeasAction result:', result);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else if (result.ideas) {
        setEnhancementIdeas(result.ideas);
      }
    });
  };

  const handleFetchTrends = () => {
    setTrendingProducts([]);
    startFetchingTrends(async () => {
      const result = await getTrendingProductsAction();
      console.log('getTrendingProductsAction result:', result);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error fetching trends",
          description: result.error,
        });
      } else if (result.products) {
        setTrendingProducts(result.products);
      }
    });
  };

  useEffect(() => {
    if (trendingProducts.length === 0) {
      handleFetchTrends();
    }
  }, [trendingProducts.length]);

  return (
    <div className="flex-grow flex flex-col justify-center gap-6 mt-0">
      <Card>
        <CardHeader>
          <CardTitle>Product Ideas</CardTitle>
          <CardDescription>
            Enter your product to get AI-powered ideas for making it stand
            out.
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
                onKeyDown={(e) =>
                  e.key === "Enter" && handleGetEnhancementIdeas()
                }
              />
            </div>
            <Button
              onClick={handleGetEnhancementIdeas}
              disabled={isGeneratingIdeas}
            >
              {isGeneratingIdeas ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Get Ideas
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGeneratingIdeas && enhancementIdeas.length === 0 && (
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="grid gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-48 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {enhancementIdeas.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-lg font-semibold">
            Here are some ideas to enhance your {productName}:
          </h3>
          {enhancementIdeas.map((idea, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="text-primary" />
                  {idea.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-muted-foreground">{idea.description}</p>
                <Button variant="outline" asChild className="w-fit">
                  <a
                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                      idea.googleSearchQuery
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2" />
                    Find Inspiration on Google
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isGeneratingIdeas &&
        enhancementIdeas.length === 0 &&
        !productName && (
          <div className="text-center p-8 rounded-lg bg-muted/50">
            <Lightbulb className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Your product enhancement ideas will appear here.
            </p>
          </div>
        )}

      <Card className="flex flex-col flex-grow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp />
              Trending Artisan Products
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFetchTrends}
              disabled={isFetchingTrends}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetchingTrends ? "animate-spin" : ""
                }`}
              />
            </Button>
          </CardTitle>
          <CardDescription>
            Discover what's currently popular in the handmade and artisan
            market, with AI-generated visual inspiration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow">
            <div className="pr-4">
              {isFetchingTrends ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="space-y-3">
                      <Skeleton className="h-40 w-full rounded-lg" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : trendingProducts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingProducts.map((product, index) => (
                    <Card key={index} className="flex flex-col">
                      <CardHeader className="p-0">
                        <div className="aspect-video relative rounded-t-lg overflow-hidden">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-grow">
                        <h4 className="font-semibold text-base mb-1">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center h-40 flex flex-col justify-center items-center">
                  <p className="text-muted-foreground">
                    Click refresh to fetch trending products.
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
