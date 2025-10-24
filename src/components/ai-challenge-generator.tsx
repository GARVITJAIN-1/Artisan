
'use client';

import { useState, useRef } from 'react';
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
import { Sparkles, WandSparkles, Upload, CalendarIcon } from 'lucide-react';
import { generateChallenge, ChallengeInput } from '@/ai/artcommunity_flow/ai-creative-challenge-generator';
import { Textarea } from './ui/textarea';
import { useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { generateChallengeImage } from '@/ai/artcommunity_flow/generate-challenge-image-flow';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn, compressImage } from '@/lib/utils';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  topic: z.string().min(2, 'Theme must be at least 2 characters.'),
  style: z.string().optional(),
  materials: z.string().optional(),
});

type GeneratedChallenge = {
  title: string;
  description: string;
};

export function AIChallengeGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState<GeneratedChallenge | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<Date | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: '', style: '', materials: '' },
  });

  async function onGenerate(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      const result = await generateChallenge(values);
      setGeneratedChallenge(result);
      toast({
        title: 'Challenge Generated!',
        description: 'A new creative challenge has been inspired by your input.',
      });
    } catch (error) {
      console.error('Failed to generate challenge:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate a challenge at this time. Please try again later.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if(e.target?.result) {
            const originalDataUrl = e.target.result as string;
            const compressedDataUrl = await compressImage(originalDataUrl, file.type);
            setUploadedImage(compressedDataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  async function onPostChallenge() {
    if (!user || !firestore || !generatedChallenge) return;
    setIsPosting(true);
    try {
      let imageUrl = '';
      let imageHint = '';

      if (uploadedImage) {
        imageUrl = uploadedImage;
        imageHint = 'custom upload'; // Or you could use AI to generate a hint
      } else {
        toast({
          title: 'Generating Magical Image...',
          description: 'Our AI is creating a unique image for your challenge.',
        });
        const result = await generateChallengeImage({
          title: generatedChallenge.title,
          description: generatedChallenge.description,
        });
        imageUrl = await compressImage(result.imageUrl);
        imageHint = result.imageHint;
      }

      const challengeData: any = {
        title: generatedChallenge.title,
        description: generatedChallenge.description,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        imageUrl,
        imageHint,
        status: 'Active',
      };
      
      if (endDate) {
        challengeData.endDate = endDate;
      }


      const challengesColRef = collection(firestore, 'creativeChallenges');
      const docRef = await addDoc(challengesColRef, challengeData)
        .catch(
        (serverError) => {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: challengesColRef.path,
              operation: 'create',
              requestResourceData: challengeData,
            })
          );
          throw serverError;
        }
      );

      closeDialog();
      toast({
        title: 'Challenge Posted!',
        description: 'Your new challenge is live for the community.',
      });
      router.push(`/challenges/${docRef.id}`);
    } catch (error) {
      console.error('Failed to post challenge:', error);
      if (!(error instanceof FirestorePermissionError)) {
          toast({
            variant: 'destructive',
            title: 'Post Failed',
            description: 'Could not post the challenge. Please check your connection or permissions.',
          });
      }
    } finally {
      setIsPosting(false);
    }
  }

  const resetGenerator = () => {
    form.reset();
    setGeneratedChallenge(null);
    setUploadedImage(null);
    setEndDate(undefined);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(resetGenerator, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            closeDialog();
        } else {
            setIsOpen(true);
        }
    }}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={!user}>
          <Sparkles className="mr-2 h-5 w-5" />
          {user ? 'Create Challenge' : 'Log in to Create'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={closeDialog}>
        <DialogHeader>
          <DialogTitle className='font-headline text-2xl'>AI Challenge Generator</DialogTitle>
          <DialogDescription>
            Feeling uninspired? Provide a theme, style, or materials, and let our AI craft a unique creative challenge for you.
          </DialogDescription>
        </DialogHeader>

        {generatedChallenge ? (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-6">
                <h3 className="font-headline text-xl font-bold">{generatedChallenge.title}</h3>
                <p className="whitespace-pre-wrap">{generatedChallenge.description}</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Challenge End Date (Optional)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !endDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                  </div>
                  {uploadedImage ? (
                    <div className='relative aspect-video w-full overflow-hidden rounded-md'>
                        <Image src={uploadedImage} alt="Uploaded preview" fill className='object-cover' />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center p-4 text-sm text-muted-foreground border-2 border-dashed rounded-md'>
                        No image uploaded. An image will be generated by AI.
                    </div>
                  )}

                  <Input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload} 
                    ref={fileInputRef}
                    className="hidden"
                   />
                  <Button variant="outline" className='w-full' onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" />
                    {uploadedImage ? 'Change Image' : 'Upload Image'}
                  </Button>
                </div>

                 <div className="flex flex-col gap-2">
                    <Button onClick={onPostChallenge} disabled={isPosting}>
                      {isPosting ? 'Posting...' : <><WandSparkles className="mr-2" /> Post Challenge</>}
                    </Button>
                    <Button onClick={resetGenerator} variant="outline" disabled={isPosting}>
                        Generate Another
                    </Button>
                 </div>
            </div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Topic or Theme</FormLabel>
                      <FormControl>
                          <Input placeholder="e.g., 'Nostalgia', 'Urban Jungle'" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Artistic Style (Optional)</FormLabel>
                      <FormControl>
                          <Input placeholder="e.g., 'Impressionism', 'Cyberpunk'" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="materials"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Available Materials (Optional)</FormLabel>
                      <FormControl>
                          <Textarea placeholder="e.g., 'Watercolors, canvas', 'Recycled materials'" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />
                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating ? 'Generating...' : 'Generate Challenge'}
                </Button>
            </form>
            </Form>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
