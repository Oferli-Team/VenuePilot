import {
  biotipoOptions,
  howKnowLegendsOptions,
  stringToBoolean,
  vinculoOptions,
} from "@/lib/constants";
import { convertFromBasisPoint } from "@/lib/utils/basisPoint";
import { formatDateToYYYYMMDD } from "@/lib/utils/formatDateToYYYYMMDD";
import cardValidator from "card-validator";
import { add } from "date-fns";
import { unmask } from "remask";
import { z } from "zod";
import { shirtSizes } from "@/components/participante/fardamentoForm";
import {
  acceptedCardTypes,
  createZodCPFValidation,
  createZodValidationJustNumbers,
  createZodValidationRadioField,
  createZodValidationToNumbersAndSymbolsFields,
  createZodValidationToStringRequired,
  errorInputRadio,
  errorMessage,
  isValidCpf,
  isValidCpfCnpj,
  maritalStatusOptions,
  validateDateOfBirth,
  validateIfIsAtLeast15YearsOld,
  validatePhoneNumber,
} from "./validation";

export const createFardamentoETermoSchema = z.object({
  tamanho_farda: z
    .string({ required_error: "Selecione uma opção" })
    .refine((value: string) => shirtSizes.some((item) => item.size === value), {
      message: errorInputRadio,
    }),
  aceitaTermos: z
    .boolean({ required_error: "Termo precisa ser aceito para continuar." })
    .refine((value) => value === true, {
      message: "Termo precisa ser aceito para continuar.",
    }),
});

export const cpfValidationSchema = z.object({
  cpfInitial: z
    .string({ required_error: "Campo obrigatório" })
    .refine(isValidCpf, { message: "Digite um CPF válido" }),
});

// Personal info Schema
const personalInfoSchema = z.object({
  cpf: z.string().refine(isValidCpf, { message: "Digite um CPF válido" }),
  nome: z
    .string({ required_error: errorMessage })
    .refine(
      (value) => value.split(" ").filter(Boolean).length >= 2,
      "Insira nome e sobrenome",
    )
    .transform((value) => value.trim()),
  email: z
    .string()
    .email({ message: "Digite um e-mail válido" })
    .transform((value) => value.trim()),
  data_nascimento: createZodValidationToStringRequired()
    .refine(validateDateOfBirth, {
      message: "Data de nascimento inválida.",
    })
    .refine(validateIfIsAtLeast15YearsOld, {
      message: "Participante deve ter pelo menos 15 anos.",
    }),
  celular: z
    .string({ required_error: errorMessage })
    .refine((value) => validatePhoneNumber(value), {
      message: "Preencha celular corretamente",
    })
    .transform((value) => {
      const cleanPhone = value.replace(/\D/g, "");
      return cleanPhone.trim();
    }),
  estado_civil: z
    .string()
    .refine((value) => maritalStatusOptions.includes(value), {
      message: errorInputRadio,
    }),
});

const siglasEstados = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// Address schema
const addressSchema = z.object({
  pais: z
    .string({ required_error: errorMessage })
    .transform((value) => value?.trim()),
  cep: createZodValidationToNumbersAndSymbolsFields(),
  rua: createZodValidationToStringRequired(),
  rua_numero: createZodValidationJustNumbers(),
  bairro: createZodValidationToStringRequired(),
  rua_complemento: z.string().optional(),
  cidade: createZodValidationToStringRequired(),
  estado: createZodValidationToStringRequired().refine(
    (value) => siglasEstados.includes(value),
    {
      message: "Informe apenas a sigla do seu Estado",
    },
  ),
});

// Emergency contact schema
export const emergencyContactSchema = z.object({
  nome_contato_emergencia: createZodValidationToStringRequired(),
  celular_contato_emergencia: z
    .string({ required_error: errorMessage })
    .refine((value) => validatePhoneNumber(value), {
      message: "Preencha celular corretamente",
    })
    .transform((value) => {
      const cleanPhone = value.replace(/\D/g, "");
      return cleanPhone.trim();
    }),
  tipo_vinculo_contato_emergencia: z
    .string()
    .refine(
      (value) => vinculoOptions.map((option) => option.value).includes(value),
      {
        message: errorInputRadio,
      },
    ),
});

export const personalDataLgndRem = personalInfoSchema.omit({
  estado_civil: true,
  data_nascimento: true,
  cpf: true,
});
export const addressDataRem = addressSchema.omit({
  rua_complemento: true,
  cep: true,
});
export const spousePersonalInfoSchema = z.object({
  spouseName: personalInfoSchema.shape.nome,
  spousePhoneNumber: personalInfoSchema.shape.celular,
  spouseEmail: personalInfoSchema.shape.email,
  spouseCPF: createZodCPFValidation(),
  spouseBirthDate: personalInfoSchema.shape.data_nascimento.transform(
    (value) => {
      const birthDate = value && formatDateToYYYYMMDD(value);
      return add(birthDate, { hours: 12 }); // add 12pm
    },
  ),
});

