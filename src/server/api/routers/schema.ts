import { ENUM_LGND_FUNCAO } from "@/lib/enum";
import { z } from "zod";

export const EventTypeEnumSchema = z.enum([
  "LEGENDARIOS",
  "REM",
  "LEGADO_FILHA",
  "LEGADO_FILHO",
  "MANADADAY",
]);

export const FlagsEnumSchema = z.enum([
  "sendConfirmationMessageByWhats",
  "sendConfirmationMessageByEmail",
]);

export const StatusEnum = z.enum([
  "INSCREVENDO",
  "CONFIRMADA",
  "AGUARDANDO_PAGAMENTO",
  "CANCELADA_PELO_CLIENTE",
  "CANCELADA_TEMPO_EXPIRADO",
]);

export const CheckInStatusEnum = z.enum([
  "WAITING_FOR_DOCUMENTS",
  "DOCUMENTS_SENT",
  "INVALID_DOCUMENTS",
  "VALID_DOCUMENTS",
]);

export const VehicleTypeEnum = z.enum(["BUS", "CAR"]);

export const statusOptions = [
  "INSCREVENDO",
  "CONFIRMADA",
  "AGUARDANDO_PAGAMENTO",
  "CANCELADA_PELO_CLIENTE",
  "CANCELADA_TEMPO_EXPIRADO",
];

const dadosPessoaisSchema = z.object({
  // Dados da Inscrição da Pessoa
  cpf: z.string().length(11).optional(),
  nome: z.string().optional(),
  dataNascimento: z.date().optional(),
  estadoCivil: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email().optional(),

  // Endereço
  cep: z.string().optional(),
  rua: z.string().optional(),
  ruaNumero: z.string().optional(),
  ruaComplemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
});

const saudeSchema = z.object({
  possuiPlanoSaude: z.boolean().optional(),
  nomePlanoSaude: z.string().optional(),
  tipoSanguineo: z.string().optional(),
  possuiAlergia: z.boolean().optional(),
  possuiDiabetes: z.boolean().optional(),
  possuiConvulsoes: z.boolean().optional(),
  possuiDesmaios: z.boolean().optional(),
  possuiProblemasCardiacos: z.boolean().optional(),
  possuiDisturbiosAlimentares: z.boolean().optional(),
  possuiProblemasRespiratorios: z.boolean().optional(),
  cuidadosPsiquiatricos: z.boolean().optional(),
  medicacaoDepressao: z.boolean().optional(),
  possuiProblemasMusculoesqueleticos: z.boolean().optional(),
  doencaOuCondicao: z.string().optional(),
  medicacoes: z.string().optional(),
  outrasInformacoesMedicas: z.string().optional(),
  motivosDietaEspecial: z.string().optional(),
});

const contatoEmergenciaSchema = z.object({
  // Contato de Emergência
  nomeContatoEmergencia: z.string().optional(),
  celularContatoEmergencia: z.string().optional(),
  tipoVinculoContatoEmergencia: z.string().optional(),
});

export const paymentSchema = z.object({
  // Pagamento
  metodo_pagamento: z.enum(["PIX", "CARTAO", "CUPOM_GRATUITO"]).optional(),
  pagamento_integracao_service: z.enum(["WOOVI", "ASAAS"]).optional(),
  pagamento_integracao_status: z.string().optional(),
  pagamento_status: z.string().optional(),
  pagamento_data: z.date().optional(),
  pagamento_couponValue: z.string().optional(),
  //new types
  pagamento_top_value: z.number().optional(),
  pagamento_fee_card: z.number().optional(),
  pagamento_discount_value: z.number().optional(),
  pagamento_installment: z.number().optional(),
  pagamento_value_per_installment: z.number().optional(),
  pagamento_total_value: z.number().optional(),
  pagamento_link_url: z.string().nullable().optional(),
});

const comumSchema = z.object({
  eventoId: z.string(),
  ativo: z.boolean().optional(),
  status: z.enum(["INSCREVENDO"]).optional(),
  tipoInscricao: z.string().optional(),
  igreja: z.string().optional(),
  igrejaPastor: z.string().optional(),
  caravana: z.string().optional(),
  aceitaTermos: z.boolean().optional(),
  comoConheceuLegendarios: z.string().optional(),
  quemConvidou: z.string().optional(),
  linkSecreto: z.string().optional(),
  flags: FlagsEnumSchema.array().optional(),
});

const checkinSchema = z.object({
  checkin: z.boolean().optional(),
  check_obs: z.string().optional(),
  saude: z.number().optional(),
  saude_obs: z.string().optional(),
  familia: z.number().optional(),
});

export const participanteSchema = z.object({
  ...comumSchema.shape,
  ...dadosPessoaisSchema.shape,
  ...paymentSchema.shape,
  ...comumSchema.shape,
  ...saudeSchema.shape,
  ...contatoEmergenciaSchema.shape,
  ...checkinSchema.shape,
  nomeContatoCartas: z.string().optional(),
  celularContatoCartas: z.string().optional(),
  peso: z.number().optional(),
  altura: z.number().optional(),
  imc: z.number().optional(),
  tamanhoFarda: z.string().optional(),
  temFilhos: z.boolean().optional(),
  qtdFilhos: z.number().optional(),
  biotipo: z.string().optional(),
});

