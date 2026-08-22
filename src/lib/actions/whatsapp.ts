import type {
  SendContactMessageWhatsAppEvolutionApiRequest,
  SendListMessageWhatsAppEvolutionApiRequest,
  SendMessageWhatsAppEvolutionApiResponse,
} from "@/appTypes/whatsapp-evolution-api";
import { env } from "@/env";
import { type TemplateMessage } from "./whatsapp/types";

const instanceName = env.NEXT_PUBLIC_EVOLUTION_API_INSTANCE_NAME;
const instanceApiKey = env.NEXT_PUBLIC_EVOLUTION_API_INSTANCE_API_KEY;
const serverUrl = env.NEXT_PUBLIC_EVOLUTION_API_SERVER_URL;

// whatsapp text model
// quebra de linhas: \n (1 linha) \n\n (2 linhas) ...
// negrito: *<your text>*

// `Olá Renata Karolina! Sua inscrição para *Manada Day 2024 - Vale da Onça* está confirmada ✅.\n\n` +
// `Seu ingresso *33444* para *2 adultos* e *4 crianças*.\n\n` +
// `Fique atento a data e local do evento:\n` +
// `📍 *Rua Jorge Fialho, 30 Centro, Dourados MS*\n` +
// `🗓️ *12/12/2024 às 19:30h*\n\n` +
// "Até breve 👊";

export async function sendWhatsAppMessage(number: string, text: string) {
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
        }),
      },
    );

    const data =
      (await response.json()) as SendMessageWhatsAppEvolutionApiResponse;

    if (!response.ok) {
      throw new Error(data ?? "Erro desconhecido");
    }

    return data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
  }
}

export async function sendWhatsAppTemplateMessage(payload: TemplateMessage) {
  try {
    const response = await fetch(
      `${serverUrl}/message/sendTemplate/${instanceName}`,
      {
        method: "POST",
        headers: {
          apikey: instanceApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload,
        }),
      },
    );

    const data =
      (await response.json()) as SendMessageWhatsAppEvolutionApiResponse;

    if (!response.ok) {
      throw new Error(data ?? "Erro desconhecido");
    }

    return data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
  }
}

export async function sendWhatsAppContactMessage(
  payload: SendContactMessageWhatsAppEvolutionApiRequest,
) {
  try {
    const response = await fetch(
      `${serverUrl}/message/sendContact/${instanceName}`,
      {
        method: "POST",
        headers: {
          apikey: instanceApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data =
      (await response.json()) as SendMessageWhatsAppEvolutionApiResponse;

    if (!response.ok) {
      throw new Error(data ?? "Erro desconhecido");
    }

    return data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
  }
}

export async function sendWhatsAppListMessage(
  payload: SendListMessageWhatsAppEvolutionApiRequest,
) {
  try {
    const response = await fetch(
      `${serverUrl}/message/sendList/${instanceName}`,
      {
        method: "POST",
        headers: {
          apikey: instanceApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data =
      (await response.json()) as SendMessageWhatsAppEvolutionApiResponse;

    return data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
  }
}
