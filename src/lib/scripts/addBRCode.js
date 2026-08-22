import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BATCH_SIZE = 50;

function normalizePhoneNumber(phone) {
  if (!phone) return null;

  if (phone.startsWith("55")) {
    return phone;
  }

  return `55${phone}`;
}

async function addBRCodeInPhoneFields() {
  try {
    const registers = await prisma.inscricao.findMany({
      where: {
        tipoInscricao: "PARTICIPANTE",
      },
      select: {
        id: true,
        celular: true,
        celularContatoCartas: true,
        celularContatoEmergencia: true,
      },
    });

    if (registers.length === 0) {
      console.log("Nenhuma inscrição precisa ser atualizada.");
      return;
    }

    const batches = [];
    for (let i = 0; i < registers.length; i += BATCH_SIZE) {
      const batch = registers.slice(i, i + BATCH_SIZE).map((register) => {
        const normalizedCelular = normalizePhoneNumber(register.celular);
        const normalizedEmergencia = normalizePhoneNumber(
          register.celularContatoEmergencia,
        );
        const normalizedCartas = normalizePhoneNumber(
          register.celularContatoCartas,
        );

        if (
          normalizedCelular === register.celular &&
          normalizedEmergencia === register.celularContatoEmergencia &&
          normalizedCartas === register.celularContatoCartas
        ) {
          return null;
        }

        return prisma.inscricao.update({
          where: { id: register.id },
          data: {
            celular: normalizedCelular,
            celularContatoEmergencia: normalizedEmergencia,
            celularContatoCartas: normalizedCartas,
          },
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

void addBRCodeInPhoneFields();
