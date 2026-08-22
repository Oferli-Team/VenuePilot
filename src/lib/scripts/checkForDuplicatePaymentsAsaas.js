import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const headers = {
  "Content-Type": "application/json",
  access_token: "$" + process.env.ASAAS_API_KEY, // Need to add $ to the key
};

const ENDPOINTS = {
  payments: process.env.ASAAS_API_URL + "/payments",
};

export async function getCustomerChargesByExternalReferenceAsaas(
  externalReference,
) {
  try {
    const encodedExternalReference = encodeURIComponent(externalReference);

    const chargesResponse = await fetch(
      `${ENDPOINTS.payments}?externalReference=${encodedExternalReference}`,
      {
        method: "GET",
        headers,
      },
    );

    const data = await chargesResponse.json();

    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function importCSV(filePath) {
  const duplicados = [];

  try {
    // Leitura do CSV
    const fileData = await new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(filePath)
        .on("error", (err) => reject(err))
        .pipe(csv({ separator: ";" }))
        .on("data", (row) => {
          if (row["identificadorExterno"]) {
            rows.push(row["identificadorExterno"]);
          }
        })
        .on("end", () => resolve(rows));
    });

    console.log(
      `Total de identificadores externos carregados: ${fileData.length}`,
    );

    for (const externalReference of fileData) {
      const chargesByCustomer =
        await getCustomerChargesByExternalReferenceAsaas(externalReference);

      if (!chargesByCustomer || chargesByCustomer.length === 0) {
        console.log(`Nenhuma cobrança encontrada para: ${externalReference}`);
        continue;
      }

      // Verifica duplicidade de installments
      const uniqueInstallments = new Set(
        chargesByCustomer.map((charge) => charge.installment),
      );

      if (uniqueInstallments.size > 1) {
        duplicados.push(externalReference);
        console.log(`Duplicado encontrado para: ${externalReference}`);
      }

      console.log(`Identificador: ${JSON.stringify(externalReference)}`);
      const chargeDetails = chargesByCustomer
        .map(
          (charge) =>
            `Parcela: ${charge.description}, Fatura: ${charge.invoiceUrl}`,
        )
        .join("\n");

      console.log(chargeDetails);
      console.log("---------------------------------------");
    }

    console.log("--- Pagamentos Duplicados ---");
    console.log(
      duplicados.length > 0 ? duplicados : "Nenhum duplicado encontrado.",
    );
  } catch (error) {
    console.error("Erro durante a importação do CSV:", error.message);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, "../public/asaas.csv");

await importCSV(filePath);
