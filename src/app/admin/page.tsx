"use client";

import { useAppState } from "@/context/app-state-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
    const { 
        isFormSubmitted, 
        isAdminApproved, 
        handleAdminApproval, 
        formData 
    } = useAppState();
    const { toast } = useToast();

    const onApprove = () => {
        handleAdminApproval(true);
        toast({
            title: "Application Approved!",
            description: "Admin has approved. Finalizing beneficiary status...",
        });
    };

    const onReject = () => {
        handleAdminApproval(false);
        toast({
            variant: 'destructive',
            title: 'Application Rejected',
            description: 'Application approval has been reset to "Pending".',
        });
    }

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl text-primary">Admin Approval Panel</CardTitle>
                        <CardDescription>Review and approve submitted applications.</CardDescription>
                    </CardHeader>
                </Card>

                {!isFormSubmitted ? (
                     <Card>
                        <CardContent className="p-6 text-center">
                            <p>No applications submitted yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                             <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Application from {formData?.farmerName}</CardTitle>
                                    <CardDescription>Submitted for PM-KISAN Scheme</CardDescription>
                                </div>
                                <Badge className={isAdminApproved ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}>
                                    {isAdminApproved ? 'Approved' : 'Pending Approval'}
                                </Badge>
                             </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                            <h4 className="font-semibold">Personal Details</h4>
                             <p><strong>State:</strong> {formData?.state}</p>
                             <p><strong>District:</strong> {formData?.district}</p>
                             <p><strong>Village:</strong> {formData?.village}</p>
                           </div>
                           <div>
                            <h4 className="font-semibold">Bank Details</h4>
                            <p><strong>Bank Name:</strong> {formData?.bankName}</p>
                            <p><strong>Account Number:</strong> {formData?.accountNumber}</p>
                            <p><strong>Aadhaar:</strong> {formData?.aadhaarNumber}</p>
                           </div>
                           <div className="flex gap-4 pt-4">
                               <Button onClick={onApprove} disabled={isAdminApproved}>
                                   <Check className="mr-2 h-4 w-4"/>Approve
                               </Button>
                               <Button onClick={onReject} variant="destructive" disabled={!isFormSubmitted || !isAdminApproved}>
                                   <X className="mr-2 h-4 w-4"/>Reject
                               </Button>
                           </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}
