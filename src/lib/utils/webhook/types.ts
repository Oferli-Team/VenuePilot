import { z } from "zod";

export const WooviWebhookPayloadSchema = z.object({
  correlationID: z.string().nullable(),
  event: z.string().nullable(),
  charge: z
    .object({
      customer: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        taxID: z.object({
          taxID: z.string(),
          type: z.string(),
        }),
        correlationID: z.string(),
      }),
      value: z.number(),
      comment: z.string(),
      identifier: z.string(),
      correlationID: z.string(),
      paymentLinkID: z.string(),
      transactionID: z.string(),
      status: z.string(),
      additionalInfo: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        }),
      ),
      fee: z.number(),
      discount: z.number(),
      valueWithDiscount: z.number(),
      expiresDate: z.string(),
      type: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      brCode: z.string(),
      expiresIn: z.number(),
      pixKey: z.string(),
      paymentLinkUrl: z.string(),
      qrCodeImage: z.string(),
      globalID: z.string(),
      paymentMethods: z.object({
        pix: z.object({
          method: z.string(),
          transactionID: z.string(),
          identifier: z.string(),
          additionalInfo: z.array(
            z.object({
              key: z.string(),
              value: z.string(),
            }),
          ),
          fee: z.number(),
          value: z.number(),
          status: z.string(),
          txId: z.string(),
          brCode: z.string(),
          qrCodeImage: z.string(),
        }),
      }),
    })
    .nullable(),
  pix: z
    .object({
      customer: z.object({
        name: z.string(),
        email: z.string(),
        taxID: z.object({
          taxID: z.string(),
          type: z.string(),
        }),
        correlationID: z.string(),
        phone: z.string(),
      }),
      charge: z.object({
        customer: z.object({
          name: z.string(),
          email: z.string(),
          taxID: z.object({
            taxID: z.string(),
            type: z.string(),
          }),
          correlationID: z.string(),
          phone: z.string(),
        }),
        value: z.number(),
        comment: z.string(),
        identifier: z.string(),
        correlationID: z.string(),
        transactionID: z.string(),
        status: z.string(),
        additionalInfo: z.array(
          z.object({
            key: z.string(),
            value: z.string(),
          }),
        ),
        fee: z.number(),
        discount: z.number(),
        valueWithDiscount: z.number(),
        expiresDate: z.string(),
        type: z.string(),
        paymentLinkID: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        paidAt: z.string().optional(),
        payer: z.object({
          name: z.string(),
          email: z.string(),
          taxID: z.object({
            taxID: z.string(),
            type: z.string(),
          }),
          correlationID: z.string(),
          phone: z.string(),
        }),
        brCode: z.string(),
        expiresIn: z.number(),
        pixKey: z.string(),
        paymentLinkUrl: z.string(),
        qrCodeImage: z.string(),
        globalID: z.string(),
      }),
      value: z.number(),
      time: z.string(),
      endToEndId: z.string(),
      type: z.string(),
      createdAt: z.string(),
      pixKey: z.string(),
      partial: z.boolean(),
      globalID: z.string(),
    })
    .nullable(),
  company: z.object({}).nullable(),
  account: z.object({}).nullable(),
  evento: z.string().nullable(), // atributo para evento teste_webhook
});

export type WooviWebhookPayload = z.infer<typeof WooviWebhookPayloadSchema>;

export const AsaasRefund = z.object({
  value: z.number().nullable(),
  description: z.string().nullable(),
  status: z.enum(["PENDING", "DONE"]).nullable(),
  transactionReceiptUrl: z.string().nullable(),
  paymentId: z.string(),
  dateCreated: z.string(),
});

export type AsaasRefund = z.infer<typeof AsaasRefund>;

export const AsaasWebhookPayloadSchema = z.object({
  id: z.string(),
  event: z.string(),
  dateCreated: z.string(),
  payment: z.object({
    object: z.string(),
    id: z.string(),
    dateCreated: z.string(),
    customer: z.string(),
    installment: z.string().nullable(),
    paymentLink: z.string().nullable(),
    value: z.number(),
    netValue: z.number(),
    originalValue: z.number().nullable(),
    interestValue: z.number().nullable(),
    description: z.string(),
    billingType: z.string(),
    confirmedDate: z.string(),
    creditCard: z.object({
      creditCardNumber: z.string(),
      creditCardBrand: z.string(),
    }),
    pixTransaction: z.any().nullable(),
    status: z.string(),
    dueDate: z.string(),
    originalDueDate: z.string(),
    paymentDate: z.string().nullable(),
    clientPaymentDate: z.string(),
    installmentNumber: z.number(),
    invoiceUrl: z.string(),
    invoiceNumber: z.string(),
    externalReference: z.string(),
    deleted: z.boolean(),
    anticipated: z.boolean(),
    anticipable: z.boolean(),
    creditDate: z.string(),
    estimatedCreditDate: z.string(),
    transactionReceiptUrl: z.string(),
    nossoNumero: z.string().nullable(),
    bankSlipUrl: z.string().nullable(),
    lastInvoiceViewedDate: z.string().nullable(),
    lastBankSlipViewedDate: z.string().nullable(),
    discount: z.object({
      value: z.number(),
      limitDate: z.string().nullable(),
      dueDateLimitDays: z.number(),
      type: z.string(),
    }),
    fine: z.object({
      value: z.number(),
      type: z.string(),
    }),
    interest: z.object({
      value: z.number(),
      type: z.string(),
    }),
    postalService: z.boolean(),
    custody: z.any().nullable(),
    refunds: z.array(z.array(AsaasRefund)),
  }),
});

