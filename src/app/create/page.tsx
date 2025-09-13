
"use client";

import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LanguageContext } from "@/context/language-context1";
import { translations } from "@/lib/translations";
import { PlusCircle, Wand2, Upload } from "lucide-react";
import Image from "next/image";
import { generateTags } from "@/ai/community_flow/generate-tags";
import { useArtworks } from "@/context/artwork-context";
import type { Artwork } from "@/lib/data";

const artworkFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  type: z.enum(["image", "video", "text"]),
  tags: z.string().min(1, { message: "Please add at least one tag." }),
  mediaDataUri: z.string().optional(),
  content: z.string().optional(),
}).refine(data => {
    if (data.type === 'image' || data.type === 'video') return !!data.mediaDataUri;
    if (data.type === 'text') return !!data.content && data.content.length >= 10;
    return false;
}, {
    message: "Please provide the required content for the selected type.",
    path: ["mediaDataUri"],
});

type ArtworkFormValues = z.infer<typeof artworkFormSchema>;

export const GenerateTagsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the artwork, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  title: z.string().describe('The title of the artwork.'),
});
export type GenerateTagsInput = z.infer<typeof GenerateTagsInputSchema>;


export default function CreatePage() {
  const { language } = useContext(LanguageContext);
  const { addArtwork } = useArtworks();
  const t = { 
      en: {
          pageTitle: "Create a New Post",
          pageDescription: "Share your artwork with the community. Fill out the form below to get started.",
          titleLabel: "Title",
          titlePlaceholder: "Enter the title of your artwork",
          typeLabel: "Artwork Type",
          typeSelectPlaceholder: "Select a type",
          typeImage: "Image",
          typeVideo: "Video",
          typeText: "Text",
          tagsLabel: "Tags",
          tagsPlaceholder: "e.g., abstract, painting, nature",
          tagsDescription: "Separate tags with commas.",
          suggestTagsButton: "Suggest Tags",
          suggestingTags: "Analyzing your art...",
          mediaUploadLabel: "Upload Media",
          mediaUploadDescription: "Upload an image or video file.",
          mediaDropzone: "Drag & drop your file here, or click to browse",
          contentLabel: "Your Story/Poem",
          contentPlaceholder: "Write your heart out...",
          submitButton: "Submit Artwork",
          submitSuccessTitle: "Post Created!",
          submitSuccessDescription: "Your artwork has been successfully shared.",
          submitErrorTitle: "Submission Failed",
          submitErrorDescription: "Please check the form and try again.",
      },
      hi: {
          pageTitle: "एक नई पोस्ट बनाएं",
          pageDescription: "अपनी कलाकृति समुदाय के साथ साझा करें। आरंभ करने के लिए नीचे दिया गया फॉर्म भरें।",
          titleLabel: "शीर्षक",
          titlePlaceholder: "अपनी कलाकृति का शीर्षक दर्ज करें",
          typeLabel: "कलाकृति का प्रकार",
          typeSelectPlaceholder: "एक प्रकार चुनें",
          typeImage: "छवि",
          typeVideo: "वीडियो",
          typeText: "पाठ",
          tagsLabel: "टैग",
          tagsPlaceholder: "जैसे, सार, पेंटिंग, प्रकृति",
          tagsDescription: "टैग को अल्पविराम से अलग करें।",
          suggestTagsButton: "टैग सुझाएं",
          suggestingTags: "आपकी कला का विश्लेषण किया जा रहा है...",
          mediaUploadLabel: "मीडिया अपलोड करें",
          mediaUploadDescription: "एक छवि या वीडियो फ़ाइल अपलोड करें।",
          mediaDropzone: "अपनी फ़ाइल को यहां खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें",
          contentLabel: "आपकी कहानी/कविता",
          contentPlaceholder: "अपने दिल की बात लिखें...",
          submitButton: "कलाकृति जमा करें",
          submitSuccessTitle: "पोस्ट बन गई!",
          submitSuccessDescription: "आपकी कलाकृति सफलतापूर्वक साझा कर दी गई है।",
          submitErrorTitle: "सबमिशन विफल",
          submitErrorDescription: "कृपया फ़ॉर्म की जाँच करें और पुनः प्रयास करें।",
      }
  }[language];
  
  const { toast } = useToast();
  const router = useRouter();
  const [artworkType, setArtworkType] = useState<string>("image");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);

  const form = useForm<ArtworkFormValues>({
    resolver: zodResolver(artworkFormSchema),
    defaultValues: {
      title: "",
      type: "image",
      tags: "",
      mediaDataUri: "",
      content: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setMediaPreview(dataUri);
        form.setValue("mediaDataUri", dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestTags = async () => {
    const title = form.getValues("title");
    const mediaDataUri = form.getValues("mediaDataUri");

    if (!mediaDataUri || !title) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a title and upload an image to suggest tags.",
        });
        return;
    }

    setIsSuggestingTags(true);
    toast({
        title: t.suggestingTags,
    });

    try {
        const { tags } = await generateTags({ photoDataUri: mediaDataUri, title });
        if (tags && tags.length > 0) {
            form.setValue("tags", tags.join(", "));
            toast({
                title: "Tags Suggested!",
                description: "AI-powered tags have been added.",
            });
        } else {
            throw new Error("No tags were generated.");
        }
    } catch (error) {
        console.error("Tag generation error:", error);
        toast({
            variant: "destructive",
            title: "Tag Generation Failed",
            description: "Could not suggest tags for this image. Please try again.",
        });
    } finally {
        setIsSuggestingTags(false);
    }
  };

  const onSubmit = (data: ArtworkFormValues) => {
    const newArtwork: Artwork = {
        id: Date.now(),
        title: data.title,
        type: data.type as 'image' | 'video' | 'text',
        artist: "You", // Or get from user profile
        tags: data.tags.split(',').map(tag => tag.trim()),
        likes: 0,
        commentsCount: 0,
        isUserSubmission: true,
        content: data.content,
    };

    if (data.type === 'image' && data.mediaDataUri) {
        newArtwork.imageUrl = data.mediaDataUri;
    } else if (data.type === 'video' && data.mediaDataUri) {
        newArtwork.videoUrl = data.mediaDataUri;
    }

    addArtwork(newArtwork);
    
    toast({
      title: t.submitSuccessTitle,
      description: t.submitSuccessDescription,
    });
    router.push('/');
  };

  return (
    <div className="container py-12 max-w-2xl">
      <div className="flex flex-col items-center mb-8 text-center">
          <PlusCircle className="h-16 w-16 mb-4 text-primary" />
          <h1 className="text-4xl font-headline font-bold">{t.pageTitle}</h1>
          <p className="text-muted-foreground mt-2">
           {t.pageDescription}
          </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.titleLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={t.titlePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.typeLabel}</FormLabel>
                <Select onValueChange={(value) => {
                    field.onChange(value);
                    setArtworkType(value);
                    setMediaPreview(null);
                    form.resetField("mediaDataUri");
                    form.resetField("content");
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t.typeSelectPlaceholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="image">{t.typeImage}</SelectItem>
                    <SelectItem value="video">{t.typeVideo}</SelectItem>
                    <SelectItem value="text">{t.typeText}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {(artworkType === 'image' || artworkType === 'video') && (
            <FormField
              control={form.control}
              name="mediaDataUri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.mediaUploadLabel}</FormLabel>
                  <FormControl>
                    <div className="relative w-full border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center hover:border-primary transition-colors">
                      <Input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept={artworkType === 'image' ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                      />
                      {mediaPreview ? (
                          artworkType === 'image' ? (
                            <Image src={mediaPreview} alt="Image preview" width={400} height={300} className="w-auto h-auto max-h-64 mx-auto rounded-md" />
                           ) : (
                            <video src={mediaPreview} controls className="max-h-64 mx-auto rounded-md" />
                           )
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                            <Upload className="h-10 w-10" />
                            <p>{t.mediaDropzone}</p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{t.contentLabel}</FormLabel>
                <FormControl>
                    <Textarea
                    placeholder={t.contentPlaceholder}
                    className="resize-y min-h-[150px]"
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.tagsLabel}</FormLabel>
                <div className="flex items-center gap-2">
                    <FormControl>
                        <Input placeholder={t.tagsPlaceholder} {...field} className="flex-grow" />
                    </FormControl>
                    {artworkType === 'image' && (
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleSuggestTags}
                            disabled={isSuggestingTags || !form.getValues("mediaDataUri") || !form.getValues("title")}
                        >
                            <Wand2 className="mr-2 h-4 w-4" />
                            {t.suggestTagsButton}
                        </Button>
                    )}
                </div>
                 <FormDescription>
                 {t.tagsDescription}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />


          <Button type="submit" className="w-full" size="lg">{t.submitButton}</Button>
        </form>
      </Form>
    </div>
  );
}
