import { ClipboardPenLine, Send, Gavel, CircleDollarSign } from "lucide-react";

export const applicationStages = [
  { name: 'eligibilityDataCollection', icon: ClipboardPenLine },
  { name: 'applicationSubmittedStage', icon: Send },
  { name: 'verificationApproval', icon: Gavel },
  { name: 'beneficiaryPayment', icon: CircleDollarSign },
];

export type ChecklistItemStatus = 'completed' | 'current' | 'upcoming';

export type ChecklistItem = {
  text: string;
  status: ChecklistItemStatus;
};

export const initialChecklist: ChecklistItem[] = [
    { text: 'provideAadhaar', status: 'upcoming' },
    { text: 'uploadLandRecords', status: 'upcoming' },
    { text: 'appAutofilled', status: 'upcoming' },
    { text: 'undergoingVerification', status: 'upcoming' },
    { text: 'awaitingInclusion', status: 'upcoming' },
    { text: 'firstInstallment', status: 'upcoming' },
];

export const cscLocations = [
    { name: 'CSC Center Rampur', address: '123, Main Market, Rampur, Sitapur', hours: '9 AM - 6 PM' },
    { name: 'Digital Seva Kendra', address: 'Near Bus Stand, Rampur, Sitapur', hours: '10 AM - 7 PM' },
];

export const requiredDocuments = [
    'Aadhaar card',
    'Proof of citizenship',
    'Documents showing ownership of land (khatoni/khasra)',
    'Bank account details (Bank Passbook)',
    'Registered mobile number for OTP',
];
