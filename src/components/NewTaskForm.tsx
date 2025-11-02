'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createTodoAction } from '@/lib/actions';
import type { Todo, TaskFormState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  description: z.string().min(3, 'Task description must be at least 3 characters.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  deadline: z.string().optional(),
});

type TaskFormValues = z.infer<typeof formSchema>;

const initialState: TaskFormState = { message: '' };

interface NewTaskFormProps {
  onTaskCreated: (task: Todo) => void;
}

export default function NewTaskForm({ onTaskCreated }: NewTaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      quantity: 1,
      deadline: '',
    },
  });

  const [state, formAction, isPending] = useActionState(createTodoAction, initialState);
  const { toast } = useToast();
  const submissionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.type === 'success' && state.submissionId && submissionIdRef.current !== state.submissionId) {
      toast({
        title: 'Task Created',
        description: state.message,
      });
      if (state.data) {
        onTaskCreated(state.data);
      }
      form.reset();
      submissionIdRef.current = state.submissionId;
    } else if (state.type === 'error' && state.submissionId && submissionIdRef.current !== state.submissionId) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
      submissionIdRef.current = state.submissionId;
    }
  }, [state, onTaskCreated, form, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
        <CardDescription>Add a standalone task or reminder. Add a deadline to sync with your calendar.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            action={formAction}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Buy more clay" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                    <FormItem className="w-24">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>Deadline (Optional)</FormLabel>
                        <FormControl>
                        <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
