
"use client";

import type { ChecklistItem } from '@/lib/data';
import { applicationStages, cscLocations, requiredDocuments } from '@/lib/data';
import ProgressTracker from './progress-tracker';
import StatusChecklist from './status-checklist';
import ReminderCard from './reminder-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import ApplicationForm from './application-form';
import { Badge } from './ui/badge';
import { Rocket } from 'lucide-react';
import { useAppState } from '@/context/app-state-context';
import { userData } from '@/lib/schema';

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
  } = useAppState();


  const getStatusBadge = () => {
    if (stage < 2) return <Badge variant="outline">Not Started</Badge>
    if (stage === 2 && !isAdminApproved) return <Badge className="bg-accent text-accent-foreground">Pending Approval</Badge>
    if (stage >= 3) return <Badge className="bg-primary text-primary-foreground">Active Beneficiary</Badge>
    return null;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-3xl text-primary">Your Application Journey</CardTitle>
                    <CardDescription>Track your PM-KISAN application status from start to finish.</CardDescription>
                </div>
                {getStatusBadge()}
            </div>
        </CardHeader>
        <CardContent>
          <ProgressTracker stages={applicationStages} currentStage={stage} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <StatusChecklist items={checklist} />
            
            {stage < 2 && !isFormSubmitted && (
                 <Card className="bg-primary text-primary-foreground text-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">Ready to start?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Begin your journey to becoming a PM-KISAN beneficiary with our AI assistant.</p>
                        <Button variant="secondary" size="lg" onClick={startApplication}>
                            <Rocket className="mr-2 h-5 w-5"/>
                            Start New Application
                        </Button>
                    </CardContent>
                 </Card>
            )}
        </div>
        <div className="space-y-8">
            <ReminderCard
                title="e-KYC Reminder"
                description="e-KYC is mandatory for all PM-KISAN beneficiaries. Complete it online or at a nearby CSC."
                cscLocations={cscLocations}
            />
            <ReminderCard
                title="Required Documents"
                description="Ensure you have these documents ready for a smooth application process."
                documents={requiredDocuments}
            />
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">New Beneficiary Registration</DialogTitle>
          </DialogHeader>
          <ApplicationForm
            userData={userData}
            onFormSubmit={handleFormSubmit}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
