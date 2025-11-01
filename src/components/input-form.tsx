"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import { UploadCloud, Languages, Sparkles, LoaderCircle } from "lucide-react";
import Image from "next/image";

export const inputSchema = z.object({
  image: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Product photo is required.")
    .transform((files) => files[0]),
  language: z.string().min(1, "Please select a language."),
  prompt: z.string().optional(),
});

type InputFormProps = {
  onSubmit: (data: z.infer<typeof inputSchema>) => void;
  isLoading: boolean;
  loadingMessage: string;
};

const languages = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi (हिन्दी)" },
  { value: "Bengali", label: "Bengali (বাংলা)" },
  { value: "Tamil", label: "Tamil (தமிழ்)" },
  { value: "Marathi", label: "Marathi (मराठी)" },
  { value: "Telugu", label: "Telugu (తెలుగు)" },
];

export default function InputForm({
  onSubmit,
  isLoading,
  loadingMessage,
}: InputFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof inputSchema>>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      language: "English",
      prompt: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-2 border-dashed border-primary/20 shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-accent">
          Describe Your Product
        </CardTitle>
        <CardDescription className="font-body">
          Provide a photo and some details to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-headline text-lg">
                    Product Photo
                  </FormLabel>
                  <FormControl>
                    <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          field.onChange(e.target.files);
                          handleImageChange(e);
                        }}
                      />
                      <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Product preview"
                            width={150}
                            height={150}
                            className="rounded-md object-cover h-36 w-36"
                          />
                        ) : (
                          <>
                            <UploadCloud className="w-12 h-12 text-primary" />
                            <p className="font-body">
                              <span className="text-primary font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs">PNG, JPG, or WEBP</p>
                          </>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-lg flex items-center gap-2">
                      <Languages className="w-5 h-5" /> Post Language
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="font-body">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem
                            key={lang.value}
                            value={lang.value}
                            className="font-body"
                          >
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-headline text-lg">
                    What's special about this item? (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Made from recycled materials, a family tradition, perfect for weddings..."
                      className="resize-none font-body"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full text-lg py-6 font-headline"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  {loadingMessage}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create My Post
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
