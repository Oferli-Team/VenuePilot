import { type Inscricao } from "@prisma/client";
import { type ColumnDefResolved } from "@tanstack/react-table";

export const formatedColumnsToCSVTable = (
  columns: ColumnDefResolved<Inscricao>[],
  predefinedOrder: string[],
) => {
  const additionalColumnsFiltered = columns
    .filter(
      (column) =>
        column.id !== "select" &&
        column.id !== "actions" &&
        column.accessorKey !== "createdAt",
    )
    .filter((column) => {
      return predefinedOrder.includes(column.accessorKey ?? "");
    });

  const allAccessorKeys = additionalColumnsFiltered
    .filter((item) => item.accessorKey)
    .map((item) => item.accessorKey);

  const getFormattedLabel = (accessorKey: string): string => {
    const formattedLabel = accessorKey.toUpperCase();

    // Ajustes específicos para os rótulos
    const labelAdjustments = {
      INDEX: "NR",
      LGND_FUNCAO: "LGND FUNÇÃO",
      SAUDE_OBS: "OBS DE SAÚDE",
      NRLGND: "NR LEGENDARIO",
      LGNDCERTIFICADO: "LGND CERTIFICADO",
      TIPOINSCRICAO: "TIPO INSCRIÇÃO",
      DATANASCIMENTO: "NASCIMENTO",
      CLASSIFICACAOIMC: "CLASSIFICAÇÃO IMC",
      POSSUIAUTORIZACAOSERVIR: "AUTORIZADO PARA SERVIR?",
      IGREJAPASTOR: "PASTOR",
      ESTADOCIVIL: "ESTADO CIVIL",
      TEMFILHOS: "FILHOS",
      QTDFILHOS: "QTD FILHOS",
      TAMANHOFARDA: "FARDA",
      RUANUMERO: "NUMERO",
      RUACOMPLEMENTO: "COMPLEMENTO",
      COMOCONHECEULEGENDARIOS: "COMO CONHECEU LEGENDÁRIOS",
      QUEMCONVIDOU: "CONVIDADO POR",
      NOMECONTATOEMERGENCIA: "NOME EMERGÊNCIA",
      EMAILCONTATOEMERGENCIA: "E-MAIL EMERGÊNCIA",
      CELULARCONTATOEMERGENCIA: "CELULAR EMERGÊNCIA",
      TIPOVINCULOCONTATOEMERGENCIA: "VINCULO EMERGÊNCIA",
      POSSUIPLANOSAUDE: "PLANO DE SAÚDE?",
      NOMEPLANOSAUDE: "NOME DO PLANO DE SAÚDE",
      POSSUIALERGIA: "ALERGIA?",
      POSSUIDIABETES: "DIABETES?",
      POSSUICONVULSOES: "CONVULSÕES?",
      POSSUIDESMAIOS: "DESMAIOS?",
      POSSUIPROBLEMASCARDIACOS: "PROBLEMAS CARDÍACOS?",
      POSSUIDISTURBIOSALIMENTARES: "DISTÚRBIOS ALIMENTARES?",
      POSSUIPROBLEMASRESPIRATORIOS: "PROBLEMAS RESPIRATÓRIOS?",
      CUIDADOSPSIQUIATRICOS: "CUIDADOS PSIQUIÁTRICOS?",
      MEDICACAODEPRESSAO: "MEDICAÇÃO PARA DEPRESSÃO?",
      POSSUIPROBLEMASMUSCULOESQUELETICOS: "PROBLEMAS MÚSCULO ESQUELÉTICOS?",
      DOENCAOUCONDICAO: "DETALHE DOENÇA OU CONDIÇÃO",
      MEDICACOES: "USO DE MEDICAÇÕES",
      OUTRASINFORMACOESMEDICAS: "DETALHE OUTRAS INFORMAÇÕES MÉDICAS",
      MOTIVOSDIETAESPECIAL: "MOTIVO DIETA ESPECIAL",
      ACEITATERMOS: "ACEITA TERMOS?",
      PAGAMENTO_STATUS: "STATUS PAGAMENTO",
      PAGAMENTO_DATA: "DATA PAGAMENTO",
      PAGAMENTO_TOPVALUE: "VALOR DO TOP",
      PAGAMENTO_FEECARD: "TAXA CARTÃO",
      PAGAMENTO_COUPONVALUE: "CUPOM DE DESCONTO",
      PAGAMENTO_VALUEDISCOUNT: "VALOR DESCONTO",
      CHECKIN: "CHECK-IN",
      CHECK_OBS: "OBS DE CHECK-IN",
      CARTAS_RECEBIDA: "CARTAS RECEBIDA?",
      CARTAS_CONTATO_VALIDO: "CONTATO VÁLIDO?",
      CARTAS_OBS: "OBS DE CARTAS",
    };

    return labelAdjustments[formattedLabel] || formattedLabel;
  };

  const orderedColumns = allAccessorKeys
    .map((accessorKey) => {
      if (!accessorKey) return null;

      const formattedLabel = getFormattedLabel(accessorKey);

      const columnObj = {
        label: formattedLabel,
        key: accessorKey,
      };

      return columnObj;
    })
    .filter(Boolean);

  return orderedColumns;
};
