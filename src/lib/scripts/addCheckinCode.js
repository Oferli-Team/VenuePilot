import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const BATCH_SIZE = 50;

async function updateRegisterWithCheckInCode() {
  try {
    const registers = await prisma.inscricao.findMany({
      where: {
        status: "CONFIRMADA",
      },
      select: { id: true, checkinCode: true },
    });

    const registersToUpdate = registers.filter(
      (reg) => reg.checkinCode === null || !reg.checkinCode,
    );

    console.log("Total Registers", registers.length);
    console.log("Registers to update", registersToUpdate);

    if (registersToUpdate.length === 0) {
      console.log("Nenhuma inscrição precisa ser atualizada.");
      return;
    }

    console.log(
      `Encontradas ${registersToUpdate.length} inscrições para atualização.`,
    );

    const batches = [];
    for (let i = 0; i < registersToUpdate.length; i += BATCH_SIZE) {
      const batch = registersToUpdate
        .slice(i, i + BATCH_SIZE)
        .map((register) => {
          const checkInCode = customAlphabet(
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            6,
          )();

          return prisma.inscricao.update({
            where: { id: register.id },
            data: { checkinCode: checkInCode },
          });
        });

      batches.push(batch);
    }

    for (const batch of batches) {
      await Promise.all(batch);
      console.log(`Atualizado lote de ${batch.length} inscrições.`);
    }

    console.log(`Todas as inscrições foram atualizadas com sucesso.`);
  } catch (error) {
    console.error("Erro ao atualizar inscricoes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

void updateRegisterWithCheckInCode();