export const createRemParticipantSchema = z.object({
  cpf: createZodCPFValidation(),
  nrLgnd: createZodValidationJustNumbers(),
  data_nascimento: personalInfoSchema.shape.data_nascimento.transform(
    (value) => {
      const birthDate = value && formatDateToYYYYMMDD(value);
      return add(birthDate, { hours: 12 }); // add 12pm
    },
  ),
  igreja: createZodValidationToStringRequired(),
  igreja_pastor: createZodValidationToStringRequired(),
  womanTshirtSize: z.string({ required_error: errorMessage }),
  manTshirtSize: z.string({ required_error: errorMessage }),
  hasHealthIssues: z
    .string({ required_error: errorInputRadio })
    .transform((value) => stringToBoolean(value)),
  healthIssuesDescription: z.string().optional(),
  isPregnant: z
    .string({ required_error: errorInputRadio })
    .transform((value) => stringToBoolean(value)),
  ...spousePersonalInfoSchema.shape,
  ...personalDataLgndRem.shape,
  ...addressDataRem.shape,
  ...emergencyContactSchema.shape,
  cep: createZodValidationToNumbersAndSymbolsFields().transform((value) =>
    unmask(value),
  ),
  aceitaTermos: z
    .boolean({ required_error: "Termo precisa ser aceito para continuar." })
    .refine((value) => value === true, {
      message: "Termo precisa ser aceito para continuar.",
    }),
});

export const createRemServeSchema = z.object({
  // ...createRemParticipantSchema.shape,
  cpf: createZodCPFValidation(),
  nrLgnd: z.string({
    required_error: "Campo obrigatório, informe apenas números",
  }),
  nrRem: z.string({
    required_error: "Campo obrigatório, informe apenas números",
  }),
  lgndCertificado: z
    .string({ required_error: errorInputRadio })
    .transform((value) => stringToBoolean(value)),
  data_nascimento: personalInfoSchema.shape.data_nascimento.transform(
    (value) => {
      const birthDate = value && formatDateToYYYYMMDD(value);
      return add(birthDate, { hours: 12 }); // add 12pm
    },
  ),
  igreja: createZodValidationToStringRequired(),
  igreja_pastor: createZodValidationToStringRequired(),
  womanTshirtSize: z.string().optional(),
  manTshirtSize: z.string().optional(),
  hasHealthIssues: z
    .string({ required_error: errorInputRadio })
    .transform((value) => stringToBoolean(value)),
  healthIssuesDescription: z.string().optional(),
  isPregnant: z
    .string({ required_error: errorInputRadio })
    .transform((value) => stringToBoolean(value)),
  ...spousePersonalInfoSchema.shape,
  ...personalDataLgndRem.shape,
  ...addressDataRem.shape,
  ...emergencyContactSchema.shape,
  cep: createZodValidationToNumbersAndSymbolsFields().transform((value) =>
    unmask(value),
  ),
  aceitaTermos: z
    .boolean({
      required_error: "Termo precisa ser aceito para continuar.",
    })
    .refine((value) => value === true, {
      message: "Termo precisa ser aceito para continuar.",
    }),
});

export const createDadosPessoaisSchema = z
  .object({
    ...personalInfoSchema.shape,
    nome_contato_cartas: createZodValidationToStringRequired(),
    celular_contato_cartas: z
      .string({ required_error: errorMessage })
      .refine((value) => validatePhoneNumber(value), {
        message: "Preencha celular corretamente",
      })
      .transform((value) => {
        const cleanPhone = value.replace(/\D/g, "");
        return cleanPhone.trim();
      }),
    peso: createZodValidationJustNumbers()
      .refine((value) => value.length >= 2, {
        message: "Mínimo 2 dígitos",
      })
      .refine((value) => !value.startsWith("0"), {
        message: "Preencha um peso válido",
      }),
    altura: createZodValidationToNumbersAndSymbolsFields().refine(
      (value) => value.startsWith("1") || value.startsWith("2"),
      { message: "Preencha uma altura válida" },
    ),
    biotipo: z
      .string({ required_error: errorInputRadio })
      .refine(
        (value) => biotipoOptions.map((option) => option.value).includes(value),
        { message: errorInputRadio },
      ),
    igreja: createZodValidationToStringRequired(),
    igreja_pastor: createZodValidationToStringRequired(),
    tem_filhos: createZodValidationRadioField(),
    qtd_filhos: z
      .string()
      .optional()
      .refine(
        (value) => {
          return !value || /^\d+$/.test(value);
        },
        {
          message: "Digite apenas números",
        },
      ),
    quem_convidou: z.string().optional(),
    como_conheceu_legendarios: z
      .string()
      .refine(
        (value) =>
          howKnowLegendsOptions.map((option) => option.value).includes(value),
        {
          message: errorInputRadio,
        },
      )
      .refine((value) => value !== undefined && value !== null, {
        message: errorInputRadio,
      }),
    ...addressSchema.shape,
    ...emergencyContactSchema.shape,
  })
  .refine(
    (data) => {
      if (data.tem_filhos === "true") {
        return data.qtd_filhos && data.qtd_filhos.trim() !== "";
      }
      return true;
    },
    {
      message: "Informe a quantidade de filhos",
      path: ["qtd_filhos"],
    },
  );

