import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateLinksSecreto() {
  try {
    const eventoId = "";

    // Atualizar todos os links com tipoInscricao = 'PARTICIPANTE'
    const updatedLinks = await prisma.linkSecreto.updateMany({
      where: {
        eventoId,
      },
      data: {
        tipoInscricao: "PARTICIPANTE",
      },
    });

    console.log(
      `Atualizados links secretos ${updatedLinks.count} com tipoInscricao = 'PARTICIPANTE'`,
    );
  } catch (error) {
    console.error("Erro ao atualizar links secretos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

void updateLinksSecreto();
