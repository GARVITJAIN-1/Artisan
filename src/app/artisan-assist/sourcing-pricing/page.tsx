// artisan-assist/sourcing-pricing/page.tsx

"use client";

import { useState, useTransition, FC, useEffect } from "react";
import type { Place } from "@/lib/types";
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
  Store, // Using Store icon for empty state
} from "lucide-react";
import { getPriceSuggestionAction, findPlacesAction } from "@/lib/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator"; // Import Separator

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

  // State to track if a search has been performed
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSourcingModeChange = (mode: "sell" | "buy") => {
    setSourcingMode(mode);
    setPlaces([]);
    setPriceSuggestion(null);
    setProductToSell(defaultProductToSell);
    setMaterialToBuy(defaultMaterialToBuy);
    setSearchPerformed(false); // Reset search status
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

    setSearchPerformed(true); // Mark that a search was tried

    startFindingPlaces(async () => {
      setPlaces([]);
      setPriceSuggestion(null);

      if (sourcingMode === "sell") {
        startSuggestingPrice(async () => {
          const priceResult = await getPriceSuggestionAction(
            productToSell,
            currency
          );
          console.log("getPriceSuggestionAction result:", priceResult);
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
      console.log("findPlacesAction result:", placesResult);
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

  // Helper component for loading/empty table states
  const TablePlaceholder = () => (
    <TableRow>
      <TableCell colSpan={3} className="h-[400px]">
        <div className="flex flex-col items-center justify-center h-full gap-2 text-stone-500">
          {isFindingPlaces ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
              <p className="font-medium text-stone-600">
                Searching for relevant places in {city}...
              </p>
            </>
          ) : (
            <>
              <Store className="h-12 w-12" />
              <p className="font-medium">No relevant places found.</p>
              <p className="text-sm">Try a different search or city.</p>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    // Updated background and padding
    <div className="flex-grow p-4 md:p-8 bg-gradient-to-b from-[#FBF9F6] to-amber-50">
      {/* Updated Card style */}
      <Card className="flex-grow flex flex-col bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
        <CardHeader>
          <CardTitle className="text-stone-900">
            Find Shops & Get Price Insights
          </CardTitle>
          <CardDescription className="text-stone-600">
            Select whether you want to find places to sell your products or buy
            raw materials.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 flex-grow">
          {/* ## Updated Controls Layout ## */}
          <div className="grid gap-4">
            {/* Group 1: Mode & City */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid gap-1.5">
                <Label className="text-stone-700">I want to...</Label>
                <RadioGroup
                  defaultValue="sell"
                  value={sourcingMode}
                  onValueChange={(value) =>
                    handleSourcingModeChange(value as "sell" | "buy")
                  }
                  className="flex items-center"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="sell"
                      id="r1"
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <Label htmlFor="r1" className="text-stone-700 font-normal">
                      Sell Products
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="buy"
                      id="r2"
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <Label htmlFor="r2" className="text-stone-700 font-normal">
                      Buy Materials
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid w-full max-w-xs items-center gap-1.5">
                <Label htmlFor="city" className="text-stone-700">
                  In City
                </Label>
                <Input
                  id="city"
                  placeholder="e.g. Jaipur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Group 2: Query & Action */}
            <div className="flex flex-wrap items-end gap-3">
              {sourcingMode === "sell" ? (
                <>
                  <div className="grid w-full flex-1 min-w-[250px] items-center gap-1.5">
                    <Label htmlFor="product-to-sell" className="text-stone-700">
                      Product to Sell
                    </Label>
                    <Input
                      id="product-to-sell"
                      placeholder="e.g. handmade ceramic mugs"
                      value={productToSell}
                      onChange={(e) => setProductToSell(e.target.value)}
                      className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid items-center gap-1.5">
                    <Label htmlFor="currency" className="text-stone-700">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger
                        id="currency"
                        className="w-[100px] bg-white/50 border-stone-300 focus:ring-amber-500"
                      >
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
                <div className="grid w-full flex-1 min-w-[250px] items-center gap-1.5">
                  <Label htmlFor="material-to-buy" className="text-stone-700">
                    Raw Material to Buy
                  </Label>
                  <Input
                    id="material-to-buy"
                    placeholder="e.g. pottery clay, blue glaze"
                    value={materialToBuy}
                    onChange={(e) => setMaterialToBuy(e.target.value)}
                    className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              )}
              {/* Updated Button style */}
              <Button
                onClick={handleFindPlaces}
                disabled={
                  isFindingPlaces ||
                  (sourcingMode === "sell" && isSuggestingPrice)
                }
                className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
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

          {/* ## Updated Results Section ## */}
          <Separator className="my-4 bg-stone-200" />

          {isSuggestingPrice && sourcingMode === "sell" && (
            <div className="flex items-center text-stone-500 p-2">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-amber-600" />
              <span>Analyzing market prices for your product...</span>
            </div>
          )}

          {priceSuggestion && (
            // Updated Price Card style
            <Card className="bg-amber-50/70 border border-amber-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <BadgeDollarSign /> Suggested Selling Price
                </CardTitle>
                <CardDescription className="text-amber-900/80">
                  {priceSuggestion.justification}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-800">
                  {priceSuggestion.priceRange}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Fixed height ScrollArea for table */}
          <ScrollArea className="h-[450px] border border-stone-200/80 rounded-md">
            <Table>
              <TableHeader className="bg-stone-50/50 sticky top-0 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="text-stone-700 font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="text-stone-700 font-semibold">
                    Address
                  </TableHead>
                  <TableHead className="text-right text-stone-700 font-semibold">
                    View on Map
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Updated logic to use TablePlaceholder */}
                {isFindingPlaces || (places.length === 0 && searchPerformed) ? (
                  <TablePlaceholder />
                ) : (
                  places.map((place, index) => (
                    // Added row hover effect
                    <TableRow
                      key={index}
                      className="border-stone-200/80 hover:bg-amber-50/50 transition-colors"
                    >
                      <TableCell className="font-medium text-stone-800">
                        {place.name}
                      </TableCell>
                      <TableCell className="text-stone-600">
                        {place.address}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Updated outline Button style */}
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition-all"
                        >
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
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
