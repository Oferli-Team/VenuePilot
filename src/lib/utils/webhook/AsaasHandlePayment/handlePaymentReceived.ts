import { FLAGS } from "@/inngest/types";
import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";
import { api } from "@/trpc/server";
import { NextResponse } from "next/server";
import { generateCheckInCode } from "../../generateCheckInCode";
import { sendNotificationWhenRegisterConfirmedByInngest } from "../../sendNotificationWhenRegisterConfirmedByInngest";
import { type AsaasWebhookPayload } from "../types";
import {
  checkIfPaymentAlreadyProcessedMapping,
  updateRegisterMapping,
} from "./paymentStatusHandlers";

export const handlePaymentReceived = async (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
  eventId: string,
  eventType: string,
) => {
  try {
    // Para cartão de crédito, verificar se o pagamento já foi processado (proteção contra duplicação de parcelas)
    if (payment.billingType === "CREDIT_CARD") {
      const checkIfPaymentAlreadyProcessedHandler =
        checkIfPaymentAlreadyProcessedMapping[
          eventType as keyof typeof checkIfPaymentAlreadyProcessedMapping
        ];

      const isPaymentAlreadyProcessed =
        await checkIfPaymentAlreadyProcessedHandler(
          payment.installment!,
          registerId,
          eventId,
        );

      if (isPaymentAlreadyProcessed) {
        return NextResponse.json(
          { message: "Payment already processed" },
          { status: 200 },
        );
      }
    }

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

    const register = await handler(
      payment,
      registerId,
      ENUM_STATUS.CONFIRMADA,
      ENUM_PAYMENT_STATUS.CHARGE_COMPLETED,
      generateCheckInCode(),
      payment.installment,
    );

    const shouldSendNotification =
      !register?.flags ||
      !register.flags.includes(FLAGS.EMAIL_MESSAGE) ||
      !register.flags.includes(FLAGS.WHATSAPP_MESSAGE);

    if (shouldSendNotification) {
      const event = await api.evento.getEventById({ id: eventId });
      if (event && register) {
        await sendNotificationWhenRegisterConfirmedByInngest({
          register,
          event,
        });
      }
    }

    const metodoPagamento =
      payment.billingType === "CREDIT_CARD" ? "CARTAO" : "PIX";

    return NextResponse.json(
      { message: `Payment ${metodoPagamento} received` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
};
