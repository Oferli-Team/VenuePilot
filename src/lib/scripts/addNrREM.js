import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EVENTO_ID = "686d444d03568ac7ebc49dcc";

async function updateRegisterWithNrREM() {
  try {
    if (!EVENTO_ID || EVENTO_ID === "") {
      console.warn("Informe ID do evento");
      return;
    }

    const result = await prisma.inscricao.findMany({
      where: {
        status: "CONFIRMADA",
        tipoInscricao: "PARTICIPANTE",
        eventoId: EVENTO_ID,
      },
      select: { id: true, nome: true, nrLgnd: true, nrRem: true },
    });

    const registers = result.sort((a, b) => {
      const nrLgndA = Number(a.nrLgnd);
      const nrLgndB = Number(b.nrLgnd);
      return nrLgndA - nrLgndB;
    });

    if (!registers || registers.length === 0) {
      console.warn(`Não há registro`);
      return;
    }

    console.log(`Total de registros encontrados: ${registers.length}`);
    console.log(registers);

    const maxNumbers = 4324 - 4215 + 1; // 110 números disponíveis
    if (registers.length > maxNumbers) {
      console.warn(
        `AVISO: Há ${registers.length} registros, mas apenas ${maxNumbers} números disponíveis (4215-4324)`,
      );
    }

    let currentNumber = 4215;
    let updatedCount = 0;

    for (let i = 0; i < registers.length; i++) {
      const register = registers[i];

      if (!register) {
        console.log("não encontrado registero no index: ", register, i);
        return;
      }

      console.log(
        `Atualizando registro ${i + 1}/${registers.length} - ID: ${register.id}, nrRem atual: ${register.nrRem} -> novo nrRem: ${currentNumber}`,
      );

      await prisma.inscricao.update({
        where: {
          id: register.id,
        },
        data: {
          nrRem: String(currentNumber),
        },
      });

      updatedCount++;
      currentNumber++;
    }

    console.log(`✅ ${updatedCount} inscrições foram atualizadas com sucesso.`);
    console.log(`Números utilizados: 4215 até ${currentNumber - 1}`);
  } catch (error) {
    console.error("❌ Erro ao atualizar inscricoes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateRegisterWithNrREM()
  .then(() => {
    console.log("Script executado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Falha na execução do script:", error);
    process.exit(1);
  });