export const createDadosSaudeSchema = z.object({
  possui_plano_saude: createZodValidationRadioField(),
  nome_plano_saude: z.string().optional(),
  possui_alergia: createZodValidationRadioField(),
  possui_diabetes: createZodValidationRadioField(),
  possui_convulsoes: createZodValidationRadioField(),
  possui_desmaios: createZodValidationRadioField(),
  possui_problemas_cardiacos: createZodValidationRadioField(),
  possui_disturbios_alimentares: createZodValidationRadioField(),
  possui_problemas_respiratorios: createZodValidationRadioField(),
  cuidados_psiquiatricos: createZodValidationRadioField(),
  medicacao_depressao: createZodValidationRadioField(),
  possui_problemas_musculoesqueleticos: createZodValidationRadioField(),
  doenca_ou_condicao: z.string().optional(),
  medicacoes: z.string().optional(),
  outras_informacoes_medicas: z.string().optional(),
  motivos_dieta_especial: z.string().optional(),
});

export const createServirSchema = z.object({
  nrLgnd: createZodValidationJustNumbers(),
  // dourados_ou_regiao: createZodValidationRadioField(),
  igreja: createZodValidationToStringRequired(),
  orientador_espiritual: createZodValidationToStringRequired(),
  possui_autorizacao_servir: createZodValidationRadioField(),
  ...personalInfoSchema.shape,
  ...addressSchema.shape,
  ...emergencyContactSchema.shape,
});

export const creditCardSchema = z
  .object({
    name: z
      .string({
        required_error: "Campo nome é obrigatório",
      })
      .refine(
        (value) => {
          return value.trim().split(/\s+/).length >= 2;
        },
        {
          message: "Preencha nome e sobrenome",
        },
      )
      .transform((value) => value.toLowerCase().trim()),
    email: z
      .string({ required_error: "Informe um E-mail" })
      .email({ message: "Informe um e-mail válido" })
      .transform((value) => value.trim()),
    cpfCnpj: z
      .string({ required_error: "Informe um CPF ou CNPJ" })
      .refine(isValidCpfCnpj, {
        message: "Digite um CPF ou CNPJ válido",
      })
      .transform((val) => val.replace(/[^\d]/g, "")),
    mobilePhone: z
      .string({ required_error: "Informe número de celular" })
      .refine(validatePhoneNumber, {
        message: "Informe um celular válido",
      })
      .transform((value) => unmask(value)),
    postalCode: createZodValidationToNumbersAndSymbolsFields().transform(
      (value) => unmask(value),
    ),
    addressNumber: createZodValidationJustNumbers(),
    number: z
      .string({ required_error: "Preencha com os números do cartão" })
      .refine(
        (value) => {
          const { card } = cardValidator.number(value);
          return card && acceptedCardTypes.includes(card.type);
        },
        {
          message: "Cartão inválido ou não aceito.",
        },
      )
      .refine(
        (value) =>
          value.replace(/\s/g, "").length >= 13 &&
          value.replace(/\s/g, "").length <= 16,
        {
          message: "Preencha corretamente o número do cartão",
        },
      )
      .transform((value) => unmask(value)),
    holderName: z
      .string({
        required_error: "Preencha com o nome",
      })
      .refine(
        (value) => {
          return value.trim().split(/\s+/).length >= 2;
        },
        {
          message: "Preencha nome e sobrenome",
        },
      ),
    installment: z
      .string({ required_error: "Selecione o parcelamento" })
      .refine((value) => value !== "Selecione", {
        message: "Selecione o parcelamento",
      }),
    expiry: z.string({ required_error: "Selecione uma data" }),
    cvc: z
      .string({ required_error: "Preencha o Código CVC" })
      .min(3, { message: "Mínimo 3 dígitos" })
      .max(4, { message: "Máximo 4 dígitos" }),
  })
  .superRefine(({ number, cvc }, ctx) => {
    const { card } = cardValidator.number(number);

    if (card) {
      // Validar o CVC com base no tipo do cartão
      if (card.type === "american-express") {
        if (!/^\d{4}$/.test(cvc)) {
          ctx.addIssue({
            path: ["cvc"],
            message: "Preencha corretamente o Código CVC",
          });
        }
      } else {
        if (!/^\d{3}$/.test(cvc)) {
          ctx.addIssue({
            path: ["cvc"],
            message: "Preencha corretamente o Código CVC",
          });
        }
      }
    } else {
      ctx.addIssue({
        path: ["cvc"],
        message: "Número do cartão inválido",
      });
    }
  });

