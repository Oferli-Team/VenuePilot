"use server";

import { type ChargeAsaasType } from "@/appTypes/asaas";
import { env } from "@/env";

const headersAsaas = {
  "Content-Type": "application/json",
  access_token: "$" + env.ASAAS_API_KEY, // Need to add $ to the key
};

const headersWoovi = {
  "Content-Type": "application/json",
  Authorization: env.WOOVI_API_KEY,
};

export async function fetchAllCustomersWoovi() {
  let allCustomers = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const apiUrl = `${env.WOOVI_API_URL}/api/v1/customer?skip=${skip}&limit=${limit}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: headersWoovi,
    });
    const data = await response.json();

    allCustomers = allCustomers.concat(data.customers);

    if (!data.pageInfo.hasNextPage) break;
    skip += limit;
  }

  return allCustomers;
}

export async function getCustomerChargesAtAsaas(
  inscricaoId: string,
  eventoId: string,
) {
  try {
    const chargesResponse = await fetch(
      `${env.ASAAS_API_URL}/payments?externalReference={"inscricaoId":"${inscricaoId}","eventoId":"${eventoId}"}`,

      {
        headers: headersAsaas,
      },
    );

    const data = (await chargesResponse.json()) as {
      data: ChargeAsaasType[];
    };

    return data.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getCustomerChargesAtWoovi(
  inscricaoId: string,
  eventoId: string,
  correlationID: string,
) {
  try {
    if (correlationID) {
      const apiUrl = `${env.WOOVI_API_URL}/api/v1/charge?customer=${correlationID}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headersWoovi,
      });

      const data = await response.json();

      if (data?.charges) {
        if (data.charges.length === 0) {
          return [];
        }

        return data.charges;
      }
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}
