import { Circle, CircleCheck, CircleDollarSign, ClipboardPenLine, Gavel, LoaderCircle, Send } from "lucide-react";

export const applicationStages = [
  { name: 'Eligibility & Data Collection', icon: ClipboardPenLine },
  { name: 'Application Submitted', icon: Send },
  { name: 'Verification & Approval', icon: Gavel },
  { name: 'Beneficiary & Payment', icon: CircleDollarSign },
];

export type ChecklistItemStatus = 'completed' | 'current' | 'upcoming';

export type ChecklistItem = {
  text: string;
  status: ChecklistItemStatus;
};

export const initialChecklist: ChecklistItem[] = [
    { text: 'Provide Aadhaar & Bank Details', status: 'upcoming' },
    { text: 'Upload Land Records', status: 'upcoming' },
    { text: 'Application Auto-Filled & Submitted', status: 'upcoming' },
    { text: 'Undergoing Verification by Government Officials', status: 'upcoming' },
    { text: 'Awaiting Inclusion in Beneficiary List', status: 'upcoming' },
    { text: 'First Installment Disbursed', status: 'upcoming' },
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
