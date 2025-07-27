"use client";

import type { PmKisanFormValues } from "@/lib/schema";
import { initialChecklist, type ChecklistItem } from "@/lib/data";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "./language-context";
import { sendWhatsAppNotificationAction } from "@/app/actions";

type ApplicationStage = 0 | 1 | 2 | 3 | 4;

type AppState = {
    stage: ApplicationStage;
    setStage: (stage: ApplicationStage) => void;
    checklist: ChecklistItem[];
    setChecklist: (checklist: ChecklistItem[] | ((prev: ChecklistItem[]) => ChecklistItem[])) => void;
    isFormOpen: boolean;
    setIsFormOpen: (isOpen: boolean) => void;
    isFormSubmitted: boolean;
    setIsFormSubmitted: (isSubmitted: boolean) => void;
    isAdminApproved: boolean;
    setIsAdminApproved: (isApproved: boolean) => void;
    formData: PmKisanFormValues | null;
    setFormData: (data: PmKisanFormValues | null) => void;
    handleFormSubmit: (data: PmKisanFormValues) => void;
    handleAdminApproval: (approved: boolean) => void;
    startApplication: () => void;
};

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [stage, setStage] = useState<ApplicationStage>(0);
    const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAdminApproved, setIsAdminApproved] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [formData, setFormData] = useState<PmKisanFormValues | null>(null);

    const notify = (messageKey: string) => {
        const message = t(messageKey);
        sendWhatsAppNotificationAction(message);
    }

    const handleFormSubmit = (data: PmKisanFormValues) => {
        setFormData(data);
        setStage(2);
        notify('whatsappApplicationSubmitted');
        setIsFormSubmitted(true);
        setChecklist(prev =>
            prev.map(item =>
                item.text === 'provideAadhaar' ||
                item.text === 'uploadLandRecords' ||
                item.text === 'appAutofilled'
                    ? { ...item, status: 'completed' }
                    : item.text === 'undergoingVerification'
                        ? { ...item, status: 'current' }
                        : item
            )
        );
        setIsFormOpen(false);
        toast({
            title: t('applicationSubmitted'),
            description: t('applicationSubmittedDesc'),
        });
    };

    const handleAdminApproval = (approved: boolean) => {
        setIsAdminApproved(approved);
        if (approved) {
            setStage(3);
            notify('whatsappApplicationApproved');
            setChecklist(prev =>
                prev.map(item =>
                    item.text === 'undergoingVerification'
                        ? { ...item, status: 'completed' }
                        : item.text === 'awaitingInclusion'
                            ? { ...item, status: 'current' }
                            : item
                )
            );
            
            setTimeout(() => {
                setStage(4);
                notify('whatsappFirstInstallment');
                setChecklist(prev =>
                    prev.map(item => (item.status !== 'completed' ? { ...item, status: 'completed' } : item))
                );
                toast({
                    title: t('congratulationsBeneficiary'),
                    description: t('firstInstallmentDisbursed'),
                    className: "bg-primary text-primary-foreground border-primary",
                });
            }, 2000);

        } else {
            setStage(2);
            // Optionally send a rejection notification
            // notify('whatsappApplicationRejected'); 
            setChecklist(prev =>
                prev.map(item => {
                    if (item.text === 'undergoingVerification') {
                        return { ...item, status: 'current' };
                    }
                    if (['awaitingInclusion', 'firstInstallment'].includes(item.text)) {
                        return { ...item, status: 'upcoming' };
                    }
                    return item;
                })
            );
        }
    };

     const startApplication = () => {
        setStage(1);
        notify('whatsappApplicationStarted');
        setChecklist(prev => prev.map(item => item.text === 'provideAadhaar' ? {...item, status: 'current'} : item));
        setIsFormOpen(true);
    }

    const value = {
        stage, setStage,
        checklist, setChecklist,
        isFormOpen, setIsFormOpen,
        isFormSubmitted, setIsFormSubmitted,
        isAdminApproved, setIsAdminApproved,
        formData, setFormData,
        handleFormSubmit,
        handleAdminApproval,
        startApplication
    };

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
}
