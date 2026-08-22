import { env } from "@/env";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { handleSignatureBiometricUnapproved } from "@/lib/utils/webhook/AutentiqueHandle/handleSignatureBiometricUnapproved";
import { handleSignatureBiometricApproved } from "@/lib/utils/webhook/AutentiqueHandle/handleSignatureBiometricApproved";
import { handleSignatureBiometricRejected } from "@/lib/utils/webhook/AutentiqueHandle/handleSignatureBiometricRejected";

async function verifySignature(request: Request): Promise<boolean> {
  if (env.NODE_ENV === "development" && env.AUTENTIQUE_WEBHOOK_SECRET) {
    console.warn(
      "Verificação de assinatura desativada em ambiente de desenvolvimento",
    );
    return true;
  }

  try {
    const webhookSecret = env.AUTENTIQUE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("Segredo do webhook não configurado!");
      return false;
    }

    const signature = request.headers.get("X-Autentique-Signature");
    if (!signature) {
      console.error("Cabeçalho de assinatura ausente");
      return false;
    }

    const clonedRequest = request.clone();
    const rawBody = await clonedRequest.text();

    const hmac = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return false;
  }
}

type EventType =
  | "signature.biometric_unapproved"
  | "signature.biometric_approved"
  | "signature.biometric_rejected";

type SignatureType = {
  public_id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  cpf: string;
  birthday: string;
  action: "Sign";
  viewed: string | null;
  signed: string | null;
  rejected: string | null;
  validation_unapproved: string | null;
  validation_approved: string | null;
  validation_rejected: string | null;
  created_at: string;
};

type DataAutentique = {
  id: string;
  name: string;
  refusable: boolean;
  stop_on_rejected: boolean;
  qualified: boolean;
  ignore_cpf: boolean;
  sortable: boolean;
  is_blocked: boolean;
  sandbox: number;
  scrolling_required: number;
  public_id: string;
  document: string;
  user: {
    name: string;
    email?: string;
    phone: string;
    cpf: string;
    birthday?: string;
  };
  locale: {
    country: string;
    language: string;
    timezone: string;
    date_format: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deadline_at: string | null;
  lifecycle_in: string;
  email_template_id: string | null;
  expiration_at: string | null;
  notify_in: string | null;
  reminder: string | null;
  message: string;
  reply_to: string | null;
  signatures_count: number;
  signed_count: number;
  rejected_count: number;
  object: "document";
  is_from_api: boolean;
  signatures: Array<SignatureType>;
  previous_attributes: {
    name: string;
    refusable: boolean;
    updated_at: string;
    message: string;
    ignore_cpf: boolean;
  };
};

type AutentiqueWebhookPayload = {
  event: {
    id: string;
    object: "event";
    organization: number;
    type: EventType;
    created_at: string;
    data: DataAutentique;
  };
};

export async function POST(request: Request) {
  try {
    const isValid = await verifySignature(request);
    if (!isValid) {
      return NextResponse.json(
        { error: "Assinatura inválida" },
        { status: 401 },
      );
    }

    // Processar o payload
    const payload = (await request.json()) as AutentiqueWebhookPayload;
    const event = payload.event;
    const eventType = event.type;
    const eventData = event.data;

    type PaymentHandler = (documentId: string) => Promise<NextResponse>;

    const eventHandlers: Record<EventType, PaymentHandler> = {
      "signature.biometric_unapproved": handleSignatureBiometricUnapproved,
      "signature.biometric_approved": handleSignatureBiometricApproved,
      "signature.biometric_rejected": handleSignatureBiometricRejected,
    };

    function isSignatureEvent(eventType: string): eventType is EventType {
      return (
        eventType === "signature.biometric_unapproved" ||
        eventType === "signature.biometric_approved" ||
        eventType === "signature.biometric_rejected"
      );
    }

    if (isSignatureEvent(eventType)) {
      const handler = eventHandlers[eventType];
      return await handler(eventData.document);
    }

    return NextResponse.json(
      { message: `Event ${event.type} not supported` },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log({ errorMessage });
    return new Response(`Webhook error: ${errorMessage}`, {
      status: 400,
    });
  }
}
