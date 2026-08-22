import type {
  AsaasCreditCardPaymentRequest,
  AsaasCustomerRequest,
  AsaasPixChargeRequest,
} from "@/appTypes/asaas";
import { get48HoursLater } from "@/lib/utils/get48HoursLater";
import { addDays, format } from "date-fns";

type EventInfo = {
  id: string;
  title: string;
  type: string;
  topNumber: number;
};

type PaymentAmounts = {
  eventValue: number;
  installment: number;
  valuePerInstallment: number;
  discount: number;
  fee: number;
  totalValue: number;
};

type CardInfo = {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
};

export const buildPaymentRequest = ({
  eventInfo,
  registerId,
  cpf,
  paymentAmounts,
  cardInfo,
  customerInfo,
  registerType,
}: {
  eventInfo: EventInfo;
  cpf: string;
  registerId: string;
  paymentAmounts: PaymentAmounts;
  cardInfo: CardInfo;
  customerInfo: AsaasCustomerRequest;
  registerType: "PARTICIPANTE" | "SERVIR";
}): AsaasCreditCardPaymentRequest => {
  const dueDate = format(addDays(new Date(), 3), "yyyy-MM-dd");
  const label = registerType === "PARTICIPANTE" ? "PARTICIPAR" : "SERVIR";

  console.log("buildPaymentRequest", paymentAmounts);
  return {
    billingType: "CREDIT_CARD",
    totalValue: paymentAmounts.totalValue,
    dueDate,
    installmentCount: paymentAmounts.installment,
    creditCard: cardInfo,
    creditCardHolderInfo: {
      ...customerInfo,
      notificationDisabled: true,
    },
    description: `${label} - EVENTO ${eventInfo.type}#${eventInfo.topNumber} - ${cpf}`,
    externalReference: JSON.stringify({
      inscricaoId: registerId,
      eventoId: eventInfo.id,
    }),
  };
};

export const buildPixChargeRequest = ({
  eventInfo,
  registerId,
  cpf,
  paymentAmounts,
  registerType,
}: {
  eventInfo: EventInfo;
  registerId: string;
  cpf: string;
  paymentAmounts: Pick<
    PaymentAmounts,
    "eventValue" | "totalValue" | "discount" | "fee"
  >;
  registerType: "PARTICIPANTE" | "SERVIR";
}): AsaasPixChargeRequest => {
  const dueDate = get48HoursLater();
  const label = registerType === "PARTICIPANTE" ? "PARTICIPAR" : "SERVIR";

  return {
    billingType: "PIX",
    value: paymentAmounts.totalValue,
    description: `${label} - EVENTO ${eventInfo.type}#${eventInfo.topNumber} - ${cpf}`,
    dueDate,
    externalReference: JSON.stringify({
      inscricaoId: registerId,
      eventoId: eventInfo.id,
    }),
  };
};
