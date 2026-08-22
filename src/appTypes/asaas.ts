export type AsaasCustomerRequest = {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
  addressComplement?: string;
};

export type AsaasCustomerResponse = {
  object: string;
  id: string;
  dateCreated: string;
  name: string;
  email: string;
  company: string | null;
  phone: string;
  mobilePhone: string;
  address: string;
  addressNumber: string;
  complement: string;
  province: string;
  postalCode: string;
  cpfCnpj: string;
  personType: string;
  deleted: boolean;
  additionalEmails: string;
  externalReference: string;
  notificationDisabled: boolean;
  observations: string;
  municipalInscription: string;
  stateInscription: string;
  canDelete: boolean;
  cannotBeDeletedReason: string | null;
  canEdit: boolean;
  cannotEditReason: string | null;
  city: number;
  cityName: string;
  state: string;
  country: string;
  errors: [
    {
      description: string;
    },
  ];
};

export type AsaasCreditCardPaymentRequest = {
  billingType: "CREDIT_CARD";
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: AsaasCustomerRequest;
  // customer: string;
  totalValue?: number;
  installmentCount: number;
  installmentValue?: number;
  dueDate: string;
  value?: number;
  description: string;
  externalReference: string;
};

export type AsaasPixChargeRequest = {
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED";
  totalValue?: number;
  // installmentCount: number;
  // installmentValue?: number;
  dueDate: string;
  value?: number;
  description: string;
  externalReference: string;
};

export type AsaasPaymentResponse = {
  object: string;
  id: string;
  installment: string;
  dateCreated: string;
  customer: string;
  paymentLink: string | null;
  dueDate: string;
  value: number;
  netValue: number;
  billingType: string;
  pixTransaction: string;
  status: string;
  description: string;
  externalReference: string;
  confirmedDate: string;
  originalValue: number | null;
  interestValue: number | null;
  originalDueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  installmentNumber: number | null;
  transactionReceiptUrl: string;
  nossoNumero: string | null;
  invoiceUrl: string;
  bankSlipUrl: string | null;
  invoiceNumber: string;
  deleted: boolean;
  postalService: boolean;
  anticipated: boolean;
  anticipable: boolean;
  creditCard: {
    creditCardNumber: string;
    creditCardBrand: string;
    creditCardToken: string;
  };
  errors: [
    {
      description: string;
    },
  ];
};

export type AsaasCustomerList = {
  object: "list";
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: AsaasCustomerResponse[];
};

export type ChargeAsaasType = {
  id: string;
  customer: string;
  status: string;
  value: number;
  netValue: number;
  description: string;
  dateCreated: string;
  dueDate: string;
  billingType: "PIX" | "CREDIT_CARD";
  installment: string;
  installmentNumber: number;
  invoiceUrl: string;
  invoiceNumber: string;
  externalReference: string;
  discount: {
    value: number;
    limitDate?: string;
    dueDateLimitDays: number;
    type: "FIXED";
  };
};

type RefundItem = {
  dateCreated: string;
  description: string | null;
  paymentId: string;
  status: string;
  transactionReceiptUrl: string | null;
  value: number;
};

export type RefundInstallmentAsaasType = {
  object: "installment";
  transactionReceiptUrl: string;
  refunds: RefundItem[][];
  errors: [
    {
      description: string;
    },
  ];
};

export type RefundPixAsaasType = ChargeAsaasType & {
  refundDate?: string;
};

export type TransfersParamsAsaas = {
  dateCreatedGe?: string; // Data de criação inicial (>=)
  dateCreatedLe?: string; // Data de criação final (<=)
  transferDateGe?: string; // Data de efetivação inicial (>=)
  transferDateLe?: string; // Data de efetivação final (<=)
  type?: "BANK_ACCOUNT";
};

export type TransfersAsaasType = {
  object: "transfer";
  id: string;
  value: number;
  netValue: number;
  transferFee: number;
  dateCreated: string;
  status: "DONE" | "PENDING" | "CANCELLED";
  effectiveDate: string | null;
  confirmedDate: string | null;
  endToEndIdentifier: string | null;
  transactionReceiptUrl: string | null;
  operationType: "PIX" | "TED";
  failReason: string | null;
  walletId: string | null;
  description: string | null;
  canBeCancelled: boolean;
  externalReference: string | null;
  authorized: boolean;
  scheduleDate: string | null;
  type: "BANK_ACCOUNT";
  bankAccount: {
    bank: {
      code: string;
      name: string;
      ispb: string;
    };
    accountName: string | null;
    ownerName: string;
    cpfCnpj: string;
    type: "CHECKING_ACCOUNT";
    agency: string;
    agencyDigit: string | null;
    account: string;
    accountDigit: string;
    pixAddressKey: string | null;
  } | null;
  recurring: boolean | null;
};
