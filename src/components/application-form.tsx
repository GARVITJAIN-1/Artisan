"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { PmKisanFormValues } from '@/lib/schema';
import { pmKisanFormSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from './ui/separator';
import { Loader, Sparkles } from 'lucide-react';
import { useState, useTransition } from 'react';
import { autofillPmKisanFormAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type ApplicationFormProps = {
  userData: any;
  onFormSubmit: (data: PmKisanFormValues) => void;
  onClose: () => void;
};

export default function ApplicationForm({ userData, onFormSubmit, onClose }: ApplicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const { toast } = useToast();

  const form = useForm<PmKisanFormValues>({
    resolver: zodResolver(pmKisanFormSchema),
    defaultValues: {
      state: '',
      district: '',
      subDistrict: '',
      block: '',
      village: '',
      farmerName: '',
      gender: undefined,
      category: undefined,
      farmerType: undefined,
      aadhaarNumber: '',
      bankName: '',
      ifscCode: '',
      accountNumber: '',
      otp: '',
    },
  });

  const handleAutofill = () => {
    startTransition(async () => {
      const result = await autofillPmKisanFormAction();
      if (result.success && result.data) {
        // Using `any` to bypass strict type checking for dynamic key setting
        Object.keys(result.data).forEach((key: any) => {
          form.setValue(key, result.data[key], { shouldValidate: true });
        });
        setIsAutofilled(true);
        toast({
          title: 'Form Auto-filled!',
          description: 'The AI has filled the form. Please review the details.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'AI Autofill Failed',
          description: result.error,
        });
      }
    });
  };

  const onSubmit = (data: PmKisanFormValues) => {
    if(!isOtpStep) {
        setIsOtpStep(true);
        return;
    }
    // Simulate OTP validation
    if(data.otp !== '123456'){
        form.setError('otp', {type: 'manual', message: 'Invalid OTP. Please enter 123456.'});
        return;
    }
    onFormSubmit(data);
  };
  
  const formFields = [
      { name: 'state', label: 'State' }, { name: 'district', label: 'District' },
      { name: 'subDistrict', label: 'Sub-District/Tehsil' }, { name: 'block', label: 'Block' },
      { name: 'village', label: 'Village' }, { name: 'farmerName', label: 'Farmer Name' }
  ];

  const selectFields = [
      { name: 'gender', label: 'Gender', options: ['Male', 'Female', 'Other']},
      { name: 'category', label: 'Category', options: ['General', 'SC', 'ST', 'OBC']},
      { name: 'farmerType', label: 'Farmer Type', options: ['Small (1-2 Ha)', 'Marginal (<1 Ha)', 'Other']}
  ];
  
  const bankFields = [
      { name: 'aadhaarNumber', label: 'Aadhaar Number (XXXX-XXXX-XXXX)'},
      { name: 'bankName', label: 'Bank Name'},
      { name: 'ifscCode', label: 'IFSC Code'},
      { name: 'accountNumber', label: 'Account Number'}
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {!isAutofilled && (
             <Alert className="border-primary bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-bold">Save Time with AI!</AlertTitle>
                <AlertDescription>
                    Click the button below to let our AI assistant fill in your application based on your profile data.
                    <Button type="button" onClick={handleAutofill} disabled={isPending} className="mt-4 w-full">
                        {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Auto-fill with AI
                    </Button>
                </AlertDescription>
            </Alert>
        )}
       
        {isAutofilled && !isOtpStep && (
            <Card className="bg-secondary/50">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Personal & Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formFields.map(f => (
                        <FormField key={f.name} control={form.control} name={f.name as keyof PmKisanFormValues} render={({ field }) => (
                            <FormItem>
                                <FormLabel>{f.label}</FormLabel>
                                <FormControl><Input {...field} readOnly /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    ))}
                     {selectFields.map(f => (
                        <FormField key={f.name} control={form.control} name={f.name as keyof PmKisanFormValues} render={({ field }) => (
                            <FormItem>
                                <FormLabel>{f.label}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {f.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                     ))}
                    </div>
                    <Separator className="my-6" />
                    <h3 className="text-lg font-semibold mb-2">Bank & Aadhaar Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bankFields.map(f => (
                            <FormField key={f.name} control={form.control} name={f.name as keyof PmKisanFormValues} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{f.label}</FormLabel>
                                    <FormControl><Input {...field} readOnly /></FormControl>
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
                <AlertTitle className="text-accent font-bold">One Final Step: OTP Verification</AlertTitle>
                <AlertDescription>
                   We've sent an OTP to your registered mobile number ending in {userData.mobileNumber.slice(-4)}. 
                   For this demo, please use <strong>123456</strong>.
                </AlertDescription>
                 <FormField control={form.control} name="otp" render={({ field }) => (
                    <FormItem className="mt-4">
                        <FormLabel>Enter OTP</FormLabel>
                        <FormControl><Input {...field} placeholder="******" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isAutofilled}>
            {isOtpStep ? 'Confirm & Submit Application' : 'Proceed to OTP Verification'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
