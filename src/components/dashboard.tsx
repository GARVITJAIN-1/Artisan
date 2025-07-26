
"use client";

import { useState } from 'react';
import type { ChecklistItem } from '@/lib/data';
import { applicationStages, initialChecklist, cscLocations, requiredDocuments } from '@/lib/data';
import { userData } from '@/lib/schema';
import ProgressTracker from './progress-tracker';
import StatusChecklist from './status-checklist';
import ReminderCard from './reminder-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import ApplicationForm from './application-form';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Rocket } from 'lucide-react';

type ApplicationStage = 0 | 1 | 2 | 3 | 4;

export default function Dashboard() {
  const { toast } = useToast();
  const [stage, setStage] = useState<ApplicationStage>(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdminApproved, setIsAdminApproved] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [form1Data, setForm1Data] = useState<object | null>(null);

  const handleFormSubmit = (data: object) => {
    setForm1Data(data);
    setStage(2);
    setIsFormSubmitted(true);
    setChecklist(prev =>
      prev.map(item =>
        item.text === 'Provide Aadhaar & Bank Details' ||
        item.text === 'Upload Land Records' ||
        item.text === 'Application Auto-Filled & Submitted'
          ? { ...item, status: 'completed' }
          : item.text === 'Undergoing Verification by Government Officials'
          ? { ...item, status: 'current' }
          : item
      )
    );
    setIsFormOpen(false);
    toast({
      title: "Application Submitted!",
      description: "Your form has been submitted and is now pending admin approval.",
    });
  };
  
  const handleAdminApproval = (approved: boolean) => {
    setIsAdminApproved(approved);
    if (approved) {
      setStage(3);
      setChecklist(prev =>
        prev.map(item =>
          item.text === 'Undergoing Verification by Government Officials'
            ? { ...item, status: 'completed' }
            : item.text === 'Awaiting Inclusion in Beneficiary List'
            ? { ...item, status: 'current' }
            : item
        )
      );
      toast({
        title: "Application Approved!",
        description: "Admin has approved. Finalizing beneficiary status...",
      });

      // Simulate final inclusion and payment disbursement
      setTimeout(() => {
        setStage(4);
        setChecklist(prev =>
          prev.map(item => (item.status !== 'completed' ? { ...item, status: 'completed' } : item))
        );
        toast({
          title: "Congratulations! You are now a Beneficiary.",
          description: "First installment has been disbursed.",
          className: "bg-primary text-primary-foreground border-primary",
        });
      }, 2000);
    } else {
      // Logic for when admin "un-approves"
      setStage(2);
      setChecklist(prev =>
        prev.map(item => {
          if (item.text === 'Undergoing Verification by Government Officials') {
            return { ...item, status: 'current' };
          }
          if (['Awaiting Inclusion in Beneficiary List', 'First Installment Disbursed'].includes(item.text)) {
            return { ...item, status: 'upcoming' };
          }
          return item;
        })
      );
      toast({
        variant: 'destructive',
        title: 'Approval Retracted',
        description: 'Application approval has been reset to "Pending".',
      });
    }
  };

  const startApplication = () => {
    setStage(1);
    setChecklist(prev => prev.map(item => item.text === 'Provide Aadhaar & Bank Details' ? {...item, status: 'current'} : item));
    setIsFormOpen(true);
  }

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

            {isFormSubmitted && stage < 4 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Approval</CardTitle>
                        <CardDescription>This section simulates an administrator approving the submitted form.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center space-x-4">
                        <Label htmlFor="admin-approval" className={`font-bold ${isAdminApproved ? 'text-primary' : 'text-accent'}`}>
                            {isAdminApproved ? "Approved" : "Pending"}
                        </Label>
                        <Switch
                            id="admin-approval"
                            checked={isAdminApproved}
                            onCheckedChange={handleAdminApproval}
                            aria-label="Admin Approval Switch"
                        />
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
