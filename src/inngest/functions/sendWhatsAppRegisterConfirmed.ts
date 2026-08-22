import { sendWhatsAppFailureNotification } from "@/lib/actions/discord-notifications";
import { sendWhatsAppListMessage } from "@/lib/actions/whatsapp";
import { api } from "@/trpc/server";
import { inngest } from "../client";
import { EVENTS_NAME } from "../events";
import { FLAGS, type NotificationsMessageType } from "../types";
import { ITOP } from "@/lib/constants";
import { env } from "@/env";
import { ENUM_EVENT_TYPE, ENUM_REGISTER_TYPE } from "@/lib/enum";

function buildWhatsAppDescription(
  eventType: ENUM_EVENT_TYPE,
  register: { nome: string; spouseName?: string },
  event: {
    title: string;
    topNumero: string;
    whatsGroup: string;
    ticketUrl: string;
  },
): string {
  const content = `➡️ Entre no GRUPO exclusivo do evento\n ${event.whatsGroup} \n\n ➡️ Na página do Evento você pode conferir o que precisa levar.\n 🔗 Acesse: ${ITOP.site}/evento/${event.topNumero} \n\n 📲 Acesse seu Ticket, e leve impresso ou no celular para o dia do Check-in\n ${event.ticketUrl} \n`;

  switch (eventType) {
    case ENUM_EVENT_TYPE.REM:
      return `Olá! A inscrição do casal *${register.nome.toLocaleUpperCase()}* e *${register.spouseName?.toLocaleUpperCase()}* para o _${event.title}_ está confirmada ✅!\n\n ${content}`;
    case ENUM_EVENT_TYPE.LEGENDARIOS:
      return `Olá *${register.nome}*! Sua inscrição para o _TOP#${event.topNumero}_ está confirmada ✅!\n\n ${content}`;
    // outros casos
    default:
      return `Sua inscrição está confirmada!`;
  }
}

function buildWhatsAppList(options: { groupLink: string }) {
  return [
    {
      title: "Informações do Evento",
      rows: [
        {
          title: "Entrar no Grupo do TOP",
          description: "GRUPO exclusivo do evento",
          rowId: JSON.stringify({
            groupLink: options.groupLink,
            row: "group_001",
          }),
        },
      ],
    },
    {
      title: "Suporte",
      rows: [
        {
          title: "Falar com Atendimento sobre minha inscrição",
          rowId: JSON.stringify({ row: "suport_001" }),
        },
        {
          title: "Dúvidas Frequentes",
          description: "Consultar lista de perguntas e respostas",
          rowId: JSON.stringify({ row: "faq_001" }),
        },
      ],
    },
  ];
}

export const sendWhatsAppRegisterConfirmed = inngest.createFunction(
  { id: "send-whatsapp-message" },
  { event: EVENTS_NAME.NOTIFICATION_USER_REGISTER_CONFIRMED },
  async ({ step, event }) => {
    const { inscricao, evento } = event.data as NotificationsMessageType;

    if (inscricao?.flags?.includes(FLAGS.WHATSAPP_MESSAGE)) {
      return {
        message: "User already notified by whatsApp",
      };
    }

    const whatsGroup =
      inscricao.tipoInscricao === "PARTICIPANTE"
        ? evento.linkWhatsappGrupoParticipante
        : evento.linkWhatsappGrupoServir;

    const siteUrl = env.NEXTAUTH_URL;
    const ticketUrl = `${siteUrl}/ticket/${evento.id}/${inscricao.cpf}`;

    const LIST_SECTIONS_WHATSAPP = buildWhatsAppList({ groupLink: whatsGroup });

    function getWhatsAppRecipients(eventType: ENUM_EVENT_TYPE) {
      const formattedNumberLegendary = inscricao.celular.startsWith("55")
        ? inscricao.celular
        : `55${inscricao.celular}`;

      const formattedNumberSpouse = inscricao.spousePhoneNumber?.startsWith(
        "55",
      )
        ? inscricao.spousePhoneNumber
        : `55${inscricao.spousePhoneNumber ?? ""}`;

      if (eventType === ENUM_EVENT_TYPE.REM) {
        return [
          {
            name: inscricao.nome,
            phone: formattedNumberLegendary,
          },
          {
            name: inscricao.spouseName,
            phone: formattedNumberSpouse,
          },
        ].filter((r) => !!r.phone);
      } else {
        return [
          {
            name: inscricao.nome,
            phone: formattedNumberLegendary,
          },
        ];
      }
    }

    const recipients = getWhatsAppRecipients(evento.type as ENUM_EVENT_TYPE);

    const results = [];
    for (const recipient of recipients) {
      const description = buildWhatsAppDescription(
        evento.type as ENUM_EVENT_TYPE,
        { nome: inscricao.nome, spouseName: inscricao.spouseName },
        {
          title: evento.titulo!,
          topNumero: evento.topNumero,
          whatsGroup,
          ticketUrl,
        },
      );

      try {
        const result = await step.run(
          `send-message-to-${recipient.name?.replaceAll(" ", "-")}`,
          async () => {
            try {
              const result = await sendWhatsAppListMessage({
                number: recipient.phone,
                title: "iTOP Inscrições | Confirmação de Inscrição",
                description,
                buttonText: "Clique para ver as opções",
                footerText: "Plataforma de Inscrições iTOP",
                sections: LIST_SECTIONS_WHATSAPP,
              });
              return { success: result?.status, data: result };
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : String(error) || "Erro desconhecido";
              await sendWhatsAppFailureNotification(
                inscricao.id,
                recipient.name ?? "",
                recipient.phone,
                evento.topNumero,
                errorMessage,
              );
              throw error;
            }
          },
        );
        results.push({
          recipient: recipient.name,
          phone: recipient.phone,
          ...result,
        });

        if (result.success) {
          await api.inscricao.updateInscricaoWithFlag({
            id: inscricao.id,
            flag: FLAGS.WHATSAPP_MESSAGE,
          });
        }
      } catch (error) {
        results.push({
          recipient: recipient.name,
          phone: recipient.phone,
          error: error instanceof Error ? error.message : String(error),
        });
        await sendWhatsAppFailureNotification(
          inscricao.id,
          recipient.name ?? "",
          recipient.phone,
          evento.topNumero,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    if (
      inscricao.tipoInscricao === ENUM_REGISTER_TYPE.PARTICIPANTE &&
      (evento.type as ENUM_EVENT_TYPE) === ENUM_EVENT_TYPE.LEGENDARIOS
    ) {
      await step.run("calling-health-message-event", async () => {
        await inngest.send({
          name: EVENTS_NAME.NOTIFICATION_USER_HEALTH_MESSAGE,
          data: {
            name: inscricao.nome,
            phone: inscricao.celular,
            topNumber: evento.topNumero,
            registerId: inscricao.id,
            eventStartDate: evento.dataInicio,
          },
        });
      });
    }

    return {
      success: true,
      eventType: evento.type,
      results,
    };
  },
);
