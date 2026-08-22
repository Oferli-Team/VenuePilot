import { format, parseISO, subDays } from "date-fns";
import { inngest } from "../client";
import { EVENTS_NAME } from "../events";
import { ITOP } from "@/lib/constants";
import { ptBR } from "date-fns/locale";
import { sendWhatsAppMessage } from "@/lib/actions/whatsapp";
import { sendWhatsAppFailureNotification } from "@/lib/actions/discord-notifications";

export const sendWhatsAppHealthMessage = inngest.createFunction(
  { id: "send-whatsapp-health-message" },
  { event: EVENTS_NAME.NOTIFICATION_USER_HEALTH_MESSAGE },
  async ({ step, event }) => {
    const { name, phone, topNumber, registerId, eventStartDate } =
      event.data as {
        phone: string;
        name: string;
        topNumber: string;
        eventStartDate: string;
        registerId: string;
      };

    const formattedNumber = phone.startsWith("55") ? phone : `55${phone}`;

    const DAYS_TO_SUBTRACT = 5;
    const startDateObj = parseISO(eventStartDate);
    const submissionDate = subDays(startDateObj, DAYS_TO_SUBTRACT);

    const formattedSubmissionDate = format(
      submissionDate,
      "dd 'de' MMMM 'de' yyyy",
      { locale: ptBR },
    );

    const message =
      `_${ITOP.short_name} - ${ITOP.name}_ \n\n` +
      `Olá! Precisamos falar com *${name.toUpperCase()}*, participante do *TOP ${topNumber}*. ` +
      `Para sua segurança e uma melhor experiência no *TOP*, é *obrigatória* a apresentação do ` +
      `*LAUDO MÉDICO LIBERANDO PARA ATIVIDADE FÍSICA*.\n\n` +
      `📌 *Prazo para envio: ${formattedSubmissionDate}.*\n\n` +
      `O senhor deverá consultar um médico de sua escolha e solicitar o laudo de aptidão física. ` +
      `Com o laudo em mãos, basta:\n\n` +
      `1️⃣ *Tirar uma foto ou escanear o documento.*\n` +
      `2️⃣ *Enviar para o número +55 67 99694-5300.*\n` +
      `3️⃣ No envio, *incluir seu NOME COMPLETO e número do TOP* no formato:\n` +
      `   ✍️ Exemplo: *OSNI SAMPATI - TOP ${topNumber}*\n` +
      `     Em seguida, anexar a foto ou o arquivo do laudo.\n\n` +
      `⚠️ *Importante:*\n` +
      `- Não envie mensagens como "bom dia" ou "boa noite"; esse número é exclusivo para o recebimento dos documentos.\n` +
      `- Caso haja alguma observação sobre seu laudo, entraremos em contato.\n` +
      `- *O teste ergométrico (esteira ou esforço) não é obrigatório, mas recomendado.*\n` +
      `-  A equipe médica poderá solicitá-lo posteriormente, se necessário.\n\n` +
      `📢 *Participe do Grupo do TOP para mais informações!*`;

    await step.sleep("waiting 2 minutes", "2min");
    const result = await step.run("send-health-whatsapp-message", async () => {
      try {
        const result = await sendWhatsAppMessage(formattedNumber, message);
        return { success: true, data: result };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error) || "Erro desconhecido";
        await sendWhatsAppFailureNotification(
          registerId,
          name,
          formattedNumber,
          topNumber,
          `Falha no envio da mensagem de laudo médico: ${errorMessage}`,
        );

        return { success: false, data: error };
      }
    });

    return {
      data: result.data,
      success: result.success,
    };
  },
);
