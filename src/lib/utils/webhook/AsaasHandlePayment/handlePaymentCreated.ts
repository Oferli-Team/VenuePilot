import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";
import { NextResponse } from "next/server";
import { type AsaasWebhookPayload } from "../types";
import { updateRegisterMapping } from "./paymentStatusHandlers";

export const handlePaymentCreated = async (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
  eventId: string,
  eventType: string,
) => {
  console.log(eventType);
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
    ENUM_STATUS.AGUARDANDO_PAGAMENTO,
    ENUM_PAYMENT_STATUS.CHARGE_CREATED,
    undefined,
  );
  console.log("criou pagamento e atualizou inscricao", { eventType });

  return NextResponse.json(
    { message: "Payment created status updated" },
    { status: 200 },
  );
};
