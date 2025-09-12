import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PmKisanFormValues } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mapFarmerDataToForm(farmerData: any): Partial<PmKisanFormValues> {
  if (!farmerData) {
    return {};
  }
  
  return {
    state: farmerData.address?.state,
    district: farmerData.address?.district,
    subDistrict: farmerData.address?.subDistrict,
    block: farmerData.address?.block,
    village: farmerData.address?.village,
    farmerName: farmerData.name,
    gender: farmerData.gender,
    category: farmerData.category,
    farmerType: farmerData.farmerType,
    aadhaarNumber: farmerData.aadhaarNumber,
    bankName: farmerData.bank?.name,
    ifscCode: farmerData.bank?.ifsc,
    accountNumber: farmerData.bank?.accountNumber,
  };
}

export const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
