"use server";

import { env } from "@/env";

interface DiscordNotificationPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: {
    title: string;
    description: string;
    color: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
  }[];
}

export const sendDiscordNotification = async (
  payload: DiscordNotificationPayload,
): Promise<boolean> => {
  try {
    const webhookUrl = env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_URL não configurado");
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Erro ao enviar notificação Discord:", response.statusText);
      return false;
    }

    console.log("Notificação Discord enviada com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao enviar notificação Discord:", error);
    return false;
  }
};

export const sendWhatsAppFailureNotification = async (
  inscricaoId: string,
  nome: string,
  celular: string,
  topNumero: string,
  error: string,
) => {
  const payload: DiscordNotificationPayload = {
    username: "iTOP Monitor",
    embeds: [
      {
        title: "🚨 Falha no Envio de WhatsApp",
        description: "Erro detectado no envio de mensagem de confirmação",
        color: 16711680, // Vermelho
        fields: [
          {
            name: "📋 Inscrição",
            value: inscricaoId,
            inline: true,
          },
          {
            name: "👤 Nome",
            value: nome,
            inline: true,
          },
          {
            name: "📱 Celular",
            value: celular,
            inline: true,
          },
          {
            name: "🎯 TOP",
            value: `#${topNumero}`,
            inline: true,
          },
          {
            name: "❌ Erro",
            value: `\`\`\`${error}\`\`\``,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return await sendDiscordNotification(payload);
};

export const sendWhatsAppSuccessNotification = async (
  inscricaoId: string,
  nome: string,
  celular: string,
  topNumero: string,
) => {
  const payload: DiscordNotificationPayload = {
    username: "iTOP Monitor",
    embeds: [
      {
        title: "✅ WhatsApp Enviado com Sucesso",
        description: "Mensagem de confirmação enviada com sucesso",
        color: 65280, // Verde
        fields: [
          {
            name: "📋 Inscrição",
            value: inscricaoId,
            inline: true,
          },
          {
            name: "👤 Nome",
            value: nome,
            inline: true,
          },
          {
            name: "📱 Celular",
            value: celular,
            inline: true,
          },
          {
            name: "🎯 TOP",
            value: `#${topNumero}`,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return await sendDiscordNotification(payload);
}; 