
"use client";

import { cscLocations, artisanSchemes } from '@/lib/data';
import ProgressTracker from './progress-tracker';
import StatusChecklist from './status-checklist';
import ReminderCard from './reminder-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import ApplicationForm from './application-form';
import { Badge } from './ui/badge';
import { Rocket, Trophy, Briefcase, Banknote, Lightbulb, TrendingUp, GitCompareArrows } from 'lucide-react';
import { useAppState } from '@/context/app-state-context';
import { userData } from '@/lib/schema';
import { useLanguage } from '@/context/language-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import SchemeComparison from './scheme-comparison';
import AadhaarOcrCard from './aadhaar-ocr-card';

const benefitIcons: { [key: string]: React.ElementType } = {
  Recognition: Trophy,
  'Skill Upgradation': Briefcase,
  'Toolkit Incentive': Banknote,
  'Credit Support': Banknote,
  'Incentive for Digital Transaction': Lightbulb,
  'Marketing Support': TrendingUp,
  'Loan Facility': Banknote,
  'No Collateral': Banknote,
  'Significant Loan Amount': Banknote,
  Inclusive: Trophy
};


export default function Dashboard() {
  const { 
    stage, 
    checklist, 
    isFormOpen, 
    setIsFormOpen,
    isFormSubmitted,
    isAdminApproved,
    handleFormSubmit,
    startApplication,
    selectedSchemeId,
    setSelectedSchemeId,
    isComparisonOpen,
    setIsComparisonOpen,
    comparisonScheme1Id,
    setComparisonScheme1Id,
    comparisonScheme2Id,
    setComparisonScheme2Id
  } = useAppState();
  const { t } = useLanguage();

  const selectedScheme = artisanSchemes.find(s => s.id === selectedSchemeId) || artisanSchemes[0];
  const comparisonScheme1 = artisanSchemes.find(s => s.id === comparisonScheme1Id);
  const comparisonScheme2 = artisanSchemes.find(s => s.id === comparisonScheme2Id);

  const getStatusBadge = () => {
    if (stage < 2) return <Badge variant="outline">{t('statusNotStarted')}</Badge>
    if (stage === 2 && !isAdminApproved) return <Badge className="bg-accent text-accent-foreground">{t('statusPendingApproval')}</Badge>
    if (stage >= 3) return <Badge className="bg-primary text-primary-foreground">{t('statusActiveBeneficiary')}</Badge>
    return null;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">{t('schemeSelection')}</CardTitle>
          <CardDescription>{t('schemeSelectionDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select onValueChange={setSelectedSchemeId} defaultValue={selectedSchemeId}>
            <SelectTrigger className="w-full sm:w-1/2">
              <SelectValue placeholder="Select a scheme" />
            </SelectTrigger>
            <SelectContent>
              {artisanSchemes.map(scheme => (
                <SelectItem key={scheme.id} value={scheme.id}>{t(scheme.name)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setIsComparisonOpen(true)}>
             <GitCompareArrows className="mr-2 h-4 w-4" />
             {t('compareSchemes')}
          </Button>
        </CardContent>
      </Card>


      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-3xl text-primary">{t('applicationJourney')} for {t(selectedScheme.name)}</CardTitle>
                    <CardDescription>{t('applicationJourneyDesc')}</CardDescription>
                </div>
                {getStatusBadge()}
            </div>
        </CardHeader>
        <CardContent>
          <ProgressTracker stages={selectedScheme.applicationStages} currentStage={stage} />
        </CardContent>
      </Card>

      <AadhaarOcrCard artisanId="ARTISAN12345" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <StatusChecklist items={checklist} />
            
            {stage < 2 && !isFormSubmitted && (
                 <Card className="bg-primary text-primary-foreground text-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">{t('readyToStart')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">{t('readyToStartDesc')}</p>
                        <Button variant="secondary" size="lg" onClick={startApplication}>
                            <Rocket className="mr-2 h-5 w-5"/>
                            {t('startNewApplication')}
                        </Button>
                    </CardContent>
                 </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{t('schemeBenefits')}</CardTitle>
                    <CardDescription>{t('schemeBenefitsDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {selectedScheme.benefits.map((benefit, index) => {
                            const Icon = benefitIcons[benefit.title] || Briefcase;
                            return (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>
                                        <div className='flex items-center gap-4'>
                                            <Icon className='h-5 w-5 text-primary' />
                                            <span className='font-bold'>{t(benefit.title)}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {t(benefit.description)}
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <ReminderCard
                title={t('eKycReminder')}
                description={t('eKycReminderDesc')}
                cscLocations={cscLocations}
            />
            <ReminderCard
                title={t('requiredDocs')}
                description={t('requiredDocsDesc')}
                documents={selectedScheme.requiredDocuments}
            />
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">{t('newBeneficiaryReg')} for {t(selectedScheme.name)}</DialogTitle>
          </DialogHeader>
          <ApplicationForm
            userData={userData}
            onFormSubmit={handleFormSubmit}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl text-primary">{t('compareSchemes')}</DialogTitle>
                <DialogDescription>{t('compareSchemesDesc')}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <Select onValueChange={setComparisonScheme1Id} defaultValue={comparisonScheme1Id}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('selectScheme1')} />
                    </SelectTrigger>
                    <SelectContent>
                        {artisanSchemes.map(scheme => (
                            <SelectItem key={scheme.id} value={scheme.id} disabled={scheme.id === comparisonScheme2Id}>{t(scheme.name)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={setComparisonScheme2Id} defaultValue={comparisonScheme2Id}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('selectScheme2')} />
                    </SelectTrigger>
                    <SelectContent>
                        {artisanSchemes.map(scheme => (
                            <SelectItem key={scheme.id} value={scheme.id} disabled={scheme.id === comparisonScheme1Id}>{t(scheme.name)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {comparisonScheme1 && comparisonScheme2 && (
                <SchemeComparison scheme1={comparisonScheme1} scheme2={comparisonScheme2} />
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
