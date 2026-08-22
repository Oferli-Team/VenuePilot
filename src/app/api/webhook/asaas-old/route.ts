import { env } from "@/env";
import { inngest } from "@/inngest/client";
import { EVENTS_NAME } from "@/inngest/events";
import { FLAGS } from "@/inngest/types";
import { CUSTOM_ALPHABET_CHECK_IN_CODE } from "@/lib/constants";
import {
  ENUM_CHECKIN_STATUS,
  ENUM_PAYMENT_STATUS,
  ENUM_STATUS,
} from "@/lib/enum";
import { eventStatusMap } from "@/lib/utils/webhook/constants";
import {
  type AsaasPayment,
  type AsaasRefund,
  type AsaasWebhookPayload,
  type InscricaoStatus,
  type PagamentoStatus,
} from "@/lib/utils/webhook/types";
import { api } from "@/trpc/server";
import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";

type RegisterWithEventReturnPaymentDataUpdated = {
  id: string;
  nome: string;
  celular: string;
  tipoInscricao: string;
  flags: string[];
  evento: {
    id: string;
    topNumero: number;
    pista: string;
    linkWhatsappGrupoParticipante: string | null;
    linkWhatsappGrupoServir: string | null;
    dataInicio: Date;
  } | null;
} | null;

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

