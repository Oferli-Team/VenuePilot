import { env } from "@/env";
import { handleCreditCardPaymentConfirmed } from "@/lib/utils/webhook/AsaasHandlePayment/handleCreditCardPaymentConfirmed";
import { handlePaymentCreated } from "@/lib/utils/webhook/AsaasHandlePayment/handlePaymentCreated";
import { handlePaymentOverdue } from "@/lib/utils/webhook/AsaasHandlePayment/handlePaymentOverdue";
import { handlePaymentReceived } from "@/lib/utils/webhook/AsaasHandlePayment/handlePaymentReceived";
import { handlePaymentRefund } from "@/lib/utils/webhook/AsaasHandlePayment/handlePaymentRefund";
import {
  type AsaasPayment,
  type AsaasWebhookPayload,
} from "@/lib/utils/webhook/types";
import { api } from "@/trpc/server";
import { NextResponse } from "next/server";

function getValueFromExternalReference(payment: AsaasPayment): {
  inscricaoId: string | null;
  eventoId: string | null;
} {
  try {
    const parsed = JSON.parse(payment.externalReference || "{}") as {
      inscricaoId?: string;
      eventoId?: string;
    };
    return {
      inscricaoId: parsed.inscricaoId ?? null,
      eventoId: parsed.eventoId ?? null,
    };
  } catch (error) {
    console.error("Error parsing externalReference:", error);
    return { inscricaoId: null, eventoId: null };
  }
}

export async function POST(request: Request) {
  try {
    const headers = request.headers;
    const body = (await request.json()) as AsaasWebhookPayload;
    const accessToken = headers.get("asaas-access-token");
    const expectedAccessToken = env.ASAAS_WEBHOOK_ACCESS_TOKEN;

    if (accessToken !== expectedAccessToken) {
      console.log(
        `Invalid access token. Received: ${accessToken?.slice(0, 4)}...${accessToken?.slice(-4)}, Expected: ${expectedAccessToken?.slice(0, 4)}...${expectedAccessToken?.slice(-4)}`,
      );
      return NextResponse.json(
        {
          message: `Invalid access token. Received: ${accessToken?.slice(0, 4)}...${accessToken?.slice(-4)}, Expected: ${expectedAccessToken?.slice(0, 4)}...${expectedAccessToken?.slice(-4)}`,
        },
        { status: 401 },
      );
    }

    const { id: payloadId, event, payment } = body;

    console.log({ event });

    const payload = await api.payload.getPayloadAsaas({
      payloadId,
      event,
    });

    if (payload) {
      return NextResponse.json(
        { message: "Payload already exists" },
        { status: 200 },
      );
    }

    const { inscricaoId, eventoId } = getValueFromExternalReference(payment);

    const savedPayload = await api.payload.savePayloadAsaas({
      payloadId,
      event,
      payment,
      inscricaoId: inscricaoId ?? undefined,
      eventoId: eventoId ?? undefined,
    });

    if (!savedPayload) {
      return NextResponse.json(
        { message: "Payload not saved" },
        { status: 200 },
      );
    }

    type PaymentAsaasEvent =
      | "PAYMENT_CREATED"
      | "PAYMENT_RECEIVED"
      | "PAYMENT_OVERDUE"
      | "PAYMENT_CONFIRMED"
      | "PAYMENT_REFUNDED"
      | "PAYMENT_PARTIALLY_REFUNDED";

    type PaymentHandler = (
      payment: AsaasWebhookPayload["payment"],
      registerId: string,
      eventId: string,
      eventType: string,
    ) => Promise<NextResponse>;

    const eventItop = await api.evento.getEventById({ id: eventoId! });

    console.log(eventItop?.type);

    const eventHandlers: Record<PaymentAsaasEvent, PaymentHandler> = {
      PAYMENT_CREATED: handlePaymentCreated,
      PAYMENT_RECEIVED: handlePaymentReceived,
      PAYMENT_OVERDUE: handlePaymentOverdue,
      PAYMENT_CONFIRMED: handleCreditCardPaymentConfirmed,
      PAYMENT_REFUNDED: handlePaymentRefund,
      PAYMENT_PARTIALLY_REFUNDED: handlePaymentRefund,
    };

    function isPaymentAsaasEvent(event: string): event is PaymentAsaasEvent {
      return (
        event === "PAYMENT_CREATED" ||
        event === "PAYMENT_RECEIVED" ||
        event === "PAYMENT_OVERDUE" ||
        event === "PAYMENT_CONFIRMED" ||
        event === "PAYMENT_REFUNDED" ||
        event === "PAYMENT_PARTIALLY_REFUNDED"
      );
    }

    if (isPaymentAsaasEvent(event)) {
      const handler = eventHandlers[event];
      return await handler(payment, inscricaoId!, eventoId!, eventItop?.type);
    }

    return NextResponse.json(
      { message: `Event ${event} not supported` },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(`Webhook error: ${errorMessage}`, {
      status: 400,
    });
  }
}
