import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { add } from "date-fns";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const isValidCpf = (value) => {
  // Remove todos os caracteres não numéricos do CPF
  const cleanedCpf = value.replace(/[^\d]/g, "");

  // Verifica se o CPF tem 11 dígitos e não consiste em dígitos iguais
  if (cleanedCpf.length !== 11 || /^(\d)\1+$/.test(cleanedCpf)) {
    return false;
  }

  // Verifica os dígitos verificadores
  const cpfDigits = cleanedCpf.split("").map(Number);

  const calcDigit = (digits, factor) => {
    const sum = digits.reduce((acc, digit, index) => {
      const weight = factor - index;
      return acc + digit * weight;
    }, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcDigit(cpfDigits.slice(0, 9), 10);
  const secondDigit = calcDigit(cpfDigits.slice(0, 9).concat(firstDigit), 11);

  return cpfDigits[9] === firstDigit && cpfDigits[10] === secondDigit;
};

// Função para criar  um novo usuário ou buscar um usuário existente com base nos dados fornecidos
async function findOrCreateUser(userData) {
  let user = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: userData.nome,
        email: userData.email,
        emailVerified: new Date(),
        cpf: userData.cpf,
        role: "USER",
      },
    });
  }
  return user;
}

async function importCSV(filePath) {
  const pessoas = [];

  fs.createReadStream(filePath)
    .on("error", (err) => {
      console.error("Error reading the file:", err.message);
    })
    .pipe(csv({ separator: "," }))
    .on("data", (row) => {
      const cpf = row["CPF"].trim();
      const isCPFValid = isValidCpf(cpf);

      if (!isCPFValid) {
        console.log(
          "❌ CPF não válido",
          `${cpf} - ${row["Nome Completo"].trim()}`,
        );
        return;
      }

      const bornDateYYYYMMDD = row["DATA DE NASCIMENTO"];
      const forceMidDay = add(new Date(bornDateYYYYMMDD), { hours: 12 });

      // Extrair apenas as letras iniciais do tamanho da farda
      const tamanhoFardaMatch = row["TAMANHO DA CAMISA"].match(/^[0-9]*[A-Z]+/);
      const tamanhoFarda = tamanhoFardaMatch ? tamanhoFardaMatch[0] : null;

      const peso = parseFloat(row["PESO (APENAS NUMEROS)"]);
      const altura = parseFloat(row["ALTURA (APENAS NÚMERO)"]);
      const imc = peso / ((altura / 100) * (altura / 100));

      pessoas.push({
        tipoInscricao: "PARTICIPANTE",
        status: "CONFIRMADA",
        cpf: row["CPF"].trim(),
        nome: row["Nome Completo"].trim(),
        rg: row["RG"].trim(),
        orgaoExpedidor: row["ÓRGÃO EXPEDITOR"].trim(),
        dataNascimento: forceMidDay,
        estadoCivil: row["ESTADO CIVIL"],
        celular: row["CELULAR"].trim(),
        email: row["EMAIL"].trim(),
        cep: row["CEP"].trim(),
        rua: row["RUA"].trim(),
        ruaNumero: row["NÚMERO"].trim(),
        ruaComplemento: row["COMPLEMENTO"].trim(),
        bairro: row["BAIRRO"].trim(),
        cidade: row["CIDADE"].trim(),
        estado: row["ESTADO"].trim(),
        peso,
        altura,
        imc,
        temFilhos:
          row["TEM FILHOS?"] === "SIM"
            ? true
            : row["TEM FILHOS?"] === "NÃO"
              ? false
              : null,
        qtdFilhos: parseInt(row["SE TIVER FILHOS, QUANTOS?"]) || null,
        nomeContatoEmergencia: row["NOME DO CONTATO DE EMERGÊNCIA"],
        emailContatoEmergencia: row["E-MAIL DO CONTATO DE EMERGÊNCIA"],
        celularContatoEmergencia: row["CELULAR DO CONTATO DE EMERGÊNCIA"],
        tipoVinculoContatoEmergencia: row["VÍNCULO CONTATO DE EMEGÊNCIA"],
        igreja: row["Nome da sua igreja/comunidade?"].trim(),
        igrejaPastor: row["Nome do seu pastor/padre/lider?"].trim(),
        comoConheceuLegendarios: row["Como soube dos Legendários?"],
        possuiPlanoSaude:
          row["Possui Plano de Saúde?"] === "SIM"
            ? true
            : row["Possui Plano de Saúde?"] === "NÃO"
              ? false
              : null,
        nomePlanoSaude: row["Se SIM, qual o nome do plano de saúde?"],
        possuiAlergia:
          row["Alergias?"] === "SIM"
            ? true
            : row["Alergias?"] === "NÃO"
              ? false
              : null,
        possuiDiabetes:
          row["Diabetes?"] === "SIM"
            ? true
            : row["Diabetes?"] === "NÃO"
              ? false
              : null,
        possuiConvulsoes:
          row["Convulsões"] === "SIM"
            ? true
            : row["Convulsões"] === "NÃO"
              ? false
              : null,
        possuiDesmaios:
          row["Episódios de desmaio?"] === "SIM"
            ? true
            : row["Episódios de desmaio?"] === "NÃO"
              ? false
              : null,
        possuiProblemasCardiacos:
          row["Problemas cardíacos?"] === "SIM"
            ? true
            : row["Problemas cardíacos?"] === "NÃO"
              ? false
              : null,
        possuiDisturbiosAlimentares:
          row["Transtornos alimentares ou problemas estomacais?"] === "SIM"
            ? true
            : row["Transtornos alimentares ou problemas estomacais?"] === "NÃO"
              ? false
              : null,
        possuiProblemasRespiratorios:
          row["Problemas respiratórios como asma, enfisema, DPOC?"] === "SIM"
            ? true
            : row["Problemas respiratórios como asma, enfisema, DPOC?"] ===
                "NÃO"
              ? false
              : null,
        cuidadosPsiquiatricos:
          row["Cuidados psiquiátricos?"] === "SIM"
            ? true
            : row["Cuidados psiquiátricos?"] === "NÃO"
              ? false
              : null,
        medicacaoDepressao:
          row[
            "Faz uso de medicamentos para depressão ou problemas de comportamento?"
          ] === "SIM"
            ? true
            : row[
                  "Faz uso de medicamentos para depressão ou problemas de comportamento?"
                ] === "NÃO"
              ? false
              : null,
        possuiProblemasMusculoesqueleticos:
          row[
            "Transtornos músculo-esquelético (artrodese, lesões na coluna, etc)?"
          ] === "SIM"
            ? true
            : row[
                  "Transtornos músculo-esquelético (artrodese, lesões na coluna, etc)?"
                ] === "NÃO"
              ? false
              : null,
        doencaOuCondicao:
          row[
            "Se você respondeu SIM a alguma das perguntas anteriores, explique qual é a doença e/ou condição:"
          ],
        medicacoes:
          row["Faz uso de qualquer medicação atualmente (indique)"].trim(),
        outrasInformacoesMedicas:
          row[
            "Detalhe qualquer outra informação médica importante que a equipe organizadora deva saber durante a sua estadia no evento de LEGENDÁRIOS:"
          ].trim(),
        motivosDietaEspecial:
          row[
            "Por razões médicas requer uma dieta especial? (descreva):"
          ].trim(),
        tamanhoFarda: tamanhoFarda,
        aceitaTermos:
          row["ACEITA TERMOS E CONDIÇÕES"] === "SIM"
            ? true
            : row["ACEITA TERMOS E CONDIÇÕES"] === "NÃO"
              ? false
              : null,
        obs: row[
          "Informe como está a questão do pagamento, já pagou? se sim envie o comprovante, se precisa pagar solicite o link de pagamento para nós"
        ].trim(),
        pagamento_status: "PLANILHA",
        pagamento_topValue: "1390",
      });
    })
    .on("end", async () => {
      try {
        // Criar os usuários com base nos dados do CSV
        for (const pessoa of pessoas) {
          const usuario = await findOrCreateUser({
            nome: pessoa.nome,
            email: pessoa.email,
            cpf: pessoa.cpf,
          });
          // Verificar se a pessoa já existe com o mesmo CPF
          const pessoaExistente = await prisma.pessoa.findUnique({
            where: { cpf: pessoa.cpf },
          });

          if (pessoaExistente) {
            // fazer update dos dados
            const camposParaAtualizar = {};
            for (const campo in pessoa) {
              if (pessoa[campo] !== pessoaExistente[campo]) {
                camposParaAtualizar[campo] = pessoa[campo];
              }
            }
            // Fazer update dos dados
            await prisma.pessoa.update({
              where: { cpf: pessoa.cpf },
              data: {
                ...camposParaAtualizar,
                userId: usuario.id,
              },
            });
            console.log(
              "✅ Atualizado com sucesso",
              `${pessoaExistente.cpf} - ${pessoaExistente.nome}`,
            );
          } else {
            // Adicionar a pessoa associada ao user criado
            await prisma.pessoa.create({
              data: {
                ...pessoa,
                userId: usuario.id,
              },
            });
            console.log(
              "✅ Criado com sucesso",
              `${pessoa.cpf} - ${pessoa.nome}`,
            );
          }
        }
        console.log("Todos os dados importados com sucesso");
      } catch (error) {
        console.error("Erro ao importar os dados:", error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

// Caminho absoluto para o arquivo CSV
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, "../public/form-participantes.csv");

importCSV(filePath);