function calculateRefundTotal(refunds: AsaasRefund[]): number {
  return refunds
    .map((item) => item.value ?? 0)
    .filter((value): value is number => !isNaN(value))
    .reduce((acc, curr) => acc + curr, 0);
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
      console.log("Payload already exists");
      return NextResponse.json(
        { message: "Payload already exists" },
        { status: 200 },
      );
    }

    const savedPayload = await api.payload.savePayloadAsaas({
      payloadId,
      event,
      payment,
    });

    if (!savedPayload) {
      console.log("Payload not saved");
      return NextResponse.json(
        { message: "Payload not saved" },
        { status: 200 },
      );
    }

    const { inscricaoId, eventoId } = getValueFromExternalReference(payment);

    const checkInCode = customAlphabet(
      CUSTOM_ALPHABET_CHECK_IN_CODE.alphabet,
      CUSTOM_ALPHABET_CHECK_IN_CODE.size,
    );

    // PGTO CARTAO CRIADO
    if (event == "PAYMENT_CREATED") {
      await api.inscricao.updatePaymentStatus({
        inscricaoId: inscricaoId!,
        status: "AGUARDANDO_PAGAMENTO",
        pagamento_status: ENUM_PAYMENT_STATUS.CHARGE_CREATED,
        pagamento_data: new Date(payment.dateCreated),
        pagamento_integracao_status: payment.status,
        pagamento_integracao_service: "ASAAS",
        metodo_pagamento: payment.billingType,
        pagamento_link_url: payment?.invoiceUrl,
      });
    }

    // PIX RECEBIDO
    if (event == "PAYMENT_RECEIVED") {
      const inscricao: RegisterWithEventReturnPaymentDataUpdated =
        await api.inscricao.updatePaymentStatus({
          inscricaoId: inscricaoId!,
          status: "CONFIRMADA",
          checkinCode: checkInCode(),
          checkinStatus: ENUM_CHECKIN_STATUS.WAITING_FOR_DOCUMENTS,
          pagamento_status: ENUM_PAYMENT_STATUS.CHARGE_COMPLETED,
          pagamento_data: new Date(payment.dateCreated),
          pagamento_integracao_status: payment.status,
          pagamento_integracao_service: "ASAAS",
          metodo_pagamento: "PIX",
        });

      await inngest.send({
        name: EVENTS_NAME.NOTIFICATION_USER_REGISTER_CONFIRMED,
        data: {
          inscricao: {
            id: inscricao?.id,
            nome: inscricao?.nome,
            celular: inscricao?.celular,
            tipoInscricao: inscricao?.tipoInscricao,
            flags: inscricao?.flags,
          },
          evento: {
            id: inscricao?.evento?.id,
            topNumero: inscricao?.evento?.topNumero,
            pista: inscricao?.evento?.pista,
            linkWhatsappGrupoParticipante:
              inscricao?.evento?.linkWhatsappGrupoParticipante,
            linkWhatsappGrupoServir: inscricao?.evento?.linkWhatsappGrupoServir,
            dataInicio: inscricao?.evento?.dataInicio,
          },
        },
      });

      return NextResponse.json(
        { message: "Payment Pix received" },
        { status: 200 },
      );
    }

    // PIX EXPIRADO
    if (event == "PAYMENT_OVERDUE") {
      await api.inscricao.updatePaymentStatus({
        inscricaoId: inscricaoId!,
        status: ENUM_STATUS.CANCELADA_TEMPO_EXPIRADO,
        pagamento_status: ENUM_PAYMENT_STATUS.CHARGE_EXPIRED,
        pagamento_data: new Date(payment.dateCreated),
        pagamento_integracao_status: payment.status,
        pagamento_integracao_service: "ASAAS",
        metodo_pagamento: payment.billingType,
      });

      return NextResponse.json(
        { message: "Charge pix overdue" },
        { status: 200 },
      );
    }

    // PGTO CARTAO RECEBIDO
    if (event == "PAYMENT_CONFIRMED") {
      const paymentAlreadyProcessed =
        await api.inscricao.getInscricaoByUserIdAndChargeId({
          id: inscricaoId,
          eventId: eventoId,
          charge_id: payment.installment,
        });

      if (paymentAlreadyProcessed) {
        console.log(
          "Evento já processado:",
          paymentAlreadyProcessed.pagamento_charge_id,
        );
        return NextResponse.json(
          { message: "Evento já processado" },
          { status: 200 },
        );
      }

      const inscricao: RegisterWithEventReturnPaymentDataUpdated =
        await api.inscricao.updatePaymentStatus({
          inscricaoId: inscricaoId!,
          status: ENUM_STATUS.CONFIRMADA,
          checkinCode: checkInCode(),
          checkinStatus: ENUM_CHECKIN_STATUS.WAITING_FOR_DOCUMENTS,
          pagamento_status: ENUM_PAYMENT_STATUS.CREDIT_CARD_PAYMENT_COMPLETED,
          pagamento_charge_id: payment.installment,
          pagamento_data: new Date(payment.dateCreated),
          pagamento_integracao_status: payment.status,
          pagamento_integracao_service: "ASAAS",
          metodo_pagamento: "CARTAO",
        });

      const shouldSendNotification =
        !inscricao?.flags ||
        !inscricao.flags.includes(FLAGS.EMAIL_MESSAGE) ||
        !inscricao.flags.includes(FLAGS.WHATSAPP_MESSAGE);

      if (shouldSendNotification) {
        await inngest.send({
          name: EVENTS_NAME.NOTIFICATION_USER_REGISTER_CONFIRMED,
          data: {
            inscricao: {
              id: inscricao?.id,
              nome: inscricao?.nome,
              celular: inscricao?.celular,
              tipoInscricao: inscricao?.tipoInscricao,
              flags: inscricao?.flags,
            },
            evento: {
              id: inscricao?.evento?.id,
              topNumero: inscricao?.evento?.topNumero,
              pista: inscricao?.evento?.pista,
              linkWhatsappGrupoParticipante:
                inscricao?.evento?.linkWhatsappGrupoParticipante,
              linkWhatsappGrupoServir:
                inscricao?.evento?.linkWhatsappGrupoServir,
              dataInicio: inscricao?.evento?.dataInicio,
            },
          },
        });

        console.log("chamou inggest");
      }

      return NextResponse.json(
        { message: "Payment credit card status updated" },
        { status: 200 },
      );
    }

    // PAGAMENTO CARTAO ESTORNADO
    if (event == "PAYMENT_REFUNDED" || event == "PAYMENT_PARTIALLY_REFUNDED") {
      const refund = payment.refunds.flat();

      const refundTotal = refund
        .map((item) => item.value ?? 0)
        .filter((value) => !isNaN(value));

      const totalValueRefunded = refundTotal.reduce(
        (acc, curr) => acc + curr,
        0,
      );

      await api.inscricao.updatedPaymentRefunded({
        inscricaoId: inscricaoId!,
        status: ENUM_STATUS.CANCELADA_PELO_CLIENTE,
        pagamento_status: ENUM_PAYMENT_STATUS.TRANSACTION_REFUND_RECEIVED,

        reembolso_value: totalValueRefunded,
        reembolso_status: refund[0]?.status ?? null,
        reembolso_receipt: payment.transactionReceiptUrl ?? null,
        reembolso_description: refund[0]?.description ?? null,
        reembolso_created: refund[0]?.dateCreated
          ? new Date(refund[0].dateCreated)
          : null,
      });

      return NextResponse.json(
        { message: "Payment refound status updated" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: `Event ${event} not supported` },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(`Webhook error: ${errorMessage}`, {
      status: 400,
    });
  }
}
