
'use client';

import {
  Store,
  Lightbulb,
  CalendarDays,
  FileText,
  ChevronRight,
  Home,
} from 'lucide-react';
import { ArtisanAssistIcon, SourcingIcon, ProductIdeasIcon, EventsIcon } from '@/components/ui/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const features = [
   {
    icon: <SourcingIcon className="h-8 w-8 mb-4 text-primary" />,
    title: 'Sourcing & Selling',
    description: 'Find local shops to sell your products or buy raw materials. Get AI-powered price suggestions.',
    link: '/artisan-assist?tab=sourcing',
    linkText: 'Find Shops'
  },
  {
    icon: <ProductIdeasIcon className="h-8 w-8 mb-4 text-primary" />,
    title: 'ArtisianGali',
    description: 'Get personalized enhancement ideas for your products based on current market trends.',
    link: '/artisan-assist?tab=ideas',
    linkText: 'Get Ideas'
  },
  {
    icon: <EventsIcon className="h-8 w-8 mb-4 text-primary" />,
    title: 'Events & Fairs',
    description: 'Discover upcoming craft fairs, exhibitions, and markets in your state or country.',
    link: '/artisan-assist?tab=events',
    linkText: 'Find Events'
  },
  {
    icon: <EventsIcon className="h-8 w-8 mb-4 text-primary" />,
    title: 'Government Schemes',
    description: 'Find relevant government schemes, grants, and support programs for artisans.',
    link: '/artisan-assist?tab=schemes',
    linkText: 'Find Schemes'
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="text-center py-12">
           <ArtisanAssistIcon className="h-16 w-16 text-primary mb-4 mx-auto" />
          <h2 className="text-4xl font-bold tracking-tight">Welcome to ArtisanAssist</h2>
           <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Your AI-powered co-pilot for navigating the world of artisan commerce. Use the menu to discover tools that help you find suppliers, generate product ideas, locate events, and uncover government schemes.
          </p>
          <p className="mt-6 italic text-muted-foreground max-w-3xl mx-auto">
              "The heart of the artisan is a cathedral of creativity, where every piece is a prayer of passion."
          </p>
        </div>
      </main>
    </div>
  );
}
