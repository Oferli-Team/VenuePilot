import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function updateIMC() {
  // Pegue todos os participantes
  const pessoas = await prisma.pessoa.findMany({
    where: {
      OR: [{ imc: 0 }, { imc: { not: 0 } }],
    },
  });

  function hasTwoDecimalPlaces(num) {
    let updatedNum = num;

    // Verificar se o número é um inteiro
    if (Number.isInteger(num)) {
      updatedNum = num.toFixed(2);
    } else {
      const decimalPart = num.toString().split(".")[1];
      if (decimalPart && decimalPart.length === 1) {
        // Adicionar zero à direita se houver apenas uma casa decimal
        updatedNum = num.toFixed(2);
      }
    }

    const decimalPart = updatedNum.toString().split(".")[1];
    return decimalPart.length === 2;
  }

  // Função para formatar o IMC para até 8 casas decimais
  function formatIMC(num) {
    return parseFloat(num.toFixed(8));
  }

  // Filtre os participantes com IMC exatamente com duas casas decimais ou igual a 0
  const pessoasParaAtualizar = pessoas.filter((pessoa) => {
    return pessoa.imc === 0 || hasTwoDecimalPlaces(pessoa.imc);
  });

  // Atualize cada pessoa com o cálculo do IMC
  for (const pessoa of pessoasParaAtualizar) {
    const { userId, peso, altura } = pessoa;

    if (peso && altura) {
      const newIMC = peso / ((altura / 100) * (altura / 100));
      const formattedIMC = formatIMC(newIMC);

      await prisma.pessoa.update({
        where: { userId: userId },
        data: { imc: formattedIMC },
      });

      console.log(
        `✅ atualizado ${pessoa.nome} | ${pessoa.cpf} - imc: ${formattedIMC}`,
      );
    }
  }
}

updateIMC()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
