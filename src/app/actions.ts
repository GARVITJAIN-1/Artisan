
"use server";

import { assistKycReminder } from "@/ai/flows/data-assisted-kyc-reminder";
import { db } from "@/lib/db";
import { mapFarmerDataToForm } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/services/twilio";


export async function autofillPmKisanFormAction(currentFormData?: object) {
  try {
    const farmerId = "FARMER12345";
    const farmerData = await db.getFarmerById(farmerId);
    if (!farmerData) {
      return { success: false, error: "Farmer data not found." };
    }
    const filledData = mapFarmerDataToForm(farmerData);
    return { success: true, data: filledData };

  } catch (error) {
    console.error("Error in autofill action:", error);
    return { success: false, error: "Failed to autofill form. Please try again." };
  }
}

export async function getKycAssistanceAction(language: 'en' | 'hi' = 'en') {
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
            language,
        });
        return { success: true, data: result.eKycAssistance };
    } catch (error) {
        console.error("Error in KYC assistance action:", error);
        return { success: false, error: "Failed to get KYC assistance. Please try again." };
    }
}

export async function sendWhatsAppNotificationAction(message: string) {
    const recipient = process.env.RECIPIENT_PHONE_NUMBER;
    if (!recipient) {
        console.error("RECIPIENT_PHONE_NUMBER not set in .env");
        return { success: false, error: "Recipient phone number not configured." };
    }
    try {
        await sendWhatsAppMessage(recipient, message);
        return { success: true };
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        return { success: false, error: "Failed to send WhatsApp notification." };
    }
}
