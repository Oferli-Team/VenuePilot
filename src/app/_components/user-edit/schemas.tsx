import {
    createZodValidationJustNumbers,
    createZodValidationRadioField,
    createZodValidationToNumbersAndSymbolsFields,
    createZodValidationToStringRequired,
    validateDateOfBirth,
    validatePhoneNumber,
} from "@/app/zod-validation/validation";
import { vinculoOptions } from "@/lib/constants";
import type { Inscricao } from "@prisma/client";
import { z } from "zod";
import { type AllFieldsProps } from "../inscricao-detail/allFields";

export type DataSectionProps = {
  user: Inscricao;
  fields: AllFieldsProps[];
  title?: string;
};

export type FormDataPersonal = z.infer<typeof personalSchema>;
export type FormDataLegendary = z.infer<typeof legendarySchema>;
export type FormDataSpouse = z.infer<typeof spouseSchema>;
export type FormDataAddress = z.infer<typeof addressSchema>;
export type FormDataEmergency = z.infer<typeof emergencySchema>;
export type FormDataContactLetters = z.infer<typeof contactLettersSchema>;
export type FormDataReligion = z.infer<typeof religionSchema>;
export type FormDataHealth = z.infer<typeof healthSchema>;
export type FormDataOtherMedicineInfo = z.infer<
  typeof othersMedicineInfoSchema
>;
export type FormDataPayment = z.infer<typeof paymentSchema>;
export type FormDataRefund = z.infer<typeof refundSchema>;

const phoneValidate = () => {
  return z
    .string()
    .optional()
    .refine((value) => value && validatePhoneNumber(value), {
      message: "Preencha celular corretamente",
    });
};

const birthDateValidate = () =>
  createZodValidationToStringRequired().refine(validateDateOfBirth, {
    message: "Preencha uma data válida",
  });

const emailValidate = () => z.string().email().optional();

export const personalSchema = z.object({
  createdAt: z.string().optional(),
  status: z.string().optional(),
  tipoInscricao: z.string().optional(),
  celular: phoneValidate(),
  email: emailValidate(),
  cpf: createZodValidationToNumbersAndSymbolsFields(),
  nome: createZodValidationToStringRequired(),
  dataNascimento: birthDateValidate(),
  temFilhos: createZodValidationRadioField(),
  qtdFilhos: z.string().nullable().optional(),
  tamanhoFarda: z.string().optional(),
});

export const legendarySchema = z.object({
  status: z.string().optional(),
  tipoInscricao: z.string().optional(),
  nrLgnd: createZodValidationJustNumbers(),
  lgndCertificado: createZodValidationRadioField(),
  possuiAutorizacaoServir: createZodValidationRadioField(),
  lgnd_funcao: z.string().nullable().optional(),
  manTshirtSize: z.string().optional().nullable(),
});

export const spouseSchema = z.object({
  spouseName: z.string().optional(),
  spousePhoneNumber: phoneValidate(),
  spouseEmail: z.string().email().optional(),
  spouseCPF: createZodValidationToNumbersAndSymbolsFields(),
  spouseBirthDate: birthDateValidate(),
  womanTshirtSize: z.string().optional(),
});

export const addressSchema = z.object({
  cep: createZodValidationToNumbersAndSymbolsFields(),
  rua: createZodValidationToStringRequired(),
  ruaNumero: createZodValidationJustNumbers(),
  bairro: createZodValidationToStringRequired(),
  ruaComplemento: z.string().nullable().optional(),
  cidade: createZodValidationToStringRequired(),
  estado: z.string().optional(),
});

export const emergencySchema = z.object({
  nomeContatoEmergencia: createZodValidationToStringRequired(),
  celularContatoEmergencia: phoneValidate(),
  tipoVinculoContatoEmergencia: z
    .string()
    .refine(
      (value) => vinculoOptions.map((option) => option.value).includes(value),
      {
        message: "",
      },
    ),
});

export const contactLettersSchema = z.object({
  nomeContatoCartas: createZodValidationToStringRequired(),
  celularContatoCartas: phoneValidate(),
});

export const religionSchema = z.object({
  igreja: createZodValidationToStringRequired(),
  igrejaPastor: z.string().optional(),
  comoConheceuLegendarios: z.string().optional(),
  quemConvidou: z.string().optional(),
});

export const healthRemSchema = z.object({
  isPregnant: createZodValidationRadioField(),
  hasHealthIssues: createZodValidationRadioField(),
  healthIssuesDescription: z.string().optional(),
});

export const healthSchema = z.object({
  peso: z
    .string()
    .optional()
    .refine((value: string | undefined) => value && /^\d+$/.test(value), {
      message: "Digite apenas números",
    }),
  altura: z
    .string()
    .optional()
    .refine((value: string | undefined) => value && /^\d+$/.test(value), {
      message: "Digite apenas números",
    }),
  imc: z.string().optional(),
  biotipo: z.string().nullable().optional(),
  possuiPlanoSaude: createZodValidationRadioField(),
  nomePlanoSaude: z.string().nullable().optional(),
  possuiAlergia: createZodValidationRadioField(),
  possuiDiabetes: createZodValidationRadioField(),
  possuiConvulsoes: createZodValidationRadioField(),
  possuiDesmaios: createZodValidationRadioField(),
  possuiProblemasCardiacos: createZodValidationRadioField(),
  possuiDisturbiosAlimentares: createZodValidationRadioField(),
  possuiProblemasRespiratorios: createZodValidationRadioField(),
  cuidadosPsiquiatricos: createZodValidationRadioField(),
  medicacaoDepressao: createZodValidationRadioField(),
  possuiProblemasMusculoesqueleticos: createZodValidationRadioField(),
});

export const othersMedicineInfoSchema = z.object({
  doencaOuCondicao: z.string().optional(),
  medicacoes: z.string().optional(),
  motivosDietaEspecial: z.string().optional(),
  outrasInformacoesMedicas: z.string().optional(),
});

export const paymentSchema = z.object({
  pagamento_status: z.string().nullable().optional(),
  pagamento_data: z.string().optional(),
  pagamento_top_value: z.number().optional(),
  pagamento_total_value: z.number().optional(),
  pagamento_fee_card: z.number().optional(),
  pagamento_couponValue: z.string().nullable().optional(),
  pagamento_discount_value: z.number(),
  metodo_pagamento: z.string().nullable().optional(),
  linkSecreto: z.string().nullable().optional(),
  obs: z.string().nullable().optional(),
});

export const refundSchema = z.object({
  reembolso_status: z.string().optional(),
  reembolso_value: z.number().optional(),
  reembolso_description: z.string().optional(),
  reembolso_type: z.string().optional(),
  reembolso_receipt: z.string().optional(),
  reembolso_created: z.string().optional(),
});
