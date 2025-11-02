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

import { z } from 'zod';
import type { Order, OrderItem, Todo, TodoStatus, TaskFormState, FormState } from './definitions';
import { generateTaskSuggestions } from '@/ai/todo_flow/generate-task-suggestions';
import { summarizeTaskQuantities } from '@/ai/todo_flow/summarize-task-quantities';

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
      const result = await getEnhancementIdeas({productName, productDescription});
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


// Helper to generate a more unique ID
const generateUniqueId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;


const OrderSchema = z.object({
  clientName: z.string().min(2, 'Client name must be at least 2 characters.'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  items: z.array(z.object({
    description: z.string().min(3, 'Item description is too short.'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  })).min(1, 'Order must have at least one item.'),
});

const TodoSchema = z.object({
  description: z.string().min(3, 'Task description must be at least 3 characters long.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  deadline: z.string().optional(),
});

export async function createTodoAction(prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const submissionId = generateUniqueId('sub');
  const validatedFields = TodoSchema.safeParse({
    description: formData.get('description'),
    quantity: formData.get('quantity'),
    deadline: formData.get('deadline') || undefined,
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Failed to create task. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      submissionId,
    };
  }

  const { description, quantity, deadline } = validatedFields.data;

  const newTodo: Todo = {
    id: generateUniqueId('todo'),
    description,
    quantity,
    status: 'incomplete',
    createdAt: new Date().toISOString(),
    orderId: null,
    deadline: deadline || null,
  };

  return {
    type: 'success',
    message: `Task "${description}" created.`,
    submissionId,
    data: newTodo
  };
}

export async function createOrder(prevState: FormState, formData: FormData): Promise<FormState> {
  const submissionId = generateUniqueId('sub');
  const rawData = {
    clientName: formData.get('clientName'),
    deadline: formData.get('deadline'),
    items: JSON.parse(formData.get('items') as string) as OrderItem[],
  };

  const validatedFields = OrderSchema.safeParse(rawData);
  
  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Failed to create order. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      submissionId,
    };
  }
  
  const { clientName, deadline, items } = validatedFields.data;

  const newOrderId = generateUniqueId('order');
  const newOrder: Order = {
    id: newOrderId,
    clientName,
    deadline,
    status: 'in progress',
    createdAt: new Date().toISOString(),
  };

  const newTodos: Todo[] = items.map(item => ({
    id: generateUniqueId('todo'),
    orderId: newOrderId,
    description: item.description,
    quantity: item.quantity,
    status: 'incomplete',
    createdAt: new Date().toISOString(),
  }));

  return {
    type: 'success',
    message: `Order for ${clientName} created.`,
    data: { order: newOrder, todos: newTodos },
    submissionId,
  };
}

export async function updateTodoStatus(todoId: string, status: TodoStatus) {
  return { success: true, message: `Task status updated to ${status}.` };
}

export async function getAiTaskSuggestions(customerName: string, orderDetails: string) {
    if (!customerName || !orderDetails) return [];
    try {
        const result = await generateTaskSuggestions({ customerName, orderDetails });
        return result.suggestions;
    } catch (e) {
        console.error(e);
        return [];
    }
}

interface TaskSummaryInput {
  taskDescription: string;
  quantity: number;
}

export async function getAiSummary(tasks: TaskSummaryInput[]) {
    console.log(tasks)
    if (tasks.length === 0) return "No tasks to summarize.";
    try {
        console.log(tasks)
        const summary = await summarizeTaskQuantities(tasks.map(t => ({ taskDescription: t.description, quantity: t.quantity })));
        return summary;
    } catch (e) {

        console.error("AI Summary Error:", e);
        return "Could not generate summary at this time.";
    }
}
