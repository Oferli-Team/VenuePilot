import { type Inscricao } from "@prisma/client";
import { type ColumnDefResolved } from "@tanstack/react-table";
import { VISIBLE_COLUMNS } from "../constants";
import { reorderColumns } from "./reorderColumns";

export const organizeColumns = (
  columns: ColumnDefResolved<Inscricao>[],
  page: keyof typeof VISIBLE_COLUMNS,
) => {
  // Verifica se 'page' é uma chave válida de 'VISIBLE_COLUMNS
  const visibleColumnsPage: keyof typeof VISIBLE_COLUMNS =
    page in VISIBLE_COLUMNS ? page : "inscritos";

  const servir = [
    "lgnd_funcao",
    "dataNascimento",
    "idade",
    "estadoCivil",
    "possuiAutorizacaoServir",
    "tipoInscricao",
    "obs",
    "pagamento_couponValue",
    "pagamento_fee_card",
    "pagamento_top_value",
    "pagamento_discount_value",
  ];

  const participante = [
    "familia",
    "dataNascimento",
    "idade",
    "classificacaoIMC",
    "tipoInscricao",
    "tamanhoFarda",
    "saude",
    "saude_obs",
    "obs",
    "pagamento_status",
    "pagamento_couponValue",
    "pagamento_data",
  ];

  const hakuna = [
    "familia",
    "saude",
    "saude_obs",
    "nome",
    "dataNascimento",
    "idade",
    "peso",
    "altura",
    "imc",
    "classificacaoIMC",
    "biotipo",
    "cpf",
    "nomeContatoEmergencia",
    "celularContatoEmergencia",
    "possuiPlanoSaude",
    "nomePlanoSaude",
    "possuiAlergia",
    "possuiDiabetes",
    "possuiConvulsoes",
    "possuiDesmaios",
    "possuiProblemasCardiacos",
    "possuiDisturbiosAlimentares",
    "possuiProblemasRespiratorios",
    "cuidadosPsiquiatricos",
    "medicacaoDepressao",
    "possuiProblemasMusculoesqueleticos",
    "doencaOuCondicao",
    "medicacoes",
    "outrasInformacoesMedicas",
    "motivosDietaEspecial",
  ];

  const predefinedOrder = [...VISIBLE_COLUMNS[visibleColumnsPage]];
  if (
    visibleColumnsPage === "inscritos" &&
    predefinedOrder.filter((field) => !participante.includes(field))
  ) {
    predefinedOrder.push(...participante);
  }

  if (
    visibleColumnsPage === "lgndServir" &&
    predefinedOrder.filter((field) => !servir.includes(field))
  ) {
    predefinedOrder.push(...servir);
  }

  if (visibleColumnsPage === "hakuna") {
    hakuna.forEach((field) => {
      if (!predefinedOrder.includes(field)) {
        predefinedOrder.push(field);
      }
    });
    predefinedOrder.sort((a, b) => hakuna.indexOf(a) - hakuna.indexOf(b));
  }

  const columnsOrdered = reorderColumns(columns, predefinedOrder).map(
    (col) => col.accessorKey ?? col.id,
  );

  return columnsOrdered;
};
