export enum Collection {
  WOOVI = "WooviPayload",
  ASAAS = "AsaasPayload",
  PESSOA = "Pessoa",
  INSCRICAO = "Inscricao",
}

export enum Message {
  PAYLOAD_ALREADY_EXISTS = "Payload already exists",
  INVALID_SIGNATURE = "Invalid signature",
  FAILED_TO_SAVE_PAYLOAD = "Failed to save payload",
}

export const eventStatusMap = {
  "OPENPIX:CHARGE_CREATED": {
    status: "AGUARDANDO_PAGAMENTO",
    pagamento_status: "CHARGE_CREATED",
  },
  "OPENPIX:CHARGE_COMPLETED": {
    status: "CONFIRMADA",
    pagamento_status: "CHARGE_COMPLETED",
  },
  "OPENPIX:TRANSACTION_REFUND_RECEIVED": {
    status: "CANCELADA_PELO_CLIENTE",
    pagamento_status: "TRANSACTION_REFUND_RECEIVED",
  },
  "OPENPIX:CHARGE_EXPIRED": {
    status: "CANCELADA_TEMPO_EXPIRADO",
    pagamento_status: "CHARGE_EXPIRED",
  },
  PAYMENT_CONFIRMED: {
    status: "CONFIRMADA",
    pagamento_status: "CREDIT_CARD_PAYMENT_COMPLETED",
  },
  PAYMENT_REFUNDED: {
    status: "CANCELADA_PELO_CLIENTE",
    pagamento_status: "TRANSACTION_REFUND_RECEIVED",
  },
  PAYMENT_PARTIALLY_REFUNDED: {
    status: "CANCELADA_PELO_CLIENTE",
    pagamento_status: "TRANSACTION_REFUND_RECEIVED",
  },
};
