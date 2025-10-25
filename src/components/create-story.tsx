'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PenSquare, Sparkles } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useSession } from '@/context/session-context';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(20, 'Story must be at least 20 characters.'),
});

type Step = 'write' | 'publishing';

export function CreateStory() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('write');
  const { toast } = useToast();
  const { session } = useSession();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', content: '' },
  });

  async function onPublish() {
    if (!user || !firestore) return;

    const values = form.getValues();
    setStep('publishing');

    try {
      const authorData = {
        id: user.uid,
        name: user.displayName || user.email || 'Anonymous Artisan',
        avatarUrl: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
      };

      const storyData = {
        ...values,
        authorId: user.uid,
        author: authorData,
        createdAt: serverTimestamp(),
        commentCount: 0,
      };

      const storiesColRef = collection(firestore, `stories`);
      await addDoc(storiesColRef, storyData).catch((serverError) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: storiesColRef.path,
            operation: 'create',
            requestResourceData: storyData,
          })
        );
        throw serverError;
      });

      toast({
        title: 'Story Published!',
        description: 'Your story is now live for the community to see.',
      });
      closeDialog();
    } catch (error) {
      console.error('Failed to create story:', error);
      if (!(error instanceof FirestorePermissionError)) {
        toast({
          variant: 'destructive',
          title: 'Publishing Failed',
          description: 'Could not publish the story. Please try again.',
        });
      }
      setStep('write'); // Go back to write on failure
    }
  }

  const resetForm = () => {
    form.reset();
    setStep('write');
  };

  const closeDialog = () => {
    setIsOpen(false);
    // Delay reset to prevent UI flicker while closing
    setTimeout(resetForm, 300);
  };

  const isSubmitting = step === 'publishing';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDialog();
        else setIsOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={!session.isLoggedIn}>
          <PenSquare className="mr-2" />
          {session.isLoggedIn ? 'Write a Story' : 'Log in to Write'}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Share Your Story
          </DialogTitle>
          <DialogDescription>
            {'What have you been creating? Share your process, inspiration, or latest work.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onPublish)}
            className="grid gap-4 max-h-[70vh] overflow-y-auto px-1"
          >
            <div
              style={{ display: step === 'write' ? 'grid' : 'none' }}
              className="gap-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'The Art of Imperfection'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Story</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your work, your inspiration, or a recent breakthrough..."
                        {...field}
                        rows={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="sticky bottom-0 bg-background pt-4 -mx-1 -mb-1 pb-1">
              {step === 'write' && (
                <>
                  <Button type="button" variant="ghost" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Sparkles className="mr-2" /> Publish Story
                  </Button>
                </>
              )}
              {step === 'publishing' && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Publishing your story...
                </p>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
