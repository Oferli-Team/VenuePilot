import { PrismaClient } from "@prisma/client";

/**
 * @param {number} value
 * @returns {number}
 */
const convertToBasisPoint = (value) => {
  return value * 100;
};

const prisma = new PrismaClient();

const EVENTO_ID = "";
const BATCH_SIZE = 50;

async function updatePaymentFieldsWithConvertedValues() {
  try {
    if (EVENTO_ID === "") {
      console.error(`Informe o id do evento`);
      return;
    }

    const registers = await prisma.inscricao.findMany({
      where: {
        eventoId: EVENTO_ID,
        status: "CONFIRMADA",
      },
      select: {
        id: true,
        pagamento_valueDiscount: true,
        pagamento_feeCard: true,
        pagamento_total_value: true,
        lgndCertificado: true,
        tipoInscricao: true,
        pagamento_top_value: true,
        evento: {
          select: {
            valorParticipante: true,
            valorParaLgndCertificados: true,
            valorParaObterCertificacao: true,
          },
        },
      },
    });

    const registersWithoutTopValueField = registers.filter(
      (reg) => reg.pagamento_top_value === null || !reg.pagamento_top_value,
    );

    console.warn(
      `De ${registers.length} Inscrições Encontradas, ${registersWithoutTopValueField.length} não possuem o campo pagamento_top_value`,
    );

    if (registersWithoutTopValueField.length === 0) {
      console.warn("Não há inscrições para atualizar");
      return;
    }

    const registersToUpdate = registersWithoutTopValueField.map((register) => {
      let pagamento_top_value = 0;

      if (register.tipoInscricao === "PARTICIPANTE") {
        pagamento_top_value = register.evento.valorParticipante;
      } else if (register.tipoInscricao === "SERVIR") {
        if (register.lgndCertificado === true) {
          pagamento_top_value = register.evento.valorParaLgndCertificados;
        } else if (register.lgndCertificado === false) {
          pagamento_top_value = register.evento.valorParaObterCertificacao;
        }
      }

      return {
        ...register,
        pagamento_top_value: convertToBasisPoint(pagamento_top_value),
      };
    });

    let processedCount = 0;

    for (let i = 0; i < registersToUpdate.length; i += BATCH_SIZE) {
      const batch = registersToUpdate.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (register) => {
          const feeCard = Number(register.pagamento_feeCard);
          const discount = Number(register.pagamento_valueDiscount);
          const pagamento_top_value = register.pagamento_top_value;

          try {
            const pagamento_fee_card = convertToBasisPoint(feeCard);
            const pagamento_discount_value = convertToBasisPoint(discount);

            const totalValuePaid =
              pagamento_top_value +
              pagamento_fee_card -
              pagamento_discount_value;

            const pagamento_total_value = totalValuePaid;

            await prisma.inscricao.update({
              where: {
                id: register.id,
              },
              data: {
                pagamento_fee_card,
                pagamento_top_value,
                pagamento_discount_value,
                pagamento_total_value,
              },
            });

            processedCount++;
          } catch (error) {
            console.error(
              `Erro ao processar ${register?.id}: ${error.message}`,
            );
          }
        }),
      );

      console.warn(
        `Processed ${i + BATCH_SIZE} of ${registersToUpdate.length}`,
      );
    }

    console.log(`Processing completed. ${processedCount}.`);
  } catch (error) {
    console.error("Erro na operação: ", error);
  } finally {
    await prisma.$disconnect();
  }
}

void updatePaymentFieldsWithConvertedValues();
