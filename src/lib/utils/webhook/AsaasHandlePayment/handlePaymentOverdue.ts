import { type AsaasWebhookPayload } from "../types";
import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";
import { NextResponse } from "next/server";
import { updateRegisterMapping } from "./paymentStatusHandlers";

export const handlePaymentOverdue = async (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
  eventId: string,
  eventType: string,
) => {
  const handler =
    updateRegisterMapping[eventType as keyof typeof updateRegisterMapping];

  if (!handler) {
    console.error(
      `Nenhum handler definido para o tipo de evento: ${eventType}`,
    );
    return NextResponse.json(
      { message: `Handler inválido para tipo de evento: ${eventType}` },
      { status: 400 },
    );
  }

  await handler(
    payment,
    registerId,
    ENUM_STATUS.CANCELADA_TEMPO_EXPIRADO,
    ENUM_PAYMENT_STATUS.CHARGE_EXPIRED,
  );

  return NextResponse.json({ message: "Charge pix overdue" }, { status: 200 });
};
