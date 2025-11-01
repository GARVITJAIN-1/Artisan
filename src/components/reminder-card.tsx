"use client"

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { FileText, MapPin, BellRing, BrainCircuit, Loader } from 'lucide-react';
import { getKycAssistanceAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useLanguage } from '@/context/language-context';

type ReminderCardProps = {
  title: string;
  description: string;
  cscLocations?: { name: string; address: string; hours: string }[];
  documents?: string[];
};

export default function ReminderCard({ title, description, cscLocations, documents }: ReminderCardProps) {
    const [isPending, startTransition] = useTransition();
    const [assistance, setAssistance] = useState('');
    const { toast } = useToast();
    const { t, locale } = useLanguage();

    const handleKycAssistance = () => {
        startTransition(async () => {
            const result = await getKycAssistanceAction(locale);
            if(result.success) {
                setAssistance(result.data);
                 toast({
                    title: t('aiAssistanceReady'),
                    description: t('aiAssistanceReadyDesc'),
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: t('aiError'),
                    description: result.error,
                });
            }
        })
    }
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
            <BellRing className="h-6 w-6" />
        </div>
        <div className='flex-1'>
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {cscLocations && (
          <div className="space-y-4">
            <Button onClick={handleKycAssistance} disabled={isPending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                {t('getAiAssistance')}
            </Button>
            {assistance && (
                <Alert className="border-accent">
                    <AlertTitle className="font-bold">{t('aiKycGuide')}</AlertTitle>
                    <AlertDescription>
                        <pre className="whitespace-pre-wrap font-body text-sm">{assistance}</pre>
                    </AlertDescription>
                </Alert>
            )}
            <h4 className="font-bold">{t('nearbyCsc')}</h4>
            <ul className="space-y-3">
              {cscLocations.map((loc, i) => (
                <li key={i} className="flex gap-4">
                    <MapPin className="h-5 w-5 flex-shrink-0 text-primary mt-1" />
                    <div>
                        <p className="font-semibold">{loc.name}</p>
                        <p className="text-sm text-muted-foreground">{loc.address}</p>
                        <p className="text-sm text-muted-foreground">Hours: {loc.hours}</p>
                    </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {documents && (
            <ul className="space-y-3">
                {documents.map((doc, i) => (
                    <li key={i} className="flex items-center gap-4">
                        <FileText className="h-5 w-5 flex-shrink-0 text-primary" />
                        <span>{t(doc)}</span>
                    </li>
                ))}
            </ul>
        )}
      </CardContent>
    </Card>
  );
}
