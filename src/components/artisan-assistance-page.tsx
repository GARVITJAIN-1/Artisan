

"use client";

import { useState, useTransition, FC, useEffect } from "react";
import type { Place, Event, EnhancementIdea, TrendingProduct } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TabsContent,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  MapPin,
  Search,
  BadgeDollarSign,
  Sparkles,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { findEventsAction, getEnhancementIdeasAction, getPriceSuggestionAction, findPlacesAction, getTrendingProductsAction } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";


const defaultProductToSell = "handmade ceramic mugs";
const defaultMaterialToBuy = "pottery clay";

export default function ArtisanAssistPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'sourcing';
  
  const [isFindingPlaces, startFindingPlaces] = useTransition();
  const [isFindingEvents, startFindingEvents] = useTransition();
  const [isFindingLocalEvents, startFindingLocalEvents] = useTransition();
  const [isGeneratingIdeas, startGeneratingIdeas] = useTransition();
  const [isSuggestingPrice, startSuggestingPrice] = useTransition();
  const [isFetchingTrends, startFetchingTrends] = useTransition();
  
  const [sourcingMode, setSourcingMode] = useState<"sell" | "buy">("sell");
  const [city, setCity] = useState<string>("Jaipur");
  const [productToSell, setProductToSell] = useState<string>(defaultProductToSell);
  const [materialToBuy, setMaterialToBuy] = useState<string>(defaultMaterialToBuy);
  const [currency, setCurrency] = useState<string>("INR");

  const [places, setPlaces] = useState<Place[]>([]);
  const [priceSuggestion, setPriceSuggestion] = useState<{priceRange: string; justification: string} | null>(null);

  const [productName, setProductName] = useState<string>("");
  const [enhancementIdeas, setEnhancementIdeas] = useState<EnhancementIdea[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);


  const [events, setEvents] = useState<Event[]>([]);
  const [localEvents, setLocalEvents] = useState<Event[]>([]);
  
  const [eventCountry, setEventCountry] = useState<string>("India");
  const [localEventState, setLocalEventState] = useState<string>("Rajasthan");
  const [localEventCountry, setLocalEventCountry] = useState<string>("India");

  const handleSourcingModeChange = (mode: "sell" | "buy") => {
    setSourcingMode(mode);
    setPlaces([]);
    setPriceSuggestion(null);
    setProductToSell(defaultProductToSell);
    setMaterialToBuy(defaultMaterialToBuy);
  };
  
  const handleFindPlaces = async () => {
    const query = sourcingMode === 'sell' ? productToSell : materialToBuy;
    if (!query) {
        toast({ variant: 'destructive', title: 'Input missing', description: 'Please specify what you want to sell or buy.' });
        return;
    }

    startFindingPlaces(async () => {
        setPlaces([]);
        setPriceSuggestion(null);

        if (sourcingMode === 'sell') {
            startSuggestingPrice(async () => {
                const priceResult = await getPriceSuggestionAction(productToSell, currency);
                 if (priceResult.error) {
                    toast({ variant: 'destructive', title: 'Pricing Error', description: priceResult.error });
                } else if (priceResult.suggestion) {
                    setPriceSuggestion(priceResult.suggestion);
                }
            });
        }
        
        const placesResult = await findPlacesAction(query, city, sourcingMode);
        if (placesResult.error) {
            toast({ variant: 'destructive', title: 'Error finding places', description: placesResult.error });
        } else if (placesResult.places) {
            setPlaces(placesResult.places);
        }
    });
  };

  const handleFindEvents = () => {
    setEvents([]);
    startFindingEvents(async () => {
        const result = await findEventsAction(eventCountry);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else if (result.events) {
            setEvents(result.events);
        }
    });
  };
  
  const handleFindLocalEvents = () => {
    setLocalEvents([]);
    startFindingLocalEvents(async () => {
        const result = await findEventsAction(localEventCountry, localEventState);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else if (result.events) {
            setLocalEvents(result.events);
        }
    });
  };

  const handleGetEnhancementIdeas = () => {
      if (!productName) {
          toast({ variant: 'destructive', title: 'Input Missing', description: 'Please provide a product name.' });
          return;
      }
      setEnhancementIdeas([]);
      startGeneratingIdeas(async () => {
          const result = await getEnhancementIdeasAction(productName, ""); // Empty description
          if (result.error) {
              toast({ variant: 'destructive', title: 'Error', description: result.error });
          } else if (result.ideas) {
              setEnhancementIdeas(result.ideas);
          }
      });
  };

  const handleFetchTrends = () => {
    setTrendingProducts([]);
    startFetchingTrends(async () => {
      const result = await getTrendingProductsAction();
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error fetching trends', description: result.error });
      } else if (result.products) {
        setTrendingProducts(result.products);
      }
    });
  };

  useEffect(() => {
    if (defaultTab === 'ideas' && trendingProducts.length === 0) {
      handleFetchTrends();
    }
  }, [defaultTab, trendingProducts.length]);


  return (
        <>
            <TabsContent value="sourcing" className="flex-grow flex flex-col mt-0">
                <Card className="flex-grow flex flex-col">
                    <CardHeader>
                        <CardTitle>Find Shops &amp; Get Price Insights</CardTitle>
                        <CardDescription>Select whether you want to find places to sell your products or buy raw materials.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 flex-grow">
                        <div className="grid gap-6">
                            <div className="flex items-center space-x-6">
                                <RadioGroup defaultValue="sell" value={sourcingMode} onValueChange={(value) => handleSourcingModeChange(value as "sell" | "buy")} className="flex items-center">
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
                                {sourcingMode === 'sell' ? (
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
                                        <Label htmlFor="material-to-buy">Raw Material to Buy</Label>
                                        <Input
                                            id="material-to-buy"
                                            placeholder="e.g. pottery clay, blue glaze"
                                            value={materialToBuy}
                                            onChange={(e) => setMaterialToBuy(e.target.value)}
                                        />
                                    </div>
                                )}
                                <Button onClick={handleFindPlaces} disabled={isFindingPlaces || (sourcingMode === 'sell' && isSuggestingPrice)}>
                                    {isFindingPlaces ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="mr-2 h-4 w-4" />
                                    )}
                                    Find
                                </Button>
                            </div>
                        </div>
                        
                        {(isSuggestingPrice && sourcingMode === 'sell') && (
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
                                    <CardDescription>{priceSuggestion.justification}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{priceSuggestion.priceRange}</p>
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
                                                    <span className="text-muted-foreground">Searching for relevant places in {city}...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : places.length > 0 ? (
                                        places.map((place, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{place.name}</TableCell>
                                                <TableCell>{place.address}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`} target="_blank" rel="noopener noreferrer">
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
                                                No relevant places found. Try a different search or city.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="ideas" className="flex-grow flex flex-col justify-center gap-6 mt-0">
                 <Card>
                    <CardHeader>
                        <CardTitle>Product Ideas</CardTitle>
                        <CardDescription>Enter your product to get AI-powered ideas for making it stand out.</CardDescription>
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
                                    onKeyDown={(e) => e.key === 'Enter' && handleGetEnhancementIdeas()}
                                />
                            </div>
                            <Button onClick={handleGetEnhancementIdeas} disabled={isGeneratingIdeas}>
                                {isGeneratingIdeas ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
                        <h3 className="text-lg font-semibold">Here are some ideas to enhance your {productName}:</h3>
                        {enhancementIdeas.map((idea, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Lightbulb className="text-primary"/>
                                    {idea.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <p className="text-muted-foreground">{idea.description}</p>
                                <Button variant="outline" asChild className="w-fit">
                                    <a href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(idea.googleSearchQuery)}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2" />
                                        Find Inspiration on Google
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                )}

                {!isGeneratingIdeas && enhancementIdeas.length === 0 && !productName && (
                    <div className="text-center p-8 rounded-lg bg-muted/50">
                        <Lightbulb className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">Your product enhancement ideas will appear here.</p>
                    </div>
                )}

                <Card className="flex flex-col flex-grow">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp />
                                Trending Artisan Products
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleFetchTrends} disabled={isFetchingTrends}>
                                <RefreshCw className={`h-4 w-4 ${isFetchingTrends ? 'animate-spin' : ''}`} />
                            </Button>
                        </CardTitle>
                        <CardDescription>Discover what's currently popular in the handmade and artisan market, with AI-generated visual inspiration.</CardDescription>
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
                                                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 flex-grow">
                                                    <h4 className="font-semibold text-base mb-1">{product.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center h-40 flex flex-col justify-center items-center">
                                        <p className="text-muted-foreground">Click refresh to fetch trending products.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="events" className="flex-grow flex flex-col mt-0">
                <div className="grid gap-6 flex-grow grid-rows-2">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Find Local Events</CardTitle>
                            <CardDescription>Discover upcoming events in your specific state or region.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-grow">
                            <div className="flex items-end gap-2 mb-4">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="local-event-state">State / Region</Label>
                                    <Input
                                        id="local-event-state"
                                        placeholder="e.g. Rajasthan"
                                        value={localEventState}
                                        onChange={(e) => setLocalEventState(e.target.value)}
                                    />
                                </div>
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="local-event-country">Country</Label>
                                    <Input
                                        id="local-event-country"
                                        placeholder="e.g. India"
                                        value={localEventCountry}
                                        onChange={(e) => setLocalEventCountry(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleFindLocalEvents} disabled={isFindingLocalEvents}>
                                    {isFindingLocalEvents ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    Find Local Events
                                </Button>
                            </div>
                            <ScrollArea className="flex-grow">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead className="text-right">Link</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isFindingLocalEvents ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">
                                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                                </TableCell>
                                            </TableRow>
                                        ) : localEvents.length > 0 ? (
                                            localEvents.map((event, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{event.name}</TableCell>
                                                    <TableCell>{event.date}</TableCell>
                                                    <TableCell>{event.location}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={event.link} target="_blank" rel="noopener noreferrer">Register</a>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">
                                                    No upcoming local events found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Find National Events</CardTitle>
                            <CardDescription>Discover events across the entire country to showcase your work.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-grow">
                            <div className="flex items-end gap-2 mb-4">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="event-country">Country</Label>
                                    <Input
                                        id="event-country"
                                        placeholder="e.g. India"
                                        value={eventCountry}
                                        onChange={(e) => setEventCountry(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleFindEvents} disabled={isFindingEvents}>
                                    {isFindingEvents ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    Find National Events
                                </Button>
                            </div>
                            <ScrollArea className="flex-grow">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead className="text-right">Link</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isFindingEvents ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">
                                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                                </TableCell>
                                            </TableRow>
                                        ) : events.length > 0 ? (
                                            events.map((event, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{event.name}</TableCell>
                                                    <TableCell>{event.date}</TableCell>
                                                    <TableCell>{event.location}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={event.link} target="_blank" rel="noopener noreferrer">Register</a>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">
                                                No upcoming national events found. Try a different country.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </>
  );
}
