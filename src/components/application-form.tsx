
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { PmVishwakarmaFormValues } from '@/lib/schema';
import { pmVishwakarmaFormSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from './ui/separator';
import { Loader, Sparkles, Upload } from 'lucide-react';
import { useState, useTransition, useRef } from 'react';
import { autofillPmKisanFormAction, extractCardDetailsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useLanguage } from '@/context/language-context';

type ApplicationFormProps = {
  userData: any;
  onFormSubmit: (data: PmVishwakarmaFormValues) => void;
  onClose: () => void;
};

type OcrStatus = {
    loading: boolean;
    error: string | null;
    message: string | null;
}

export default function ApplicationForm({ userData, onFormSubmit, onClose }: ApplicationFormProps) {
  const [isAutofillPending, startAutofillTransition] = useTransition();
  const [isOcrPending, startOcrTransition] = useTransition();
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const aadharFileInputRef = useRef<HTMLInputElement>(null);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>({ loading: false, error: null, message: null});


  const form = useForm<PmVishwakarmaFormValues>({
    resolver: zodResolver(pmVishwakarmaFormSchema),
    defaultValues: {
      state: '',
      district: '',
      subDistrict: '',
      block: '',
      village: '',
      artisanName: '',
      gender: undefined,
      category: undefined,
      artisanType: undefined,
      aadhaarNumber: '',
      bankName: '',
      ifscCode: '',
      accountNumber: '',
      otp: '',
    },
  });

  const handleAutofill = () => {
    startAutofillTransition(async () => {
      const result = await autofillPmKisanFormAction();
      if (result.success && result.data) {
        Object.keys(result.data).forEach((key: any) => {
          form.setValue(key, result.data[key], { shouldValidate: true });
        });
        setIsAutofilled(true);
        toast({
          title: t('formAutofilled'),
          description: t('formAutofilledDesc'),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('autofillFailed'),
          description: result.error,
        });
      }
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const imageDataUri = reader.result as string;
        startOcrTransition(async () => {
            setOcrStatus({ loading: true, error: null, message: 'Analyzing document...' });
            const result = await extractCardDetailsAction(imageDataUri);
            if (result.success && result.data) {
                const { aadhaarNumber, imageQuality } = result.data;
                if (imageQuality.isBlurry) {
                    setOcrStatus({ loading: false, error: "Image is too blurry. Please upload a clearer picture.", message: null });
                } else if (imageQuality.isDark) {
                     setOcrStatus({ loading: false, error: "Image is too dark. Please upload a picture with better lighting.", message: null });
                } else if (aadhaarNumber) {
                    form.setValue('aadhaarNumber', aadhaarNumber, { shouldValidate: true });
                    setOcrStatus({ loading: false, error: null, message: "Aadhaar number extracted successfully!" });
                    toast({ title: "OCR Success", description: "Aadhaar number has been auto-filled." });
                } else {
                    setOcrStatus({ loading: false, error: "Could not extract Aadhaar number. Please enter it manually.", message: null });
                }

            } else {
                 setOcrStatus({ loading: false, error: result.error || "Failed to process image.", message: null });
            }
        });
    };
  }

  const onSubmit = (data: PmVishwakarmaFormValues) => {
    if(!isOtpStep) {
        setIsOtpStep(true);
        return;
    }
    if(data.otp !== '123456'){
        form.setError('otp', {type: 'manual', message: t('invalidOtp')});
        return;
    }
    onFormSubmit(data);
  };
  
  const formFields = [
      { name: 'state', label: t('state') }, { name: 'district', label: t('district') },
      { name: 'subDistrict', label: t('subDistrict') }, { name: 'block', label: t('block') },
      { name: 'village', label: t('village') }, { name: 'artisanName', label: t('artisanName') }
  ];

  const selectFields = [
      { name: 'gender', label: t('gender'), options: [{value: 'Male', label: t('male')}, {value: 'Female', label: t('female')}, {value: 'Other', label: t('other')}]},
      { name: 'category', label: t('category'), options: [{value: 'General', label: t('general')}, {value: 'SC', label: t('sc')}, {value: 'ST', label: t('st')}, {value: 'OBC', label: t('obc')}]},
      { name: 'artisanType', label: t('artisanType'), options: [{value: 'Carpenter', label: t('carpenter')}, {value: 'Blacksmith', label: t('blacksmith')}, {value: 'Potter', label: t('potter')}, {value: 'Other', label: t('otherArtisan')}]}
  ];
  
  const bankFields = [
      { name: 'bankName', label: t('bankName')},
      { name: 'ifscCode', label: t('ifscCode')},
      { name: 'accountNumber', label: t('accountNumber')}
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {!isAutofilled && (
             <Alert className="border-primary bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-bold">{t('saveTimeAi')}</AlertTitle>
                <AlertDescription>
                    {t('saveTimeAiDesc')}
                    <Button type="button" onClick={handleAutofill} disabled={isAutofillPending} className="mt-4 w-full">
                        {isAutofillPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {t('autofillWithAi')}
                    </Button>
                </AlertDescription>
            </Alert>
        )}
       
        {isAutofilled && !isOtpStep && (
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{t('personalLocationDetails')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formFields.map(f => (
                        <FormField key={f.name} control={form.control} name={f.name as keyof PmVishwakarmaFormValues} render={({ field }) => (
                            <FormItem>
                                <FormLabel>{f.label}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    ))}
                     {selectFields.map(f => (
                        <FormField key={f.name} control={form.control} name={f.name as keyof PmVishwakarmaFormValues} render={({ field }) => (
                            <FormItem>
                                <FormLabel>{f.label}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} >
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {f.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                     ))}
                    </div>
                    <Separator className="my-6" />
                    <h3 className="text-lg font-semibold mb-2">{t('bankAadhaarDetails')}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="aadhaarNumber" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('aadhaarNumber')}</FormLabel>
                                <div className="flex gap-2">
                                    <FormControl><Input {...field} /></FormControl>
                                    <Button type="button" variant="outline" onClick={() => aadharFileInputRef.current?.click()} disabled={isOcrPending}>
                                        {isOcrPending ? <Loader className="animate-spin" /> : <Upload />}
                                    </Button>
                                    <input type="file" ref={aadharFileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                </div>
                                {ocrStatus.loading && <p className="text-sm text-muted-foreground">{ocrStatus.message}</p>}
                                {ocrStatus.error && <p className="text-sm text-destructive">{ocrStatus.error}</p>}
                                <FormMessage />
                            </FormItem>
                        )} />
                        {bankFields.map(f => (
                            <FormField key={f.name} control={form.control} name={f.name as keyof PmVishwakarmaFormValues} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{f.label}</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        {isOtpStep && (
             <Alert className="border-accent bg-accent/5">
                <AlertTitle className="text-accent font-bold">{t('otpVerification')}</AlertTitle>
                <AlertDescription dangerouslySetInnerHTML={{ __html: t('otpSent').replace('{last4Digits}', userData.mobileNumber.slice(-4)) }} />
                 <FormField control={form.control} name="otp" render={({ field }) => (
                    <FormItem className="mt-4">
                        <FormLabel>{t('enterOtp')}</FormLabel>
                        <FormControl><Input {...field} placeholder="******" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={!isAutofilled || isAutofillPending || isOcrPending}>
            {isOtpStep ? t('confirmAndSubmit') : t('proceedToOtp')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
