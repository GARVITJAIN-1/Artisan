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
import { useLanguage } from '@/context/language-context';

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
  const { t } = useLanguage();

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

  const onSubmit = (data: PmKisanFormValues) => {
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
      { name: 'village', label: t('village') }, { name: 'farmerName', label: t('farmerName') }
  ];

  const selectFields = [
      { name: 'gender', label: t('gender'), options: [{value: 'Male', label: t('male')}, {value: 'Female', label: t('female')}, {value: 'Other', label: t('other')}]},
      { name: 'category', label: t('category'), options: [{value: 'General', label: t('general')}, {value: 'SC', label: t('sc')}, {value: 'ST', label: t('st')}, {value: 'OBC', label: t('obc')}]},
      { name: 'farmerType', label: t('farmerType'), options: [{value: 'Small (1-2 Ha)', label: t('smallFarmer')}, {value: 'Marginal (<1 Ha)', label: t('marginalFarmer')}, {value: 'Other', label: t('otherFarmer')}]}
  ];
  
  const bankFields = [
      { name: 'aadhaarNumber', label: t('aadhaarNumber')},
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
                    <Button type="button" onClick={handleAutofill} disabled={isPending} className="mt-4 w-full">
                        {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
                        <FormField key={f.name} control={form.control} name={f.name as keyof PmKisanFormValues} render={({ field }) => (
                            <FormItem>
                                <FormLabel>{f.label}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    ))}
                     {selectFields.map(f => (
                        <FormField key={f.name} control={form.control} name={f.name as keyof PmKisanFormValues} render={({ field }) => (
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
                        {bankFields.map(f => (
                            <FormField key={f.name} control={form.control} name={f.name as keyof PmKisanFormValues} render={({ field }) => (
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
          <Button type="submit" disabled={!isAutofilled}>
            {isOtpStep ? t('confirmAndSubmit') : t('proceedToOtp')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
