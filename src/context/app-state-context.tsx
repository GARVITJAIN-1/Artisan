"use client";

import type { PmKisanFormValues } from "@/lib/schema";
import { initialChecklist, type ChecklistItem } from "@/lib/data";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

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
    const [stage, setStage] = useState<ApplicationStage>(0);
    const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAdminApproved, setIsAdminApproved] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [formData, setFormData] = useState<PmKisanFormValues | null>(null);

    const handleFormSubmit = (data: PmKisanFormValues) => {
        setFormData(data);
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
        }
    };

     const startApplication = () => {
        setStage(1);
        setChecklist(prev => prev.map(item => item.text === 'Provide Aadhaar & Bank Details' ? {...item, status: 'current'} : item));
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
