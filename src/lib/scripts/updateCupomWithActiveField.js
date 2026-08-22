import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateCupomWithActiveField() {
  try {
    const eventoId = "";

    // Atualizar todos os cupons com campo ativo = false
    const updatedCupons = await prisma.cupomDesconto.updateMany({
      where: {
        eventoId,
      },
      data: {
        ativo: true,
      },
    });

    console.log(`Atualizados Cupons ${updatedCupons.count} com ativo = false`);
  } catch (error) {
    console.error("Erro ao atualizar cupons:", error);
  } finally {
    await prisma.$disconnect();
  }
}

void updateCupomWithActiveField();
