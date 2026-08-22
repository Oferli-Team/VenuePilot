import { inngest } from "@/inngest/client";
import { EVENTS_NAME } from "@/inngest/events";
import { eventStatusMap } from "@/lib/utils/webhook/constants";
import {
  type InscricaoStatus,
  type PagamentoStatus,
  type WooviWebhookPayload,
} from "@/lib/utils/webhook/types";
import { validateWooviHook } from "@/lib/utils/webhook/validators/woovi";
import { api } from "@/trpc/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const headers = request.headers;
    const body = (await request.json()) as WooviWebhookPayload;

    if (body.evento == "teste_webhook") {
      return NextResponse.json({}, { status: 200 });
    }

    const isValid = validateWooviHook(headers, body);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid signature" },
        {
          status: 400,
        },
      );
    }

    const charge = body.charge!;
    const correlationID = body.charge?.correlationID;
    const endToEndId = body.pix?.endToEndId;
    const event = body.event!;

    console.log({ event });

    const savedPayload = await api.payload.savePayload({
      charge,
      company: body.company,
      correlationID: correlationID!,
      endToEndId: endToEndId!,
      event: event,
      pix: body.pix,
      payload: body,
    });

    if (!savedPayload) {
      return NextResponse.json(
        { message: "Payload not saved" },
        { status: 400 },
      );
    }

    const {
      inscricaoId = "",
      eventoId = "",
      topValue = "",
      couponValue = "",
      valueDiscount = "",
      feeCard = "",
    } = Object.fromEntries(
      charge.additionalInfo.map(({ key, value }) => [key, value]),
    );

    const additionalInfo = {
      inscricaoId,
      eventoId,
      topValue,
      couponValue,
      valueDiscount,
      feeCard,
    };

    console.log({ inscricaoId });
    console.log({ eventoId });

    if (event in eventStatusMap) {
      const { status, pagamento_status } =
        eventStatusMap[event as keyof typeof eventStatusMap];

      console.log({ status });
      console.log({ pagamento_status });

      const inscricao = await api.inscricao.updatePaymentStatus({
        inscricaoId: additionalInfo.inscricaoId,
        status: status as InscricaoStatus,
        pagamento_status: pagamento_status as PagamentoStatus,
        pagamento_data: new Date(charge.createdAt),
        pagamento_topValue: topValue,
        pagamento_couponValue: couponValue,
        pagamento_valueDiscount: valueDiscount,
        pagamento_feeCard: feeCard,
        pagamento_integracao_status: charge.status,
        pagamento_integracao_service: "WOOVI",
        metodo_pagamento: "PIX",
      });

      if (event == "OPENPIX:CHARGE_COMPLETED") {
        const evento = await api.evento.getEventById({
          id: eventoId,
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
              id: evento?.id,
              topNumero: evento?.topNumero,
              pista: evento?.pista,
              linkWhatsappGrupoParticipante:
                evento?.linkWhatsappGrupoParticipante,
              linkWhatsappGrupoServir: evento?.linkWhatsappGrupoServir,
            },
          },
        });
      }

      return NextResponse.json(
        { message: "Payment status updated" },
        { status: 200 },
      );
    }

    // Handle unknown events
    return NextResponse.json({ message: "Unknown event" }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(`Webhook error: ${errorMessage}`, {
      status: 400,
    });
  }
}