export const legendarioSchema = z.object({
  ...comumSchema.shape,
  ...dadosPessoaisSchema.shape,
  ...paymentSchema.shape,
  ...contatoEmergenciaSchema.shape,
  ...checkinSchema.shape,
  nrLgnd: z.string().optional(),
  possuiAutorizacaoServir: z.boolean().optional(),
  lgndCertificado: z.boolean(),
  orientadorEspiritual: z.string().optional(),
  lgnd_funcao: z.nativeEnum(ENUM_LGND_FUNCAO).optional().nullable(),
});

export const spousePersonalInfoRemSchema = z.object({
  spouseName: legendarioSchema.shape.nome,
  spousePhoneNumber: legendarioSchema.shape.celular,
  spouseEmail: legendarioSchema.shape.email,
  spouseCPF: legendarioSchema.shape.cpf,
  spouseBirthDate: legendarioSchema.shape.dataNascimento,
});

const addressRemSchema = dadosPessoaisSchema.pick({
  cep: true,
  pais: true,
  rua: true,
  ruaNumero: true,
  bairro: true,
  cidade: true,
  estado: true,
});

const religionRemSchema = comumSchema.pick({
  igreja: true,
  igrejaPastor: true,
});

export const createRemRegisterSchema = legendarioSchema
  .pick({
    cpf: true,
    nrLgnd: true,
    celular: true,
    email: true,
    dataNascimento: true,
    nome: true,
  })
  .merge(
    z.object({
      ...spousePersonalInfoRemSchema.shape,
      ...addressRemSchema.shape,
      ...religionRemSchema.shape,
      ...contatoEmergenciaSchema.shape,
      manTshirtSize: z.string(),
      womanTshirtSize: z.string(),
      hasHealthIssues: z.boolean(),
      healthIssuesDescription: z.string().optional(),
      isPregnant: z.boolean(),
      aceitaTermos: z.boolean(),
    }),
  );

export const createRemRegisterServeSchema = legendarioSchema
  .pick({
    cpf: true,
    nrLgnd: true,
    celular: true,
    email: true,
    dataNascimento: true,
    nome: true,
  })
  .merge(
    z.object({
      ...spousePersonalInfoRemSchema.shape,
      ...addressRemSchema.shape,
      ...religionRemSchema.shape,
      ...contatoEmergenciaSchema.shape,
      womanTshirtSize: z.string().optional(),
      hasHealthIssues: z.boolean(),
      healthIssuesDescription: z.string().optional(),
      isPregnant: z.boolean(),
      lgndCertificado: z.boolean().optional(),
      aceitaTermos: z.boolean(),
      manTshirtSize: z.string().optional(),
      nrRem: z.string(),
    }),
  );

export const updateFamilyClassificationSchema = z.object({
  id: z.string(),
  familia: z.number().nullable(),
  saude: z.number().nullable(),
});

export const WooviPayloadSchema = z.object({
  id: z.string(),
  charge: z.object({}).optional().nullable(),
  company: z.object({}).optional().nullable(),
  correlationId: z.string().optional().nullable(),
  createdAt: z.date().default(() => new Date()),
  event: z.string().optional().nullable(),
  payload: z.object({}).optional().nullable(),
  pix: z.object({}).optional().nullable(),
});

export const EventGeneralInfo = z.object({
  type: EventTypeEnumSchema,
  titulo: z.string(),
  description: z.string(),
  subtitulo: z.string(),
  periodo: z.string(),
  dataInicio: z.date(),
  dataFim: z.date(),
  local: z.string(),
  localSaida: z.string(),
  localUrl: z.string().url(),
  banner: z.string().optional(),
});

export const EventTicketInfo = z.object({
  valorParticipante: z.number(),
  valorParaObterCertificacao: z.number(),
  valorParaLgndCertificados: z.number(),
  linkWhatsappGrupoParticipante: z.string().url().optional(),
  linkWhatsappGrupoServir: z.string().url().optional(),
  vagasParticipar: z.number(),
  vagasServir: z.number(),
});

export const CreateEventSchema = z.object({
  ...EventGeneralInfo.shape,
  ...EventTicketInfo.shape,
});

const OrderSchema = z
  .array(
    z.object({
      nome: z.enum(["asc", "desc"]).optional(),
      familia: z.enum(["asc", "desc"]).optional(),
    }),
  )
  .default([{ nome: "asc" }]);

const PaginationInputSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(20),
  search: z.string().optional(),
  filters: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]).optional())
    .optional(),
  orderBy: OrderSchema,
});

export const PaginationInscricaoSchema = z.object({
  ...PaginationInputSchema.shape,
  eventoId: z.string(),
  checkin: z.boolean().optional(),
  tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"]),
  status: z.string().optional(),
});

export const CreateVehicleSchema = z.object({
  eventId: z.string(),
  name: z.string().min(3),
  identifier: z.string(),
  type: VehicleTypeEnum,
  totalCapacity: z.number(),
  plate: z.string().nullable().optional(),
  owner: z.string().nullable().optional(),
  function: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  active: z.boolean().optional(),
});
