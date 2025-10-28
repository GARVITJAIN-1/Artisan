
"use client";

import { useState, useTransition, FC, useEffect } from "react";
import type {
  Place,
  Event,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  MapPin,
  Search,
  BadgeDollarSign,
  Sparkles,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import {
  findEventsAction,
  getEnhancementIdeasAction,
  getPriceSuggestionAction,
  findPlacesAction,
  getTrendingProductsAction,
} from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

const defaultProductToSell = "handmade ceramic mugs";
const defaultMaterialToBuy = "pottery clay";

export default function SourcingPricingPage() {
  const { toast } = useToast();

  const [isFindingPlaces, startFindingPlaces] = useTransition();
  const [isSuggestingPrice, startSuggestingPrice] = useTransition();

  const [sourcingMode, setSourcingMode] = useState<"sell" | "buy">("sell");
  const [city, setCity] = useState<string>("Jaipur");
  const [productToSell, setProductToSell] =
    useState<string>(defaultProductToSell);
  const [materialToBuy, setMaterialToBuy] =
    useState<string>(defaultMaterialToBuy);
  const [currency, setCurrency] = useState<string>("INR");

  const [places, setPlaces] = useState<Place[]>([]);
  const [priceSuggestion, setPriceSuggestion] = useState<{
    priceRange: string;
    justification: string;
  } | null>(null);

  const handleSourcingModeChange = (mode: "sell" | "buy") => {
    setSourcingMode(mode);
    setPlaces([]);
    setPriceSuggestion(null);
    setProductToSell(defaultProductToSell);
    setMaterialToBuy(defaultMaterialToBuy);
  };

  const handleFindPlaces = async () => {
    const query = sourcingMode === "sell" ? productToSell : materialToBuy;
    if (!query) {
      toast({
        variant: "destructive",
        title: "Input missing",
        description: "Please specify what you want to sell or buy.",
      });
      return;
    }

    startFindingPlaces(async () => {
      setPlaces([]);
      setPriceSuggestion(null);

      if (sourcingMode === "sell") {
        startSuggestingPrice(async () => {
          const priceResult = await getPriceSuggestionAction(
            productToSell,
            currency
          );
          console.log('getPriceSuggestionAction result:', priceResult);
          if (priceResult.error) {
            toast({
              variant: "destructive",
              title: "Pricing Error",
              description: priceResult.error,
            });
          } else if (priceResult.suggestion) {
            setPriceSuggestion(priceResult.suggestion);
          }
        });
      }

      const placesResult = await findPlacesAction(query, city, sourcingMode);
      console.log('findPlacesAction result:', placesResult);
      if (placesResult.error) {
        toast({
          variant: "destructive",
          title: "Error finding places",
          description: placesResult.error,
        });
      } else if (placesResult.places) {
        setPlaces(placesResult.places);
      }
    });
  };

  return (
    <Card className="flex-grow flex flex-col">
      <CardHeader>
        <CardTitle>Find Shops &amp; Get Price Insights</CardTitle>
        <CardDescription>
          Select whether you want to find places to sell your products or
          buy raw materials.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 flex-grow">
        <div className="grid gap-6">
          <div className="flex items-center space-x-6">
            <RadioGroup
              defaultValue="sell"
              value={sourcingMode}
              onValueChange={(value) =>
                handleSourcingModeChange(value as "sell" | "buy")
              }
              className="flex items-center"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sell" id="r1" />
                <Label htmlFor="r1">Sell Products</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buy" id="r2" />
                <Label htmlFor="r2">Buy Raw Materials</Label>
              </div>
            </RadioGroup>
            <div className="grid w-full max-w-xs items-center gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. Jaipur"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            {sourcingMode === "sell" ? (
              <>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="product-to-sell">Product to Sell</Label>
                  <Input
                    id="product-to-sell"
                    placeholder="e.g. handmade ceramic mugs"
                    value={productToSell}
                    onChange={(e) => setProductToSell(e.target.value)}
                  />
                </div>
                <div className="grid items-center gap-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency" className="w-[100px]">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="material-to-buy">
                  Raw Material to Buy
                </Label>
                <Input
                  id="material-to-buy"
                  placeholder="e.g. pottery clay, blue glaze"
                  value={materialToBuy}
                  onChange={(e) => setMaterialToBuy(e.target.value)}
                />
              </div>
            )}
            <Button
              onClick={handleFindPlaces}
              disabled={
                isFindingPlaces ||
                (sourcingMode === "sell" && isSuggestingPrice)
              }
            >
              {isFindingPlaces ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Find
            </Button>
          </div>
        </div>

        {isSuggestingPrice && sourcingMode === "sell" && (
          <div className="flex items-center text-muted-foreground p-4">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Analyzing market prices for your product...</span>
          </div>
        )}

        {priceSuggestion && (
          <Card className="bg-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <BadgeDollarSign /> Suggested Selling Price
              </CardTitle>
              <CardDescription>
                {priceSuggestion.justification}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {priceSuggestion.priceRange}
              </p>
            </CardContent>
          </Card>
        )}

        <ScrollArea className="flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">View on Map</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFindingPlaces ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      <span className="text-muted-foreground">
                        Searching for relevant places in {city}...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : places.length > 0 ? (
                places.map((place, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {place.name}
                    </TableCell>
                    <TableCell>{place.address}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            place.address
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Map
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No relevant places found. Try a different search or
                    city.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
