import type { Vehicle, Inscricao } from "@prisma/client";
import { formatDateToDDMMYYYY } from "./formatDateToDDMMYYYY";
import { calculateAge } from "./calculateAge";
import { classifyIMC } from "./classifyIMC";
import { mask } from "remask";
import {
  MASK_PATTERN,
  paymentStatusOptions,
  statusOptions,
} from "../constants";
import { ENUM_VEHICLE_TYPE } from "../enum";

const booleanFields = [
  "checkin",
  "aceitaTermos",
  "ativo",
  "cuidadosPsiquiatricos",
  "possuiAlergia",
  "medicacaoDepressao",
  "possuiConvulsoes",
  "possuiDesmaios",
  "possuiDiabetes",
  "possuiDisturbiosAlimentares",
  "possuiPlanoSaude",
  "possuiProblemasCardiacos",
  "possuiProblemasMusculoesqueleticos",
  "possuiProblemasRespiratorios",
  "temFilhos",
  "lgndCertificado",
  "possuiAutorizacaoServir",
  "cartas_recebida",
  "cartas_contato_valido",
  // REM
  "hasHealthIssues",
  "isPregnant",
];

const allowedKeys = [
  ...booleanFields,
  "lgnd_funcao",
  "status",
  "familia",
  "saude",
  "saude_obs",
  "nome",
  "cpf",
  "celular",
  "dataNascimento",
  "estadoCivil",
  "idade",
  "peso",
  "altura",
  "imc",
  "classificacaoIMC",
  "biotipo",
  "igreja",
  "igrejaPastor",
  "cep",
  "estado",
  "cidade",
  "rua",
  "ruaNumero",
  "bairro",
  "ruaComplemento",
  "nomeContatoCartas",
  "celularContatoCartas",
  "nomeContatoEmergencia",
  "celularContatoEmergencia",
  "tipoVinculoContatoEmergencia",
  "doencaOuCondicao",
  "medicacoes",
  "outrasInformacoesMedicas",
  "motivosDietaEspecial",
  "comoConheceuLegendarios",
  "email",
  "qtdFilhos",
  "quemConvidou",
  "nrLgnd",
  "tipoInscricao",
  "obs",
  "pagamento_status",
  "pagamento_couponValue",
  "pagamento_data",
  "pagamento_top_value",
  "pagamento_discount_value",
  "pagamento_fee_card",
  "metodo_pagamento",
  "totalPaid",
  "check_obs",
  "cartas_obs",
  "linkSecreto",
  //REM
  "spouseName",
  "spousePhoneNumber",
  "spouseEmail",
  "spouseCPF",
  "spouseBirthDate",
  "womanTshirtSize",
  "manTshirtSize",
  "healthIssuesDescription",
  "nrRem",
  "spouseAge",
];

const formatBooleanField = (value: boolean | null): string =>
  value ? "Sim" : "Não";

const removeExtraSpaces = (value: string) => {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
};

type VehicleType = {
  vehicle: Pick<Vehicle, "name" | "identifier" | "type">;
};

type formattedDataToCSVTableType = Inscricao & {
  totalPaid: number;
  spouseAge: string;
} & VehicleType;

export const formatedDataToCSVTable = (data: formattedDataToCSVTableType[]) => {
  return data.map((item, i) => {
    const filteredItem = Object.keys(item)
      .filter((key) => allowedKeys.includes(key))
      .reduce(
        (obj, key) => {
          const typedKey = key as keyof Inscricao;
          const value = item[typedKey] ?? "-";

          const formattedValue = booleanFields.includes(key)
            ? formatBooleanField(typeof value === "boolean" ? value : null)
            : removeExtraSpaces(String(value));

          obj[typedKey] = formattedValue;
          return obj;
        },
        {} as Partial<Record<keyof Inscricao, string>>,
      );

    const { classification } = classifyIMC(item.imc!);

    const nome = item.nome?.toUpperCase() ?? "-";
    const nomeContatoEmergencia = item.nomeContatoEmergencia
      ? item.nomeContatoEmergencia.toUpperCase()
      : "-";
    const imc = String(item.imc).replace(".", ",");
    const dataNascimento =
      item.dataNascimento && formatDateToDDMMYYYY(item.dataNascimento);
    const spouseBirthDate =
      item.spouseBirthDate && formatDateToDDMMYYYY(item.spouseBirthDate);
    const idade = dataNascimento && calculateAge(dataNascimento);
    const spouseAge = spouseBirthDate && calculateAge(spouseBirthDate);
    const dataPagamento =
      item.pagamento_data && formatDateToDDMMYYYY(item.pagamento_data);
    const checkin = formatBooleanField(item.checkin);
    const biotipo = item.biotipo;

    const status = statusOptions.find(
      (opt) => opt.value === item.status,
    )?.label;
    const pagamento_status = paymentStatusOptions.find(
      (opt) => opt.value === item.pagamento_status,
    )?.label;

    const vehicle = item.vehicle;
    const VehicleType =
      vehicle && vehicle.type === ENUM_VEHICLE_TYPE.BUS ? "Ônibus" : "Carro";

    const vehicleId = vehicle
      ? `${VehicleType} - ${vehicle.name} | ${vehicle.identifier}`
      : "-";

    return {
      ...filteredItem,
      index: i + 1,
      spouseAge,
      createdAt: item.createdAt && formatDateToDDMMYYYY(item.createdAt),
      nome,
      lgndCertificado:
        item.lgndCertificado !== null
          ? formatBooleanField(item.lgndCertificado)
          : "-",
      nomeContatoEmergencia,
      cpf: item.cpf && mask(item.cpf, MASK_PATTERN.cpf),
      email: item.email,
      status,
      dataNascimento,
      spouseBirthDate,
      idade,
      classificacaoIMC: classification,
      imc,
      biotipo,
      tamanhoFarda: item.tamanhoFarda,
      nomePlanoSaude: item.nomePlanoSaude,
      motivosDietaEspecial: item.motivosDietaEspecial,
      pagamento_data: dataPagamento,
      checkin,
      cartas_contato_valido:
        item.cartas_contato_valido == null
          ? "Não verificado"
          : formatBooleanField(item.cartas_contato_valido),
      cartas_recebida:
        item.cartas_recebida === null
          ? "Não verificado"
          : formatBooleanField(item.cartas_recebida),
      vehicleId,
      pagamento_status,
      metodo_pagamento:
        item.metodo_pagamento === "CUPOM_GRATUITO"
          ? "CUPOM"
          : item.metodo_pagamento,
      pagamento_couponValue:
        item.pagamento_couponValue === "none"
          ? "-"
          : item.pagamento_couponValue,
      totalPaid: item.totalPaid,
      spouseCPF: item.spouseCPF && mask(item.spouseCPF, MASK_PATTERN.cpf),
    };
  });
};
