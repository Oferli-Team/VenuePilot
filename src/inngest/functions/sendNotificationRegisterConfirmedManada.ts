import { sendWhatsAppFailureNotification } from "@/lib/actions/discord-notifications";
import { sendWhatsAppMessage } from "@/lib/actions/whatsapp";
import { inngest } from "../client";
import { EVENTS_NAME } from "../events";
import { type NotificationMessageManadaDay } from "../types";
import { env } from "@/env";
import { MANADA_DAY } from "@/app/manadaday/participar/constant";
import { sendSubscriptionConfirmation } from "@/lib/actions/mail";
import { type ENUM_EVENT_TYPE } from "@/lib/enum";

export const sendNotificationRegisterConfirmedManada = inngest.createFunction(
  { id: "send-notification-manada" },
  { event: EVENTS_NAME.NOTIFICATION_USER_REGISTER_CONFIRMED_MANADADAY },
  async ({ step, event }) => {
    const { inscricao, evento } = event.data as NotificationMessageManadaDay;

    const siteUrl = env.NEXTAUTH_URL;
    const ticketUrl = `${siteUrl}/manadaday/ticket/${inscricao.identifier}`;

    const numberEmojis = [
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣",
      "5️⃣",
      "6️⃣",
      "7️⃣",
      "8️⃣",
      "9️⃣",
      "🔟",
    ];

    const participantsByType = inscricao.participants
      .map((part, index) => {
        const type =
          MANADA_DAY.ticketsType[
            part.type as "ADULT" | "PAID_CHILD" | "FREE_CHILD"
          ];
        const emoji = numberEmojis[index] ?? `${index + 1}º`; // Fallback se passar de 🔟
        return `${emoji} ${part.name} - ${type}`;
      })
      .join("\n");

    const text = `iTOP Inscrições | Confirmação de Inscrição\n\nOlá *${inscricao.nome}* sua compra para ${evento.titulo} está confirmada ✅ \n\n🎟️ Participantes Inscritos\n${participantsByType}\n\n📲 Ticket para Check-in no dia do Evento:\n${ticketUrl}\n\nEsta é uma mensagem automática`;

    const whatsAppResult = await step.run(`send-whatsapp`, async () => {
      try {
        const result = await sendWhatsAppMessage(inscricao.celular, text);
        return { success: result?.status, data: result };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error) || "Erro desconhecido";
        await sendWhatsAppFailureNotification(
          inscricao.id,
          inscricao.nome ?? "",
          inscricao.celular,
          evento.id,
          errorMessage,
        );
        throw error;
      }
    });

    const emailResult = await step.run(`send-whatsapp`, async () => {
      try {
        return await sendSubscriptionConfirmation(
          inscricao.id,
          evento.id,
          evento.type as ENUM_EVENT_TYPE,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error) || "Erro desconhecido";

        throw errorMessage;
      }
    });

    return {
      success: {
        whatsApp: whatsAppResult?.success,
        email: !!emailResult?.data,
      },
      error: {
        whatsApp: whatsAppResult?.error,
        email: emailResult?.error?.message,
      },
    };
  },
);
