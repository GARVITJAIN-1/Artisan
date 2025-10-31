"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { PenSquare, Sparkles, Image as ImageIcon, Upload } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useFirestore, useUser } from "@/firebase";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useSession } from "@/context/session-context";
import { generateStoryImage } from "@/ai/artcommunity_flow/generate-story-image-flow";
import Image from "next/image";

const MAX_IMAGE_SIZE_MB = 1;

async function compressImage(
  dataUrl: string,
  fileType?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = dataUrl;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Failed to get canvas context"));
      }

      let { width, height } = image;
      const MAX_WIDTH = 1024;
      const MAX_HEIGHT = 1024;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);

      // Start with high quality
      let quality = 0.9;
      let compressedDataUrl = canvas.toDataURL(
        fileType || "image/jpeg",
        quality
      );

      // Reduce quality if size is too large
      while (
        compressedDataUrl.length > MAX_IMAGE_SIZE_MB * 1024 * 1024 &&
        quality > 0.1
      ) {
        quality -= 0.1;
        compressedDataUrl = canvas.toDataURL(fileType || "image/jpeg", quality);
      }

      resolve(compressedDataUrl);
    };
    image.onerror = (error) => {
      reject(error);
    };
  });
}

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(20, "Story must be at least 20 characters."),
});

type Step = "write" | "publishing";

export function CreateStory() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("write");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{
    url: string;
    hint: string;
  } | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { session } = useSession();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "" },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const originalDataUrl = e.target.result as string;
          const compressedDataUrl = await compressImage(
            originalDataUrl,
            file.type
          );
          setUploadedImage(compressedDataUrl);
          setGeneratedImage(null); // Clear generated image if user uploads one
        }
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleGenerateImage() {
    const content = form.getValues("content");
    if (content.length < 20) {
      toast({
        variant: "destructive",
        title: "Story is too short",
        description:
          "Please write at least 20 characters to generate an image.",
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { imageUrl, imageHint } = await generateStoryImage({
        storyContent: content,
      });
      const compressedImageUrl = await compressImage(imageUrl);
      setGeneratedImage({ url: compressedImageUrl, hint: imageHint });
      setUploadedImage(null); // Clear uploaded image if user generates one
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast({
        variant: "destructive",
        title: "Image Generation Failed",
        description:
          "Could not generate an image for the story. Please try again.",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function onPublish() {
    if (!user || !firestore) return;

    const values = form.getValues();
    setStep("publishing");

    try {
      const authorData = {
        id: user.uid,
        name: user.displayName || user.email || "Anonymous Artisan",
        avatarUrl: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
      };

      let imageUrl: string | null = null;
      let imageHint: string | null = null;

      if (uploadedImage) {
        imageUrl = uploadedImage;
        imageHint = "User uploaded image";
      } else if (generatedImage) {
        imageUrl = generatedImage.url;
        imageHint = generatedImage.hint;
      }

      const storyData = {
        ...values,
        authorId: user.uid,
        author: authorData,
        createdAt: serverTimestamp(),
        commentCount: 0,
        ...(imageUrl && { imageUrl }),
        ...(imageHint && { imageHint }),
      };

      const storiesColRef = collection(firestore, `stories`);
      await addDoc(storiesColRef, storyData).catch((serverError) => {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: storiesColRef.path,
            operation: "create",
            requestResourceData: storyData,
          })
        );
        throw serverError;
      });

      toast({
        title: "Story Published!",
        description: "Your story is now live for the community to see.",
      });
      closeDialog();
    } catch (error) {
      console.error("Failed to create story:", error);
      if (!(error instanceof FirestorePermissionError)) {
        toast({
          variant: "destructive",
          title: "Publishing Failed",
          description: "Could not publish the story. Please try again.",
        });
      }
      setStep("write"); // Go back to write on failure
    }
  }

  const resetForm = () => {
    form.reset();
    setStep("write");
    setGeneratedImage(null);
    setUploadedImage(null);
  };

  const closeDialog = () => {
    setIsOpen(false);
    // Delay reset to prevent UI flicker while closing
    setTimeout(resetForm, 300);
  };

  const isSubmitting = step === "publishing";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDialog();
        else setIsOpen(true);
      }}
    >
      <DialogTrigger asChild>
        {/* ## Updated Trigger Button ## */}
        <Button
          disabled={!session.isLoggedIn}
          className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
        >
          <PenSquare className="mr-2" />
          {session.isLoggedIn ? "Write a Story" : "Log in to Write"}
        </Button>
      </DialogTrigger>
      {/* ## Updated Dialog Content ## */}
      <DialogContent
        className="sm:max-w-2xl bg-white/90 backdrop-blur-lg border-stone-200/80"
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          {/* ## Updated Header Text ## */}
          <DialogTitle className="font-headline text-2xl text-amber-700">
            Share Your Story
          </DialogTitle>
          <DialogDescription className="text-stone-600">
            {
              "What have you been creating? Share your process, inspiration, or latest work."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onPublish)}
            className="grid gap-4 max-h-[70vh] overflow-y-auto px-1"
          >
            <div
              style={{ display: step === "write" ? "grid" : "none" }}
              className="gap-4"
            >
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone-700">Title</FormLabel>
                    <FormControl>
                      {/* ## Updated Input ## */}
                      <Input
                        placeholder="e.g., 'The Art of Imperfection'"
                        {...field}
                        className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content Field */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone-700">Your Story</FormLabel>
                    <FormControl>
                      {/* ## Updated Textarea ## */}
                      <Textarea
                        placeholder="Tell us about your work, your inspiration, or a recent breakthrough..."
                        {...field}
                        rows={10}
                        className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              {(uploadedImage || generatedImage) && (
                // ## Updated Image Preview Border ##
                <div className="rounded-md border border-stone-300/80">
                  <Image
                    src={uploadedImage || generatedImage!.url}
                    alt={generatedImage?.hint || "User uploaded image"}
                    width={512}
                    height={512}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>

            {/* ## Updated Footer Buttons ## */}
            <DialogFooter className="sticky bottom-0 bg-white/90 backdrop-blur-lg pt-4 -mx-1 -mb-1 pb-1">
              {step === "write" && (
                <>
                  {/* ## Updated Outline Button ## */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || isSubmitting}
                    className="border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                  >
                    <ImageIcon className="mr-2" />
                    {isGeneratingImage ? "Generating..." : "Generate Image"}
                  </Button>
                  {/* ## Updated Ghost Button ## */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={closeDialog}
                    className="hover:bg-amber-100 text-stone-600 hover:text-amber-700"
                  >
                    Cancel
                  </Button>
                  {/* ## Updated CTA Button ## */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || isGeneratingImage}
                    className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
                  >
                    <Sparkles className="mr-2" /> Publish Story
                  </Button>
                </>
              )}
              {step === "publishing" && (
                <p className="text-sm text-stone-500 animate-pulse">
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
