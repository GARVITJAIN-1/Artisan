'use server';

import { identifyMaterialsFromPhoto } from "@/ai/assist_flow/identify-materials";
import { summarizePrices } from "@/ai/assist_flow/summarize-prices";
import { findEvents } from "@/ai/assist_flow/find-events-flow";

import { getEnhancementIdeas } from "@/ai/assist_flow/get-enhancement-ideas-flow";
import { getPriceSuggestion } from "@/ai/assist_flow/get-price-suggestion-flow";
import { findPlaces } from "@/ai/assist_flow/find-places-flow";
import { getTrendingProducts } from "@/ai/assist_flow/get-trending-products-flow";
import type { Material } from "./types";
import { MOCK_SUPPLIERS_FOR_SUMMARY } from "./mock-data";

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function identifyMaterialsFromPhotoAction(formData: FormData) {
  const file = formData.get("photo") as File;

  if (!file || file.size === 0) {
    return { error: "No file uploaded." };
  }

  try {
    const photoDataUri = await fileToDataURL(file);
    const result = await identifyMaterialsFromPhoto({ photoDataUri });
    return { materials: result.materials };
  } catch (error) {
    console.error(error);
    return { error: "Failed to identify materials from the photo." };
  }
}

export async function summarizePricesAction(materials: Material[]) {
  if (!materials || materials.length === 0) {
    return { error: "No materials provided for price summary." };
  }

  try {
    const result = await summarizePrices({
      materials: materials.map((m) => ({
        name: m.name,
        quantity: m.quantity,
        unit: m.unit,
      })),
      suppliers: MOCK_SUPPLIERS_FOR_SUMMARY,
    });
    return { summary: result.summary };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate price summary." };
  }
}

export async function getPriceSuggestionAction(product: string, currency: string) {
    try {
        const result = await getPriceSuggestion({ product, currency });
        return { suggestion: result };
    } catch (error) {
        console.error(error);
        return { error: "Failed to suggest a price." };
    }
}

export async function findPlacesAction(query: string, city: string, mode: 'sell' | 'buy') {
    try {
        const result = await findPlaces({ query, city, mode });
        return { places: result.places };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error in findPlacesAction:', error);
        return { error: `Failed to find places: ${errorMessage}` };
    }
}


export async function findEventsAction(country: string, state?: string) {
    try {
        const result = await findEvents({ country, state });
        return { events: result.events };
    } catch (error) {
        console.error(error);
        return { error: "Failed to find events." };
    }
}



export async function getEnhancementIdeasAction(productName: string, productDescription: string) {
    try {
      const result = await getEnhancementIdeas({ productName, productDescription });
      return { ideas: result.ideas };
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { error: `Failed to generate enhancement ideas: ${errorMessage}` };
    }
}

export async function getTrendingProductsAction() {
    try {
        const result = await getTrendingProducts();
        return { products: result.products };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { error: `Failed to fetch trending products: ${errorMessage}` };
    }
}
