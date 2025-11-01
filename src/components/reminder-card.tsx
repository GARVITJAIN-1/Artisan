"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { FileText, MapPin, BellRing, BrainCircuit, Loader } from "lucide-react";
import { getKycAssistanceAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useLanguage } from "@/context/language-context";

type ReminderCardProps = {
  title: string;
  description: string;
  cscLocations?: { name: string; address: string; hours: string }[];
  documents?: string[];
};

export default function ReminderCard({
  title,
  description,
  cscLocations,
  documents,
}: ReminderCardProps) {
  const [isPending, startTransition] = useTransition();
  const [assistance, setAssistance] = useState("");
  const { toast } = useToast();
  const { t, locale } = useLanguage();

  const handleKycAssistance = () => {
    startTransition(async () => {
      const result = await getKycAssistanceAction(locale);
      if (result.success) {
        setAssistance(result.data);
        toast({
          title: t("aiAssistanceReady"),
          description: t("aiAssistanceReadyDesc"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("aiError"),
          description: result.error,
        });
      }
    });
  };
  return (
    // ## Updated Card Style ##
    <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        {/* ## Updated Icon Bubble Style ## */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-200 text-amber-700 flex-shrink-0">
          <BellRing className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <CardTitle className="font-headline text-xl text-stone-900">
            {title}
          </CardTitle>
          <CardDescription className="text-stone-600">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {cscLocations && (
          <div className="space-y-4">
            {/* ## Updated Button Style (Accent) ## */}
            <Button
              onClick={handleKycAssistance}
              disabled={isPending}
              className="w-full bg-amber-100 text-amber-800 hover:bg-amber-200/80"
            >
              {isPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
              )}
              {t("getAiAssistance")}
            </Button>
            {assistance && (
              // ## Updated Alert Style ##
              <Alert className="bg-amber-50/50 border-amber-200">
                <AlertTitle className="font-bold text-amber-800">
                  {t("aiKycGuide")}
                </AlertTitle>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap font-body text-sm text-stone-700">
                    {assistance}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
            <h4 className="font-bold text-stone-800">{t("nearbyCsc")}</h4>
            <ul className="space-y-3">
              {cscLocations.map((loc, i) => (
                <li key={i} className="flex gap-4">
                  {/* ## Updated Icon Color ## */}
                  <MapPin className="h-5 w-5 flex-shrink-0 text-amber-600 mt-1" />
                  <div>
                    <p className="font-semibold text-stone-700">{loc.name}</p>
                    <p className="text-sm text-stone-500">{loc.address}</p>
                    <p className="text-sm text-stone-500">Hours: {loc.hours}</p>
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
                {/* ## Updated Icon Color ## */}
                <FileText className="h-5 w-5 flex-shrink-0 text-amber-600" />
                <span className="text-stone-700">{t(doc)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
