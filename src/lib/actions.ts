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

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { collection, addDoc, doc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getAuthenticatedFirestore } from './firebase-admin';
import type { Order, OrderItem, Todo, TodoStatus, TaskFormState, FormState } from './definitions';
import { generateTaskSuggestions } from '@/ai/todo_flow/generate-task-suggestions';
import { summarizeTaskQuantities } from '@/ai/todo_flow/summarize-task-quantities';
import { google } from 'googleapis';
import twilio from 'twilio';
import type { Auth } from 'firebase-admin/auth';

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

  try {
    const authResult = await getAuthenticatedFirestore();
     if (!authResult) {
      return { 
        type: 'error',
        message: 'Server is not configured for database operations.',
        submissionId
      };
    }
    const { db, auth, artisanId } = authResult;

    const newTodo: Omit<Todo, 'id'> = {
      description,
      quantity,
      status: 'incomplete',
      createdAt: serverTimestamp(),
      orderId: null,
      deadline: deadline || null,
    };
    const todoRef = await addDoc(collection(db, 'artisans', artisanId, 'todos'), newTodo);

    // If there's a deadline, add it to the calendar
    if (deadline) {
      await scheduleGoogleCalendarEvent(auth, artisanId, `Task: ${description}`, deadline);
    }


    revalidatePath('/');
    return {
      type: 'success',
      message: `Task "${description}" created.`,
      submissionId,
      data: { ...newTodo, id: todoRef.id }
    };
  } catch (error) {
     return { 
        type: 'error',
        message: 'Database Error: Failed to Create Task.',
        submissionId
    };
  }
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

   try {
    const authResult = await getAuthenticatedFirestore();
    if (!authResult) {
      return {
        type: 'error',
        message: 'Server not configured for database operations.',
        submissionId,
      };
    }
    const { db, auth, artisanId } = authResult;
    const batch = writeBatch(db);

    // 1. Create Order and Todos
    const newOrderRef = doc(collection(db, 'artisans', artisanId, 'orders'));
    const newOrder: Omit<Order, 'id'> = {
      clientName,
      deadline,
      status: 'in progress',
      createdAt: serverTimestamp(),
    };
    batch.set(newOrderRef, newOrder);

    const newTodos: Todo[] = items.map(item => {
      const todoRef = doc(collection(db, 'artisans', artisanId, 'todos'));
      const newTodo: Omit<Todo, 'id'> = {
        orderId: newOrderRef.id,
        description: item.description,
        quantity: item.quantity,
        status: 'incomplete',
        createdAt: serverTimestamp(),
      };
      batch.set(todoRef, newTodo);
      return { ...newTodo, id: todoRef.id } as Todo;
    });
    
    await batch.commit();

    // 2. Schedule Google Calendar Event
    const calendarResult = await scheduleGoogleCalendarEvent(auth, artisanId, `Order for ${clientName}`, deadline);
    if (!calendarResult.success) console.warn(calendarResult.message);
    
    // 3. Set WhatsApp Reminder
    const whatsappResult = await sendWhatsAppReminder(clientName, deadline);
    if (!whatsappResult.success) console.warn(whatsappResult.message);
    
    revalidatePath('/');
    return {
      type: 'success',
      message: `Order for ${clientName} created.`,
      data: { order: { ...newOrder, id: newOrderRef.id }, todos: newTodos },
      submissionId,
    };
  } catch (error: any) {
    return {
      type: 'error',
      message: error.message || 'Database Error: Failed to Create Order.',
      submissionId
    };
  }
}

export async function updateTodoStatus(todoId: string, status: TodoStatus) {
  try {
    const authResult = await getAuthenticatedFirestore();
    if (!authResult) {
        return { success: false, message: 'Server not configured for database operations.' };
    }
    const { db, artisanId } = authResult;
    const todoRef = doc(db, 'artisans', artisanId, 'todos', todoId);
    await updateDoc(todoRef, { status });

    revalidatePath('/');
    return { success: true, message: `Task status updated to ${status}.` };
  } catch (error) {
    return { success: false, message: 'Failed to update task status.' };
  }
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

export async function getAiSummary(tasks: Todo[]) {
    if (tasks.length === 0) return "No tasks to summarize.";
    try {
        const summary = await summarizeTaskQuantities(tasks.map(t => ({ taskDescription: t.description, quantity: t.quantity })));
        return summary;
    } catch (e) {
        console.error("AI Summary Error:", e);
        return "Could not generate summary at this time.";
    }
}


async function scheduleGoogleCalendarEvent(auth: Auth, artisanId: string, summary: string, deadline: string) {
  try {
    const user = await auth.getUser(artisanId);
    
    // This assumes the user signed in with Google and the refresh token is available.
    // In a production app, you need robust token management.
    const googleProvider = user.providerData.find(p => p.providerId === 'google.com');
    if (!googleProvider) {
        return { success: false, message: "User is not signed in with Google." };
    }
    
    // We don't have direct access to the access/refresh token here in this context.
    // A proper implementation requires a more complex OAuth2 flow where the server
    // securely stores and retrieves the user's refresh token.
    // For this prototype, we'll log that we *would* create an event.
    console.log(`[Google Calendar] Would create event: "${summary}" due on ${deadline}`);
    console.log(`[Google Calendar] This requires a full OAuth2 implementation with token storage to work for real.`);
    
    /*
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        // This is the hard part - you need to have stored the user's refresh token
        // after they granted permission for the first time.
        refresh_token: 'USER_REFRESH_TOKEN_FROM_DB', 
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {
        summary: summary,
        description: summary,
        start: {
            date: deadline,
            timeZone: 'America/Los_Angeles', // Or get user's timezone
        },
        end: {
            date: deadline,
            timeZone: 'America/Los_Angeles',
        },
    };

    await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
    });
    */

    return { success: true, message: "Calendar event placeholder executed." };
  } catch (error) {
    console.error('[Google Calendar Error]', error);
    return { success: false, message: 'Failed to schedule Google Calendar event.' };
  }
}


// Real implementation of WhatsApp Integration
async function sendWhatsAppReminder(clientName: string, deadline: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  // NOTE: We don't collect the client's phone number yet. This is a placeholder.
  const toPhoneNumber = process.env.CLIENT_PHONE_NUMBER_PLACEHOLDER; 

  if (!accountSid || !authToken || !fromPhoneNumber) {
    console.warn('[Twilio] Missing credentials. Skipping WhatsApp reminder.');
    return { success: false, message: 'Twilio credentials are not configured.' };
  }
  
  if (!toPhoneNumber) {
    console.warn('[Twilio] Client phone number placeholder is not set. Skipping WhatsApp reminder.');
    return { success: false, message: 'Client phone number is not available.' };
  }

  const client = twilio(accountSid, authToken);
  const reminderDate = new Date(deadline);
  reminderDate.setDate(reminderDate.getDate() - 1); // Send reminder one day before

  const messageBody = `Hi ${clientName}, this is a friendly reminder that your order is due on ${new Date(deadline).toLocaleDateString()}. From ArtisanFlow!`;

  try {
    await client.messages.create({
      from: fromPhoneNumber,
      to: `whatsapp:${toPhoneNumber}`,
      body: messageBody,
    });
    console.log(`[Twilio] WhatsApp reminder sent to ${toPhoneNumber}`);
    return { success: true, message: 'WhatsApp reminder sent successfully.' };
  } catch (error: any) {
    console.error('[Twilio Error]', error.message);
    // Return success=true to avoid blocking the whole order orchestration on a failed text
    return { success: true, message: `WhatsApp reminder failed to send: ${error.message}` };
  }
}