export const creditCardSchemaNew = z.object({
  cc_name: z
    .string({
      required_error: "Campo nome é obrigatório",
    })
    .refine(
      (value) => {
        return value.trim().split(/\s+/).length >= 2;
      },
      {
        message: "Preencha nome e sobrenome",
      },
    )
    .transform((value) => value.toLowerCase().trim()),
  cc_email: z
    .string({ required_error: "Informe um E-mail" })
    .email({ message: "Informe um e-mail válido" })
    .transform((value) => value.trim()),
  cc_cpfCnpj: z
    .string({ required_error: "Informe um CPF ou CNPJ" })
    .refine(isValidCpfCnpj, {
      message: "Digite um CPF ou CNPJ válido",
    })
    .transform((val) => val.replace(/[^\d]/g, "")),
  cc_mobilePhone: z
    .string({ required_error: "Informe número de celular" })
    .refine(validatePhoneNumber, {
      message: "Informe um celular válido",
    })
    .transform((value) => unmask(value)),
  cc_postalCode: createZodValidationToNumbersAndSymbolsFields().transform(
    (value) => unmask(value),
  ),
  cc_addressNumber: createZodValidationJustNumbers(),
  cc_number: z
    .string({ required_error: "Preencha com os números do cartão" })
    .refine(
      (value) => {
        const { card } = cardValidator.number(value);
        return card && acceptedCardTypes.includes(card.type);
      },
      {
        message: "Cartão inválido ou não aceito.",
      },
    )
    .refine(
      (value) =>
        value.replace(/\s/g, "").length >= 13 &&
        value.replace(/\s/g, "").length <= 16,
      {
        message: "Preencha corretamente o número do cartão",
      },
    )
    .transform((value) => unmask(value)),
  cc_holderName: z
    .string({
      required_error: "Preencha com o nome",
    })
    .refine(
      (value) => {
        return value.trim().split(/\s+/).length >= 2;
      },
      {
        message: "Preencha nome e sobrenome",
      },
    ),
  cc_installment: z
    .string({ required_error: "Selecione o parcelamento" })
    .refine((value) => value !== "Selecione", {
      message: "Selecione o parcelamento",
    }),
  cc_expiry: z.string({ required_error: "Selecione uma data" }),
  cc_cvc: z
    .string({ required_error: "Preencha o Código CVC" })
    .min(3, { message: "Mínimo 3 dígitos" })
    .max(4, { message: "Máximo 4 dígitos" }),
});

const required_error = "Campo obrigatório";
const files = z.array(
  z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    path: z.string(),
  }),
);

export const eventGeneralInfoSchema = z.object({
  type: z.string({ required_error }),
  titulo: z.string({ required_error }),
  description: z.string({ required_error }),
  subtitulo: z.string({ required_error }),
  dataInicio: z.date({ required_error }),
  dataFim: z.date({ required_error }),
  local: z.string({ required_error }),
  localSaida: z.string({ required_error }),
  localUrl: z.string({ required_error }).url({ message: "URL inválida" }),
  topNumero: z.string({ required_error }),
  banner: z.string().optional(),
});

export const eventTicketInfoSchema = z.object({
  valorParticipante: z
    .string({ required_error })
    .transform((value) => {
      const numericValue = value.replace(/[^0-9.]/g, "");
      const number = Number(numericValue);
      return isNaN(number) ? 0 : number;
    })
    .transform((value) => convertFromBasisPoint(value)),
  valorParaObterCertificacao: z
    .string({ required_error })
    .transform((value) => {
      const numericValue = value.replace(/[^0-9.]/g, "");
      const number = Number(numericValue);
      return isNaN(number) ? 0 : number;
    })
    .transform((value) => convertFromBasisPoint(value)),
  valorParaLgndCertificados: z
    .string({ required_error })
    .transform((value) => {
      const numericValue = value.replace(/[^0-9.]/g, "");
      const number = Number(numericValue);
      return isNaN(number) ? 0 : number;
    })
    .transform((value) => convertFromBasisPoint(value)),
  linkWhatsappGrupoParticipante: z
    .string({ required_error })
    .url({ message: "URL inválida" }),
  linkWhatsappGrupoServir: z
    .string({ required_error })
    .url({ message: "URL inválida" }),
  vagasParticipar: z
    .string({ required_error })
    .transform((value) => Number(value)),
  vagasServir: z.string({ required_error }).transform((value) => Number(value)),
});
