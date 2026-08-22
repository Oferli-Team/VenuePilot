"use server";

import {
  type AsaasCustomerList,
  type AsaasCustomerRequest,
  type AsaasCustomerResponse,
  type AsaasPaymentResponse,
  type AsaasPixChargeRequest,
  type ChargeAsaasType,
  type RefundInstallmentAsaasType,
  type RefundPixAsaasType,
  type TransfersAsaasType,
} from "@/appTypes/asaas";
import { env } from "@/env";
import { cleanPhoneForAsaas } from "@/lib/utils/clean-mask";

const headers = {
  "Content-Type": "application/json",
  access_token: "$" + env.ASAAS_API_KEY, // Need to add $ to the key
};

const ENDPOINTS = {
  payments: env.ASAAS_API_URL + "/payments",
  customers: env.ASAAS_API_URL + "/customers",
  installments: env.ASAAS_API_URL + "/installments",
  transfers: env.ASAAS_API_URL + "/transfers",
};

export async function createCustomer(
  customerRequest: AsaasCustomerRequest,
): Promise<AsaasCustomerResponse> {
  try {
    const processedRequest = {
      ...customerRequest,
      phone: customerRequest.phone ? cleanPhoneForAsaas(customerRequest.phone) : undefined,
      mobilePhone: customerRequest.mobilePhone ? cleanPhoneForAsaas(customerRequest.mobilePhone) : undefined,
    };

    const response = await fetch(ENDPOINTS.customers, {
      method: "POST",
      headers,
      body: JSON.stringify(processedRequest),
    });

    return (await response.json()) as AsaasCustomerResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error("Failed to create customer: " + error.message);
    } else {
      console.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }
}

export async function getCustomerByCpf(
  cpf: string,
): Promise<AsaasCustomerResponse | null> {
  if (!cpf) {
    throw new Error("CPF is required");
  }

  try {
    const response = await fetch(`${ENDPOINTS.customers}?cpfCnpj=${cpf}`, {
      method: "GET",
      headers,
    });

    const { data } = (await response.json()) as AsaasCustomerList;

    if (data.length > 0) {
      return data[0]!;
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error("Failed to get customer: " + error.message);
    } else {
      console.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }
}

export async function getTransfer(): Promise<TransfersAsaasType[]> {
  try {
    const response = await fetch(`${ENDPOINTS.transfers}`, {
      method: "GET",
      headers,
    });

    const data = (await response.json()) as {
      data: TransfersAsaasType[];
    };

    if (data.data.length > 0) {
      const transfers = data.data.map((item) => ({
        ...item,
        accountName: item.bankAccount?.accountName,
        ownerName: item.bankAccount?.ownerName,
        cpfCnpj: item.bankAccount?.cpfCnpj,
      }));

      return transfers;
    }

    return [];
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error("Failed to get the transfers: " + error.message);
    } else {
      console.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }
}

export async function createPayment(
  paymentRequest: AsaasPixChargeRequest,
  customerId: string,
): Promise<AsaasPaymentResponse> {
  try {
    const response = await fetch(ENDPOINTS.payments, {
      method: "POST",
      headers,
      body: JSON.stringify({
        customer: customerId,
        ...paymentRequest,
      }),
    });

    return (await response.json()) as AsaasPaymentResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error("Failed to create payment: " + error.message);
    } else {
      console.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }
}

export type AsaasQrCodeResponse = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export async function getPixQrCode(
  paymentId: string,
): Promise<AsaasQrCodeResponse> {
  try {
    const response = await fetch(
      `${ENDPOINTS.payments}/${paymentId}/pixQrCode`,
      {
        method: "GET",
        headers,
      },
    );

    const data = (await response.json()) as {
      encodedImage: string;
      payload: string;
      expirationDate: string;
    };

    console.log(data);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error("Failed to get pix qr code: " + error.message);
    } else {
      console.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }
}

export async function getCustomerChargesAtAsaas(
  customerId: string,
  externalReference: string,
): Promise<ChargeAsaasType[]> {
  try {
    const encodedExternalReference = encodeURIComponent(externalReference);

    const chargesResponse = await fetch(
      `${ENDPOINTS.payments}?customerId=${customerId}&externalReference=${encodedExternalReference}`,
      {
        method: "GET",
        headers,
      },
    );

    const data = (await chargesResponse.json()) as {
      data: ChargeAsaasType[];
    };

    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getCustomerChargesByExternalReferenceAsaas(
  externalReference: string,
): Promise<ChargeAsaasType[]> {
  try {
    const encodedExternalReference = encodeURIComponent(externalReference);

    const chargesResponse = await fetch(
      `${ENDPOINTS.payments}?externalReference=${encodedExternalReference}`,
      {
        method: "GET",
        headers,
      },
    );

    const data = (await chargesResponse.json()) as {
      data: ChargeAsaasType[];
    };

    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function refundInstallment(
  installmentId: string,
  value: number | undefined,
  description: string,
): Promise<RefundInstallmentAsaasType> {
  try {
    const payload: { description: string; value?: number } = { description };
    if (value !== undefined && value > 0) {
      payload.value = value;
    }

    const response = await fetch(
      `${ENDPOINTS.installments}/${installmentId}/refund`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      },
    );

    const responseData: unknown = await response.json();

    return responseData as RefundInstallmentAsaasType;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error("Failed to refund a payment: " + error.message);
    } else {
      console.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }
}

export async function refundPix(
  chargeId: string,
  value: number | undefined,
  description: string,
): Promise<RefundPixAsaasType> {
  try {
    const payload: { description: string; value?: number } = { description };
    if (value !== undefined && value > 0) {
      payload.value = value;
    }

    const response = await fetch(`${ENDPOINTS.payments}/${chargeId}/refund`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const responseData: unknown = await response.json();

    return responseData as RefundPixAsaasType;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error("Failed to refund a payment: " + error.message);
    } else {
      console.error("An unexpected error occurred during PIX refund");
      throw new Error("An unexpected error occurred during PIX refund");
    }
  }
}
