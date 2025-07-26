"use server";

import { pmKisanApplicationAutofill } from "@/ai/flows/pm-kisan-application-autofill";
import { assistKycReminder } from "@/ai/flows/data-assisted-kyc-reminder";
import { pmKisanFormJsonSchema } from "@/lib/schema";
import { db } from "@/lib/db";

export async function autofillPmKisanFormAction(currentFormData?: object) {
  try {
    const farmerId = "FARMER12345"; // In a real app, this would come from the user's session
    const result = await pmKisanApplicationAutofill({
      farmerId: farmerId,
      formDataSchema: JSON.stringify(pmKisanFormJsonSchema),
      currentFormData: currentFormData ? JSON.stringify(currentFormData) : '{}',
    });
    return { success: true, data: JSON.parse(result.filledFormData) };
  } catch (error) {
    console.error("Error in AI autofill action:", error);
    return { success: false, error: "Failed to autofill form. Please try again." };
  }
}

export async function getKycAssistanceAction() {
    try {
        const userData = await db.getFarmerById("FARMER12345");
        if (!userData) {
          throw new Error("User not found");
        }
        const result = await assistKycReminder({
            farmerId: "FARMER12345",
            farmerName: userData.name,
            aadhaarNumber: userData.aadhaarNumber,
            bankAccountNumber: userData.bank.accountNumber,
            landRecords: JSON.stringify(userData.landRecords),
        });
        return { success: true, data: result.eKycAssistance };
    } catch (error) {
        console.error("Error in KYC assistance action:", error);
        return { success: false, error: "Failed to get KYC assistance. Please try again." };
    }
}
