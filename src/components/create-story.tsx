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
import {
  PenSquare,
  Sparkles,
  Upload,
  ImagePlus,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useFirestore, useUser } from "@/firebase";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import {
  generateStoryImage,
  StoryImageOutput,
} from "@/ai/artcommunity_flow/generate-story-image-flow";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { compressImage } from "@/lib/utils";
import { useSession } from "@/context/session-context";
import { artisanProfiles } from "@/lib/profile-data";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(20, "Story must be at least 20 characters."),
});

type Step = "write" | "preview" | "generating" | "publishing";

export function CreateStory() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("write");
  const [generatedImage, setGeneratedImage] = useState<StoryImageOutput | null>(
    null
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { session } = useSession();
  const firestore = useFirestore();

  const username = session.username as keyof typeof artisanProfiles;

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
          setGeneratedImage(null); // Clear AI image if user uploads one
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async (values: z.infer<typeof formSchema>) => {
    // If user has an uploaded image, we skip AI generation
    if (uploadedImage) {
      setGeneratedImage(null); // Keep uploaded image, clear AI if it existed
      setStep("preview");
      // No onPublish() here. Publish is now only from the 'preview' button.
      return;
    } // If no uploaded image, proceed with AI generation

    setStep("generating");
    try {
      const result = await generateStoryImage({ storyContent: values.content });
      setGeneratedImage(result);
      setStep("preview");
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Image Generation Failed",
        description:
          "Could not generate an image at this time. Please try again.",
      });
      setStep("write");
    }
  };

  async function uploadImageAndGetUrl(
    base64DataUrl: string,
    authorId: string,
    title: string
  ): Promise<string> {
    const storage = getStorage();
    // Create a path for the image in Firebase Storage
    // Example: stories/user_123/The Art of Imperfection_timestamp.jpeg
    const storageRef = ref(
      storage,
      `stories/${authorId}/${title}_${Date.now()}.jpeg`
    );

    // uploadString expects a Base64 data URL string
    await uploadString(storageRef, base64DataUrl, "data_url");

    // Get the permanent public download URL
    const downloadUrl = await getDownloadURL(storageRef);

    return downloadUrl;
  }

  async function onPublish() {
    if (!session.isLoggedIn || !firestore) return;

    const values = form.getValues();
    let imageSourceUrl = "";
    let imageHint = "";

    setStep("publishing");

    console.log(uploadedImage)

    try {
      if (uploadedImage) {
        imageSourceUrl = uploadedImage;
        imageHint = "User uploaded image";
      } else if (generatedImage) {
        imageSourceUrl = await compressImage(generatedImage.imageUrl);
        imageHint = generatedImage.imageHint;
      } else {
        toast({
          variant: "destructive",
          title: "No Image Found",
          description:
            "An image is required to publish. Please upload one or generate one.",
        });
        setStep("write");
        return;
      }

      const finalImageUrl = await uploadImageAndGetUrl(
        imageSourceUrl!,
        session.username!, 
        values.title
      );

      const authorData = {
        id: session.username,
        name: session.username
          ? "Anonymous Artisan"
          : session.username || "Artisan",
        avatarUrl: `https://i.pravatar.cc/150?u=${session.username}`,
      };

      const storyData = {
        ...values,
        authorId: session.username,
        author: authorData,
        imageUrl: finalImageUrl,
        imageHint,
        createdAt: serverTimestamp(),
        commentCount: 0,
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
      setStep("preview"); // Go back to preview on failure
    }
  }

  const resetForm = () => {
    form.reset();
    setUploadedImage(null);
    setGeneratedImage(null);
    setStep("write");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeDialog = () => {
    setIsOpen(false);
    // Delay reset to prevent UI flicker while closing
    setTimeout(resetForm, 300);
  };

  const isSubmitting = step === "generating" || step === "publishing";

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
          {session.isLoggedIn ? "Write a Story" : "Log in to Write"}
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
            {step === "write" &&
              "What have you been creating? Share your process, inspiration, or latest work."}
            {step !== "write" &&
              "Review the AI-generated image. You can publish it, generate a new one, or go back to upload your own."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleGenerateImage)}
            className="grid gap-4 max-h-[70vh] overflow-y-auto px-1"
          >
            {/* Step 1: Write Content */}
            <div
              style={{ display: step === "write" ? "grid" : "none" }}
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
              <div className="space-y-2">
                <FormLabel>Cover Image</FormLabel>
                <div className="w-full aspect-video rounded-md border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden">
                  {uploadedImage ? (
                    <Image
                      src={uploadedImage}
                      alt="Image preview"
                      width={400}
                      height={225}
                      className="object-contain h-full w-full"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <ImagePlus className="mx-auto h-12 w-12" />
                      <p>
                        Upload an image or one will be generated in the next
                        step.
                      </p>
                    </div>
                  )}
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2" />
                  {uploadedImage ? "Change Image" : "Upload Image"}
                </Button>
              </div>
            </div>

            {/* Step 2: Preview Image */}
            <div
              style={{
                display: ["preview", "generating"].includes(step)
                  ? "grid"
                  : "none",
              }}
              className="gap-4"
            >
              <div className="w-full aspect-video rounded-md border flex items-center justify-center bg-muted/50 overflow-hidden">
                {step === "generating" && (
                  <Skeleton className="h-full w-full" />
                )}
                {step === "preview" && (uploadedImage || generatedImage) && (
                  <Image
                    src={uploadedImage || generatedImage!.imageUrl}
                    alt="Story cover image"
                    width={800}
                    height={450}
                    className="object-contain h-full w-full"
                    data-ai-hint={
                      generatedImage?.imageHint || "User uploaded image"
                    }
                  />
                )}
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background pt-4 -mx-1 -mb-1 pb-1">
              {step === "write" && (
                <>
                  <Button type="button" variant="ghost" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                                            Next: Review Image                  
                          <ArrowRight className="ml-2" />               
                  </Button>
                </>
              )}

              {step === "preview" && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("write")}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleGenerateImage(form.getValues())}
                    disabled={isSubmitting}
                  >
                    <RefreshCw className="mr-2" /> Regenerate Image
                  </Button>
                  <Button
                    type="button"
                    onClick={onPublish}
                    disabled={isSubmitting}
                  >
                    <Sparkles className="mr-2" /> Publish Story
                  </Button>
                </>
              )}

              {step === "generating" && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Our AI is creating a unique image for your story...
                </p>
              )}
              {step === "publishing" && (
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
