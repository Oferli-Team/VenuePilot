import { api } from "@/trpc/server";
import type { AsaasWebhookPayload } from "../types";
import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";

export type Register = {
  id: string;
  nome: string;
  cpf: string;
  spouseName?: string;
  spousePhoneNumber?: string;
  celular: string;
  tipoInscricao: string;
  flags: string[];
  identifier?: string;
  participants?: { name: string; cpf?: string | null; type: string }[];
};

type CheckIfPaymentAlreadyProcessed = (
  chargeId: string,
  registerId: string,
  eventId: string,
) => Promise<boolean>;

type PaymentStatusSubset =
  | ENUM_PAYMENT_STATUS.CHARGE_CREATED
  | ENUM_PAYMENT_STATUS.CHARGE_COMPLETED
  | ENUM_PAYMENT_STATUS.TRANSACTION_REFUND_RECEIVED
  | ENUM_PAYMENT_STATUS.CHARGE_EXPIRED
  | ENUM_PAYMENT_STATUS.CREDIT_CARD_PAYMENT_COMPLETED;

type UpdateRegisterHandler = (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
  status: ENUM_STATUS,
  paymentStatus: PaymentStatusSubset,
  checkinCode?: string,
  paymentChargeId?: string | null,
) => Promise<Register>;

type UpdateRegisterRefundedHandler = (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
) => Promise<void>;

const updateRegisterPaymentStatus = async (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
  status: ENUM_STATUS,
  paymentStatus: PaymentStatusSubset,
  checkinCode?: string,
  paymentChargeId?: string | null,
) => {
  const paymentMethod =
    payment.billingType === "CREDIT_CARD" ? "CARTAO" : "PIX";
  const register = await api.inscricao.updatePaymentStatus({
    inscricaoId: registerId,
    status,
    pagamento_status: paymentStatus,
    pagamento_data: new Date(payment.dateCreated),
    pagamento_integracao_status: payment.status,
    pagamento_integracao_service: "ASAAS",
    metodo_pagamento: paymentMethod,
    checkinCode,
    pagamento_link_url: payment.invoiceUrl,
    ...(payment.billingType === "CREDIT_CARD" && {
      pagamento_charge_id: paymentChargeId,
    }),
  });

  return {
    id: register.id,
    nome: register.nome!,
    cpf: register.cpf!,
    celular: register.celular!,
    tipoInscricao: register.tipoInscricao!,
    spouseName: register.spouseName ?? undefined,
    spousePhoneNumber: register.spousePhoneNumber ?? undefined,
    flags: register.flags,
  };
};

const updateRegisterManadaDayPaymentStatus = async (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
  status: ENUM_STATUS,
  paymentStatus: PaymentStatusSubset,
  checkinCode?: string,
  paymentChargeId?: string | null,
) => {
  const paymentMethod =
    payment.billingType === "CREDIT_CARD" ? "CARTAO" : "PIX";
  const register = await api.manadaDay.updatePaymentStatus({
    id: registerId,
    identifier: checkinCode,
    status,
    paymentStatus,
    paymentChargeId,
    paymentData: new Date(payment.dateCreated),
    paymentIntegrationStatus: payment.status,
    paymentIntegrationService: "ASAAS",
    paymentMethod,
    paymentLinkUrl: payment?.invoiceUrl,
  });

  return {
    id: register.id,
    nome: register.name,
    cpf: register.cpf,
    celular: register.phone,
    participants: register.participants,
    identifier: register.identifier,
    tipoInscricao: "",
  };
};

const checkIfPaymentManadaDayAlreadyProcessed = async (
  chargeId: string,
  registerId: string,
  eventId: string,
) => {
  const paymentAlreadyProcessed =
    await api.manadaDay.getRegisterByUserIdAndChargeId({
      id: registerId,
      eventId,
      charge_id: chargeId,
    });

  if (paymentAlreadyProcessed) return true;

  return false;
};

const checkIfPaymentRegisterAlreadyProcessed = async (
  chargeId: string,
  registerId: string,
  eventId: string,
) => {
  const paymentAlreadyProcessed =
    await api.inscricao.getInscricaoByUserIdAndChargeId({
      id: registerId,
      eventId,
      charge_id: chargeId,
    });

  if (paymentAlreadyProcessed) return true;

  return false;
};

const updateRegisterRefunded = async (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
) => {
  const refund = payment.refunds.flat();

  const refundTotal = refund
    .map((item) => item.value ?? 0)
    .filter((value) => !isNaN(value));

  const totalValueRefunded = refundTotal.reduce((acc, curr) => acc + curr, 0);

  await api.inscricao.updatedPaymentRefunded({
    inscricaoId: registerId,
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
};

const updateManadaDayRegisterRefunded = async (
  payment: AsaasWebhookPayload["payment"],
  registerId: string,
) => {
  await api.manadaDay.updatedPaymentRefunded({
    registerId,
    status: ENUM_STATUS.CANCELADA_PELO_CLIENTE,
    paymentStatus: ENUM_PAYMENT_STATUS.TRANSACTION_REFUND_RECEIVED,
    paymentIntegrationStatus: payment.status,
  });
};

type EventType = "LEGENDARIOS" | "REM" | "MANADADAY";

const updateRegisterMapping: Record<EventType, UpdateRegisterHandler> = {
  ["LEGENDARIOS"]: updateRegisterPaymentStatus,
  ["REM"]: updateRegisterPaymentStatus,
  ["MANADADAY"]: updateRegisterManadaDayPaymentStatus,
};

const updateRegisterRefundedMapping: Record<
  EventType,
  UpdateRegisterRefundedHandler
> = {
  ["LEGENDARIOS"]: updateRegisterRefunded,
  ["REM"]: updateRegisterRefunded,
  ["MANADADAY"]: updateManadaDayRegisterRefunded,
};

const checkIfPaymentAlreadyProcessedMapping: Record<
  EventType,
  CheckIfPaymentAlreadyProcessed
> = {
  ["LEGENDARIOS"]: checkIfPaymentRegisterAlreadyProcessed,
  ["REM"]: checkIfPaymentRegisterAlreadyProcessed,
  ["MANADADAY"]: checkIfPaymentManadaDayAlreadyProcessed,
};

export {
  updateRegisterMapping,
  updateRegisterRefundedMapping,
  checkIfPaymentAlreadyProcessedMapping,
};
