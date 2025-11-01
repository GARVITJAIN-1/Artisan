
"use client";

import { useRef, useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader, ScanLine, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { extractCardDetailsAction, updateAadhaarAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Input } from "./ui/input";

type AadhaarOcrCardProps = {
    artisanId: string;
};

type OcrStatus = {
    loading: boolean;
    error: string | null;
    message: string | null;
    extractedNumber: string | null;
}

export default function AadhaarOcrCard({ artisanId }: AadhaarOcrCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOcrPending, startOcrTransition] = useTransition();
    const [ocrStatus, setOcrStatus] = useState<OcrStatus>({ loading: false, error: null, message: null, extractedNumber: null });
    const { toast } = useToast();

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const imageDataUri = reader.result as string;
            startOcrTransition(async () => {
                setOcrStatus({ loading: true, error: null, message: 'Analyzing document...', extractedNumber: null });
                const extractResult = await extractCardDetailsAction(imageDataUri);

                if (extractResult.success && extractResult.data) {
                    const { aadhaarNumber, imageQuality } = extractResult.data;
                    if (imageQuality.isBlurry) {
                        setOcrStatus({ loading: false, error: "Image is too blurry. Please upload a clearer picture.", message: null, extractedNumber: null });
                    } else if (imageQuality.isDark) {
                        setOcrStatus({ loading: false, error: "Image is too dark. Please upload a picture with better lighting.", message: null, extractedNumber: null });
                    } else if (aadhaarNumber) {
                        setOcrStatus({ loading: false, error: null, message: "Aadhaar number extracted successfully!", extractedNumber: aadhaarNumber });
                        
                        const updateResult = await updateAadhaarAction(artisanId, aadhaarNumber);
                        if (updateResult.success) {
                            toast({ title: "Profile Updated", description: "Aadhaar number has been saved to your profile." });
                        } else {
                            toast({ variant: "destructive", title: "Update Failed", description: updateResult.error });
                        }

                    } else {
                        setOcrStatus({ loading: false, error: "Could not extract Aadhaar number. Please try again or enter it manually in the application form.", message: null, extractedNumber: null });
                    }
                } else {
                    setOcrStatus({ loading: false, error: extractResult.error || "Failed to process image.", message: null, extractedNumber: null });
                }
            });
        };
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                    <ScanLine className="h-6 w-6 text-primary" />
                    Update Aadhaar via OCR
                </CardTitle>
                <CardDescription>
                    Upload a picture of your Aadhaar card to automatically update your profile.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isOcrPending}
                >
                    {isOcrPending ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Aadhaar Photo
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                />

                {isOcrPending && ocrStatus.message && (
                    <Alert>
                        <Loader className="h-4 w-4 animate-spin" />
                        <AlertTitle>Processing...</AlertTitle>
                        <AlertDescription>{ocrStatus.message}</AlertDescription>
                    </Alert>
                )}

                {ocrStatus.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>OCR Error</AlertTitle>
                        <AlertDescription>{ocrStatus.error}</AlertDescription>
                    </Alert>
                )}
                
                {ocrStatus.extractedNumber && (
                    <Alert className="border-green-500 text-green-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-600 font-bold">Success!</AlertTitle>
                        <AlertDescription>
                           Your Aadhaar number has been updated: <strong>{ocrStatus.extractedNumber}</strong>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
