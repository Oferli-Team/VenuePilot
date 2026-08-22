/*
- Adicionar o arquivo csv no formato FAMILIA,CPF em /publice alterar o nome do arquivo no script; line 109
- Alterar o id do evento const eventoId = "66e10d0e49c762488b538143"; line 29
- Executar o script com o comando node ./prisma/updateFamilia.js
 */

import { PrismaClient } from "@prisma/client";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

// Função para validar CPF
const isValidCpf = (value) => {
  // Remove todos os caracteres não numéricos do CPF
  const cleanedCpf = value.replace(/[^\d]/g, "");

  // Verifica se o CPF tem 11 dígitos e não consiste em dígitos iguais
  if (cleanedCpf.length !== 11 || /^(\d)\1+$/.test(cleanedCpf)) {
    return false;
  }

  return true;
};

async function updateFamilia(filePath) {
  const eventoId = "674f0e57050f313c6f26c42e";
  const updates = [];

  fs.createReadStream(filePath)
    .on("error", (err) => {
      console.error("Error reading the file:", err.message);
    })
    .pipe(csv({ separator: "," }))
    .on("data", (row) => {
      const cpf = row.CPF?.trim().replace(/[^\d]/g, "");
      const familia = Number(row.FAMILIA?.trim());

      if (!cpf || !familia) {
        console.log("❌ Linha ignorada - CPF ou FAMILIA ausente", row);
        return;
      }

      if (!isValidCpf(cpf)) {
        console.log("❌ CPF não válido", cpf);
        return;
      }

      updates.push({ cpf, familia });
    })
    .on("end", async () => {
      try {
        let successCount = 0;
        let errorCount = 0;

        for (const update of updates) {
          try {
            // Busca a pessoa pelo CPF e eventoId
            const inscricao = await prisma.inscricao.findFirst({
              where: {
                cpf: update.cpf,
                eventoId: eventoId,
              },
            });

            if (!inscricao) {
              console.log(`❌ Pessoa não encontrada para o CPF: ${update.cpf}`);
              errorCount++;
              continue;
            }

            // Atualiza o campo familia
            await prisma.inscricao.update({
              where: {
                id: inscricao.id,
              },
              data: {
                familia: update.familia,
              },
            });

            console.log(
              `✅ Atualizado com sucesso: ${update.cpf} - Família: ${update.familia}`,
            );
            successCount++;
          } catch (error) {
            console.error(`❌ Erro ao atualizar CPF ${update.cpf}:`, error);
            errorCount++;
          }
        }

        console.log("\nResumo da importação:");
        console.log(`Total de registros: ${updates.length}`);
        console.log(`Atualizações bem-sucedidas: ${successCount}`);
        console.log(`Erros: ${errorCount}`);
      } catch (error) {
        console.error("Erro ao processar as atualizações:", error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

// Caminho absoluto para o arquivo CSV
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, "../public/familia878.csv");

// Executa a atualização
updateFamilia(filePath).catch(console.error);
