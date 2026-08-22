import { NextResponse } from "next/server";
import {
  sendWhatsAppContactMessage,
  sendWhatsAppMessage,
} from "@/lib/actions/whatsapp";
import type { EvolutionWebhookEventMessagesUpset } from "@/lib/utils/webhook/types";
import { ITOP } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as EvolutionWebhookEventMessagesUpset;

    if (
      body.event === "messages.upsert" &&
      body.data?.messageType === "listResponseMessage"
    ) {
      const { remoteJid } = body.data.key;
      const selectedRowId =
        body.data.message.listResponseMessage.singleSelectReply.selectedRowId;

      const data = JSON.parse(selectedRowId) as {
        groupLink: string;
        row: string;
      };

      const groupLink = data.groupLink;
      const supportNumber = `55${ITOP.whatsapp_suporte}`;

      const number = remoteJid.split("@")[0]!;

      console.log("📞 Cliente:", remoteJid.split("@")[0]);
      console.log("✅ Opção escolhida:", selectedRowId);

      switch (data.row) {
        case "group_001":
          await sendWhatsAppMessage(
            number,
            "Ótimo! Aqui está o link oficial do grupo:\n" + groupLink,
          );
          break;

        case "list_001":
          const list = `https://www.legendariosms.com/mochila`;
          await sendWhatsAppMessage(
            number,
            "*Lista completa do que levar para o TOP*\n\n" +
              "Clique no link para ver todos os detalhes \n" +
              list,
          );
          break;

        case "suport_001":
          await sendWhatsAppContactMessage({
            number,
            contact: [
              {
                phoneNumber: supportNumber,
                wuid: supportNumber,
                fullName: "iTOP Inscrições - Suporte",
                url: ITOP.imageBaseUrl,
              },
            ],
          });
          break;

        case "faq_001":
          const faq = `${ITOP.imageBaseUrl}/perguntas-frequentes`;
          await sendWhatsAppMessage(
            number,
            "*Dúvidas Frequentes*\n\n" +
              "Acesse ao FAQ da plataforma iTOP\n" +
              faq,
          );
          break;
      }
      // Aqui você pode salvar no banco ou processar conforme necessário
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}
