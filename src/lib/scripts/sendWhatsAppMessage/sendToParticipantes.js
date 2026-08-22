import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const instanceName = process.env.NEXT_PUBLIC_EVOLUTION_API_INSTANCE_NAME;
const instanceApiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_INSTANCE_API_KEY;
const serverUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_SERVER_URL;

export async function sendWhatsAppMessage(number, text) {
  try {
    const response = await fetch(
      `${serverUrl}/message/sendText/${instanceName}`,
      {
        method: "POST",
        headers: {
          apikey: instanceApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number,
          text,
          delay: 2000,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da API:", data);
      throw new Error(data?.message || "Erro desconhecido");
    }

    console.log(`Mensagem enviada para ${number}`);
    console.log(`data `, data);
    return data;
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${number}:`, error);
    throw error;
  }
}

async function sendBatchMessagesByWhatsapp() {
  try {
    const event = await prisma.evento.findUnique({
      where: {
        id: "66ed8d5b5e42ef2837846197",
      },
    });

    const recipients = await prisma.inscricao.findMany({
      where: {
        eventoId: event?.id,
        status: "CONFIRMADA",
        tipoInscricao: "PARTICIPANTE",
      },
    });

    const messages = [];

    if (!recipients.length || !event) {
      console.log("Não há inscrições ou evento não encontrado.");
      return;
    }

    console.log("Iniciando envio de mensagens...");

    for (const recipient of recipients) {
      const welcomeMessage =
        `Olá *${recipient.nome}*, sua inscrição para o *⛰️ TOP ${event.topNumero} - ${event.pista}* está confirmada ✅.\n\n` +
        `*Entre no Grupo para receber mais informações:*\n ${event.linkWhatsappGrupoParticipante}\n\n` +
        "Até breve! 👊 \n\n\n" +
        "_🤖 sou o robo do ITOP, não precisa me responder._";

      const formattedNumber = recipient.celular.startsWith("55")
        ? recipient.celular
        : `55${recipient.celular}`;

      try {
        messages.push(sendWhatsAppMessage(formattedNumber, welcomeMessage));
      } catch (error) {
        console.error(`Erro ao enviar mensagem para ${recipient.celular}`);
      }
    }

    const logs = await Promise.allSettled(messages);
    console.log(JSON.stringify(logs));
    // envio por chunks

    console.log("Envio de mensagens concluído!");
  } catch (error) {
    console.error("Erro geral no envio de mensagens:", error);
  }
}

await sendBatchMessagesByWhatsapp();
