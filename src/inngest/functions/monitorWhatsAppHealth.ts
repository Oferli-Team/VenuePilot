import { sendDiscordNotification } from "@/lib/actions/discord-notifications";
import { inngest } from "../client";
import { EVENTS_NAME } from "../events";

interface WhatsAppHealthStatus {
  isHealthy: boolean;
  lastChecked: string;
  error?: string;
  responseTime?: number;
}

interface WhatsAppApiResponse {
  state?: string;
  [key: string]: unknown;
}

const SLOW_RESPONSE_TIME = 10000; // 10 segundos
const REQUEST_TIMEOUT = 15000; // 15 segundos para timeout

const NOTIFICATION_COLORS = {
  DOWN: 16711680,     // Vermelho
  RECOVERED: 65280,   // Verde  
  SLOW: 16753920,     // Laranja
} as const;

const sendWhatsAppHealthAlert = async (
  status: WhatsAppHealthStatus,
  alertType: "DOWN" | "RECOVERED" | "SLOW"
) => {
  const titles = {
    DOWN: "🚨 API WhatsApp FORA DO AR",
    RECOVERED: "✅ API WhatsApp RECUPERADA", 
    SLOW: "⚠️ API WhatsApp LENTA",
  };

  const descriptions = {
    DOWN: "**PROBLEMA DETECTADO** - Novos usuários não receberão confirmação WhatsApp",
    RECOVERED: "**PROBLEMA RESOLVIDO** - API WhatsApp voltou a funcionar normalmente",
    SLOW: "**PERFORMANCE DEGRADADA** - API WhatsApp respondendo lentamente",
  };

  const payload = {
    username: "iTOP Monitor",
    embeds: [
      {
        title: titles[alertType],
        description: descriptions[alertType],
        color: NOTIFICATION_COLORS[alertType],
        fields: [
          {
            name: "🕒 Verificado em",
            value: new Date(status.lastChecked).toLocaleString('pt-BR'),
            inline: true,
          },
          {
            name: "⚡ Tempo de Resposta",
            value: status.responseTime ? `${status.responseTime}ms` : "N/A",
            inline: true,
          },
          ...(status.error ? [{
            name: "❌ Erro",
            value: `\`\`\`${status.error}\`\`\``,
            inline: false,
          }] : []),
          {
            name: "🎯 Impacto",
            value: alertType === "DOWN" 
              ? "❌ Novos usuários NÃO receberão confirmação WhatsApp até resolver"
              : alertType === "SLOW"
              ? "⚠️ Mensagens podem demorar para ser enviadas"
              : "✅ Envios de WhatsApp normalizados - sistema operacional",
            inline: false,
          }
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return await sendDiscordNotification(payload);
};

const checkWhatsAppHealth = async (): Promise<WhatsAppHealthStatus> => {
  const startTime = Date.now();
  
  try {
    const serverUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_SERVER_URL;
    const instanceName = process.env.NEXT_PUBLIC_EVOLUTION_API_INSTANCE_NAME;
    const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_INSTANCE_API_KEY;

    if (!serverUrl || !instanceName || !apiKey) {
      throw new Error("Variáveis de ambiente WhatsApp não configuradas");
    }

    const response = await fetch(
      `${serverUrl}/instance/fetchInstances?instanceName=${instanceName}`,
      {
        method: "GET",
        headers: {
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}: ${response.statusText}`);
    }

    const responseData: unknown = await response.json();
    
    const isInstanceHealthy = responseData && (
      Array.isArray(responseData) 
        ? responseData.length > 0 
        : (responseData as WhatsAppApiResponse).state === 'open'
    );

    if (!isInstanceHealthy) {
      throw new Error("Instância WhatsApp não está conectada ou ativa");
    }

    const isSlow = responseTime > SLOW_RESPONSE_TIME;

    return {
      isHealthy: true,
      lastChecked: new Date().toISOString(),
      responseTime,
      ...(isSlow && { error: "API respondendo lentamente" })
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      isHealthy: false,
      lastChecked: new Date().toISOString(),
      responseTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const monitorWhatsAppHealth = inngest.createFunction(
  { 
    id: "monitor-whatsapp-health", 
    retries: 0, 
  },
  { cron: "0 0 * * *" }, // A cada 24 horas
  async ({ step }) => {
    const currentStatus = await step.run("check-whatsapp-health", async () => {
      return await checkWhatsAppHealth();
    });

    // Alertar apenas sobre problemas para evitar spam
    if (!currentStatus.isHealthy) {
      await step.run("send-health-alert", async () => {
        await sendWhatsAppHealthAlert(currentStatus, "DOWN");
      });
    } else if (currentStatus.responseTime && currentStatus.responseTime > SLOW_RESPONSE_TIME) {
      await step.run("send-slow-alert", async () => {
        await sendWhatsAppHealthAlert(currentStatus, "SLOW");
      });
    }

    return {
      status: currentStatus.isHealthy ? "healthy" : "unhealthy",
      responseTime: currentStatus.responseTime,
      timestamp: currentStatus.lastChecked,
      ...(currentStatus.error && { error: currentStatus.error })
    };
  }
);

export const manualWhatsAppHealthCheck = inngest.createFunction(
  { id: "manual-whatsapp-health-check" },
  { event: EVENTS_NAME.MANUAL_WHATSAPP_HEALTH_CHECK },
  async ({ step }) => {
    const status = await step.run("manual-health-check", async () => {
      return await checkWhatsAppHealth();
    });

    await step.run("send-manual-check-result", async () => {
      const alertType = status.isHealthy 
        ? (status.responseTime && status.responseTime > SLOW_RESPONSE_TIME ? "SLOW" : "RECOVERED")
        : "DOWN";
      
      await sendWhatsAppHealthAlert(status, alertType);
    });

    return status;
  }
);