export const AsaasPaymentSchema = z.object({
  object: z.string(),
  id: z.string(),
  dateCreated: z.string(),
  customer: z.string(),
  installment: z.string().nullable(),
  paymentLink: z.string().nullable(),
  value: z.number(),
  netValue: z.number(),
  originalValue: z.number().nullable(),
  interestValue: z.number().nullable(),
  description: z.string(),
  billingType: z.string(),
  confirmedDate: z.string(),
  creditCard: z.object({
    creditCardNumber: z.string(),
    creditCardBrand: z.string(),
  }),
  pixTransaction: z.any().nullable(),
  status: z.string(),
  dueDate: z.string(),
  originalDueDate: z.string(),
  paymentDate: z.string().nullable(),
  clientPaymentDate: z.string(),
  installmentNumber: z.number(),
  invoiceUrl: z.string(),
  invoiceNumber: z.string(),
  externalReference: z.string(),
  deleted: z.boolean(),
  anticipated: z.boolean(),
  anticipable: z.boolean(),
  creditDate: z.string(),
  estimatedCreditDate: z.string(),
  transactionReceiptUrl: z.string(),
  nossoNumero: z.string().nullable(),
  bankSlipUrl: z.string().nullable(),
  lastInvoiceViewedDate: z.string().nullable(),
  lastBankSlipViewedDate: z.string().nullable(),
  discount: z.object({
    value: z.number(),
    limitDate: z.string().nullable(),
    dueDateLimitDays: z.number(),
    type: z.string(),
  }),
  fine: z.object({
    value: z.number(),
    type: z.string(),
  }),
  interest: z.object({
    value: z.number(),
    type: z.string(),
  }),
  postalService: z.boolean(),
  custody: z.any().nullable(),
  refunds: z.any().nullable(),
});

export type AsaasPayment = z.infer<typeof AsaasPaymentSchema>;

export type AsaasWebhookPayload = z.infer<typeof AsaasWebhookPayloadSchema>;

export type InscricaoStatus =
  | "AGUARDANDO_PAGAMENTO"
  | "CONFIRMADA"
  | "CANCELADA_PELO_CLIENTE"
  | "CANCELADA_TEMPO_EXPIRADO";

export type PagamentoStatus =
  | "CHARGE_CREATED"
  | "CHARGE_COMPLETED"
  | "TRANSACTION_REFUND_RECEIVED"
  | "CHARGE_EXPIRED"
  | "CREDIT_CARD_PAYMENT_COMPLETED";

export type EvolutionWebhookEventMessagesUpset = {
  event: "messages.upsert";
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName: string;
    status: string;
    message: {
      messageContextInfo: {
        deviceListMetadata: {
          senderKeyHash: string;
          senderTimestamp: string;
          recipientKeyHash: string;
          recipientTimestamp: string;
        };
        deviceListMetadataVersion: number;
        messageSecret: string;
      };
      listResponseMessage: {
        title: string;
        listType: "SINGLE_SELECT";
        singleSelectReply: {
          selectedRowId: string;
        };
        contextInfo: {
          stanzaId: string;
          participant: string;
          quotedMessage: {
            listMessage: {
              title: string;
              description: string;
              buttonText: string;
              listType: "SINGLE_SELECT";
              sections: {
                title: string;
                rows: {
                  title: string;
                  description: string;
                  rowId: string;
                }[];
              }[];
              footerText: string;
            };
          };
        };
        description: string;
      };
    };
    contextInfo: {
      stanzaId: string;
      participant: string;
      quotedMessage: {
        listMessage: {
          title: string;
          description: string;
          buttonText: string;
          listType: "SINGLE_SELECT";
          sections: {
            title: string;
            rows: {
              title: string;
              description: string;
              rowId: string;
            }[];
          }[];
          footerText: string;
        };
      };
    };
    messageType: "listResponseMessage";
    messageTimestamp: number;
    instanceId: string;
    source: string;
  };
  destination: string;
  date_time: string;
  sender: string;
  server_url: string;
  apikey: string;
};

export type EventAutentiqueSignature =
  | "signature.accepted"
  | "signature.updated"
  | "signature.viewed"
  | "signature.biometric_approved"
  | "signature.biometric_unapproved";

export type EventAutentiqueDocument = "document.created" | "document.updated";

export type SignatureAutentique = {
  public_id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  cpf: string;
  birthday: string;
  action: "Sign";
  viewed: string | null;
  signed: string | null;
  rejected: string | null;
  validation_unapproved: string | null;
  validation_approved: string | null;
  validation_rejected: string | null;
  created_at: string;
};

export type DataAutentique = {
  object: {
    id: string;
    name: string;
    refusable: boolean;
    stop_on_rejected: boolean;
    qualified: boolean;
    ignore_cpf: boolean;
    sortable: boolean;
    is_blocked: boolean;
    sandbox: number;
    scrolling_required: number;
    locale: {
      country: string;
      language: string;
      timezone: string;
      date_format: string;
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    deadline_at: string | null;
    lifecycle_in: string;
    email_template_id: string | null;
    expiration_at: string | null;
    notify_in: string | null;
    reminder: string | null;
    message: string;
    reply_to: string | null;
    signatures_count: number;
    signed_count: number;
    rejected_count: number;
    object: "document";
    is_from_api: boolean;
    signatures: Array<SignatureType>;
    author: {
      name: string;
      company: string | null;
      email: string;
      phone: string | null;
      cpf: string;
      birthday: string;
    };
    files: {
      original: string;
      signed: string;
    };
  };
  previous_attributes: {
    name: string;
    refusable: boolean;
    updated_at: string;
    message: string;
    ignore_cpf: boolean;
  };
};
