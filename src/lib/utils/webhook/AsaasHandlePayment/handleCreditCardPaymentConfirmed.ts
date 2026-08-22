import { api } from "@/trpc/server";
import { type AsaasWebhookPayload } from "../types";
import { NextResponse } from "next/server";
import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";
import { sendNotificationWhenRegisterConfirmedByInngest } from "../../sendNotificationWhenRegisterConfirmedByInngest";
import { FLAGS } from "@/inngest/types";
import { generateCheckInCode } from "../../generateCheckInCode";
import {
  checkIfPaymentAlreadyProcessedMapping,
  updateRegisterMapping,
} from "./paymentStatusHandlers";

export const handleCreditCardPaymentConfirmed = async (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
  eventId: string,
  eventType: string,
) => {
  try {
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

    console.log("Payment already processed", isPaymentAlreadyProcessed);

    if (isPaymentAlreadyProcessed) {
      return NextResponse.json(
        { message: "Payment already processed" },
        { status: 200 },
      );
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
      ENUM_PAYMENT_STATUS.CREDIT_CARD_PAYMENT_COMPLETED,
      generateCheckInCode(),
      payment.installment,
    );

    const shouldSendNotification =
      !register?.flags ||
      !register.flags.includes(FLAGS.EMAIL_MESSAGE) ||
      !register.flags.includes(FLAGS.WHATSAPP_MESSAGE);

    if (shouldSendNotification) {
      const event = await api.evento.getEventById({ id: eventId });
      if (register) {
        await sendNotificationWhenRegisterConfirmedByInngest({
          register,
          event,
        });
      }
    }

    return NextResponse.json(
      { message: "Payment status confirmed updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
};
