import { type AsaasWebhookPayload } from "../types";
import { NextResponse } from "next/server";
import { updateRegisterRefundedMapping } from "./paymentStatusHandlers";

export const handlePaymentRefund = async (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
  eventId: string,
  eventType: string,
) => {
  const handler =
    updateRegisterRefundedMapping[
      eventType as keyof typeof updateRegisterRefundedMapping
    ];

  if (!handler) {
    console.error(
      `Nenhum handler definido para o tipo de evento: ${eventType}`,
    );
    return NextResponse.json(
      { message: `Handler inválido para tipo de evento: ${eventType}` },
      { status: 400 },
    );
  }

  await handler(payment, registerId);

  return NextResponse.json(
    { message: "Payment refund status updated" },
    { status: 200 },
  );
};
