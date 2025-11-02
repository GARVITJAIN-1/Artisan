'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/actions';
import type { Order, Todo, FormState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Sparkles, Trash2, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getAiTaskSuggestions } from '@/lib/actions';

const orderItemSchema = z.object({
  description: z.string().min(3, 'Item description must be at least 3 characters.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
});

const formSchema = z.object({
  clientName: z.string().min(2, 'Client name must be at least 2 characters.'),
  deadline: z.string().refine(val => !isNaN(Date.parse(val)), 'A valid deadline is required.'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required.'),
});

type OrderFormValues = z.infer<typeof formSchema>;

const initialState: FormState = { message: '' };

interface NewOrderFormProps {
  onOrderCreated: (order: Order, todos: Todo[]) => void;
}

export default function NewOrderForm({ onOrderCreated }: NewOrderFormProps) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: '',
      deadline: '',
      items: [{ description: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const [state, formAction, isPending] = useActionState(createOrder, initialState);
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const submissionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.submissionId && submissionIdRef.current !== state.submissionId) {
       submissionIdRef.current = state.submissionId; // Mark as processed immediately
       
       if (state.type === 'success') {
         toast({
           title: 'Order Created',
           description: state.message,
         });
         if (state.data) {
           onOrderCreated(state.data.order, state.data.todos);
         }
         form.reset();
       } else if (state.type === 'error') {
         toast({
           variant: 'destructive',
           title: 'Error',
           description: state.message,
         });
       }
    }
  }, [state, onOrderCreated, form, toast]);


  const handleGetSuggestions = async () => {
    const clientName = form.getValues('clientName');
    const firstItem = form.getValues('items.0.description');
    if (!clientName || !firstItem) {
        toast({
            variant: 'destructive',
            title: 'Cannot get suggestions',
            description: 'Please provide a client name and at least one item description.'
        });
        return;
    }
    
    setIsSuggesting(true);
    const suggestions = await getAiTaskSuggestions(clientName, firstItem);
    if(suggestions.length > 0) {
        // Replace current items with suggestions
        remove();
        suggestions.forEach(suggestion => append({ description: suggestion, quantity: 1 }));
    } else {
        toast({
            title: 'No suggestions found',
            description: 'Could not generate AI suggestions at this time.'
        });
    }
    setIsSuggesting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
        <CardDescription>Add a new order and its items. The items will become your to-dos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            // @ts-ignore
            action={formAction}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Order Items</Label>
                <Button type="button" variant="ghost" size="sm" onClick={handleGetSuggestions} disabled={isSuggesting}>
                    {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4 text-accent" />
                    )}
                    AI Suggest
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder={`Item ${index + 1} description`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" className="w-20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
            <input type="hidden" {...form.register('items')} value={JSON.stringify(form.watch('items'))} />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Order
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
