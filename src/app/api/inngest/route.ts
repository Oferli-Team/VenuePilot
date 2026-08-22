import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  createBoardingPlanLegendary,
  createBoardingPlanParticipants,
  sendEmailRegisterConfirmed,
  sendWhatsAppRegisterConfirmed,
  sendNotificationRegisterConfirmedManada,
  createDisclaimerByUser,
  createBatchDisclaimer,
  queueDisclaimerBatches,
  monitorWhatsAppHealth,
  manualWhatsAppHealthCheck,
  sendWhatsAppHealthMessage,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendEmailRegisterConfirmed,
    sendWhatsAppRegisterConfirmed,
    sendWhatsAppHealthMessage,
    sendNotificationRegisterConfirmedManada,
    createBoardingPlanLegendary,
    createBoardingPlanParticipants,
    createDisclaimerByUser,
    createBatchDisclaimer,
    queueDisclaimerBatches,
    monitorWhatsAppHealth,
    manualWhatsAppHealthCheck,
  ],
});
