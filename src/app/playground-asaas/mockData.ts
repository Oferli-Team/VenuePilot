import {
  type AsaasCreditCardPaymentRequest,
  type AsaasCustomerRequest,
} from "@/appTypes/asaas";

export const customerInfo = {
  name: "John Doe",
  email: "john.doe@asaas.com.br",
  phone: "4738010919",
  mobilePhone: "4799376637",
  cpfCnpj: "24971563792",
  postalCode: "01310-000",
  address: "Av. Paulista",
  addressNumber: "150",
  complement: "Sala 201",
  province: "Centro",
  externalReference: "12987382",
  notificationDisabled: false,
  additionalEmails: "john.doe@asaas.com,john.doe.silva@asaas.com.br",
  municipalInscription: "46683695908",
  stateInscription: "646681195275",
  observations: "ótimo pagador, nenhum problema até o momento",
} as AsaasCustomerRequest;

export const paymentInfo = {
  billingType: "CREDIT_CARD",
  creditCard: {
    holderName: "john doe",
    number: "4444444444444444", // pagamento aprovado
    // number: "5184019740373151", // pagamento com erros
    expiryMonth: "05",
    expiryYear: "2025",
    ccv: "123",
  },
  creditCardHolderInfo: {
    name: "John Doe",
    email: "john.doe@asaas.com.br",
    cpfCnpj: "24971563792",
    postalCode: "89223-005",
    addressNumber: "277",
    addressComplement: null,
    phone: "4738010919",
    mobilePhone: "47998781877",
  },
  // customer: "cus_000005401844",
  dueDate: "2024-08-30",
  value: 100,
  description: "Pedido 056984",
  externalReference: "056984",
} as AsaasCreditCardPaymentRequest;
