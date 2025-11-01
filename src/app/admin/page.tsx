"use client";

import { useAppState } from "@/context/app-state-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

export default function AdminPage() {
    const { 
        isFormSubmitted, 
        isAdminApproved, 
        handleAdminApproval, 
        formData 
    } = useAppState();
    const { toast } = useToast();
    const { t } = useLanguage();

    const onApprove = () => {
        handleAdminApproval(true);
        toast({
            title: t('applicationApproved'),
            description: t('applicationApprovedDesc'),
        });
    };

    const onReject = () => {
        handleAdminApproval(false);
        toast({
            variant: 'destructive',
            title: t('applicationRejected'),
            description: t('applicationRejectedDesc'),
        });
    }

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl text-primary">{t('adminApprovalPanel')}</CardTitle>
                        <CardDescription>{t('adminApprovalPanelDesc')}</CardDescription>
                    </CardHeader>
                </Card>

                {!isFormSubmitted ? (
                     <Card>
                        <CardContent className="p-6 text-center">
                            <p>{t('noApplications')}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                             <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{t('applicationFrom').replace('{farmerName}', formData?.farmerName || '')}</CardTitle>
                                    <CardDescription>{t('applicationFor')}</CardDescription>
                                </div>
                                <Badge className={isAdminApproved ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}>
                                    {isAdminApproved ? t('statusApproved') : t('statusPending')}
                                </Badge>
                             </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                            <h4 className="font-semibold">{t('personalDetails')}</h4>
                             <p><strong>{t('state')}:</strong> {formData?.state}</p>
                             <p><strong>{t('district')}:</strong> {formData?.district}</p>
                             <p><strong>{t('village')}:</strong> {formData?.village}</p>
                           </div>
                           <div>
                            <h4 className="font-semibold">{t('bankDetails')}</h4>
                            <p><strong>{t('bankName')}:</strong> {formData?.bankName}</p>
                            <p><strong>{t('accountNumber')}:</strong> {formData?.accountNumber}</p>
                            <p><strong>{t('aadhaarNumber')}:</strong> {formData?.aadhaarNumber}</p>
                           </div>
                           <div className="flex gap-4 pt-4">
                               <Button onClick={onApprove} disabled={isAdminApproved}>
                                   <Check className="mr-2 h-4 w-4"/>{t('approve')}
                               </Button>
                               <Button onClick={onReject} variant="destructive" disabled={!isFormSubmitted || !isAdminApproved}>
                                   <X className="mr-2 h-4 w-4"/>{t('reject')}
                               </Button>
                           </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}
