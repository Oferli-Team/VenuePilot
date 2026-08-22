import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  CheckInStatusEnum,
  createRemRegisterSchema,
  createRemRegisterServeSchema,
  FlagsEnumSchema,
  legendarioSchema,
  PaginationInscricaoSchema,
  participanteSchema,
  paymentSchema,
  spousePersonalInfoRemSchema,
  StatusEnum,
  statusOptions,
  updateFamilyClassificationSchema,
} from "./schema";
import { differenceInYears } from "date-fns";
import { type Inscricao, type Prisma } from "@prisma/client";
import { formatedDataToCSVTable } from "@/lib/utils/formatedDataToCSVTable";
import { setDynamicFilters } from "@/server/utils/setDynamicFilters";
import { inngest } from "@/inngest/client";
import { EVENTS_NAME } from "@/inngest/events";
import { ENUM_CHECKIN_STATUS } from "@/lib/enum";
import { fieldHeaderLabelMap } from "@/lib/constants";

// Defina o schema conforme você forneceu
const updateInscricaoInputSchema = z.object({
  eventoId: z.string(),
  cpf: z.string().length(11).optional(),
  nome: z.string().optional(),
  rg: z.string().optional(),
  orgaoExpedidor: z.string().optional(),
  dataNascimento: z.date().optional(),
  estadoCivil: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email().optional(),
  cep: z.string().optional(),
  rua: z.string().optional(),
  ruaNumero: z.string().optional(),
  ruaComplemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  nomeContatoCartas: z.string().optional(),
  celularContatoCartas: z.string().optional(),
  peso: z.number().optional(),
  altura: z.number().optional(),
  imc: z.number().optional(),
  biotipo: z.string().optional(),
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
  manTshirtSize: z.string().optional(),
  isPregnant: z.boolean().optional(),
  hasHealthIssues: z.boolean().optional(),
  healthIssuesDescription: z.string().optional(),
  pagamento_status: z.string().optional(),
  pagamento_data: z.date().optional(),
  pagamento_couponValue: z.string().optional(),
  pagamento_top_value: z.number().optional(),
  pagamento_fee_card: z.number().optional(),
  pagamento_discount_value: z.number().optional(),
  pagamento_installment: z.number().optional(),
  pagamento_value_per_installment: z.number().optional(),
  pagamento_total_value: z.number().optional(),
  pagamento_integracao_status: z.string().optional(),
  pagamento_link_url: z.string().optional(),
  metodo_pagamento: z.enum(["PIX", "CARTAO", "CUPOM_GRATUITO"]).optional(),
  pagamento_integracao_service: z.enum(["WOOVI", "ASAAS"]).optional(),
  pagamento_charge_id: z.string().nullable().optional(),
  pagamento: z.array(z.object({})).optional(),
  cobrancaWoovi: z.array(z.object({})).optional(),
  reembolso_status: z.string().optional(),
  reembolso_value: z.number().optional(),
  reembolso_description: z.string().optional(),
  reembolso_type: z.string().optional(),
  reembolso_receipt: z.string().optional(),
  reembolso_created: z.string().optional(),
  ativo: z.boolean().optional(),
  status: StatusEnum.optional(),
  flags: z.string().array().optional(),
  igreja: z.string().optional(),
  igrejaPastor: z.string().optional(),
  temFilhos: z.boolean().optional(),
  qtdFilhos: z.number().optional(),
  nomeContatoEmergencia: z.string().optional(),
  emailContatoEmergencia: z.string().email().optional(),
  celularContatoEmergencia: z.string().optional(),
  tipoVinculoContatoEmergencia: z.string().optional(),
  caravana: z.string().optional(),
  tamanhoFarda: z.string().optional(),
  aceitaTermos: z.boolean().optional(),
  tipoInscricao: z.string().optional(),
  nrLgnd: z.string().optional(),
  lgndCertificado: z.boolean().optional(),
  lgnd_funcao: z.string().optional().nullable(),
  comoConheceuLegendarios: z.string().optional(),
  quemConvidou: z.string().optional(),
  possuiAutorizacaoServir: z.boolean().optional(),
  linkSecreto: z.string().optional(),
  obs: z.string().optional(),
  checkinCode: z.string().optional(),
  checkinStatus: z.string().optional(),
});

const updateInscricaoWithIdSchema = updateInscricaoInputSchema.extend({
  id: z.string().min(3),
});

export const inscricaoRouter = createTRPCRouter({
  createInitial: publicProcedure
    .input(
      z.object({
        id: z.string().min(3),
        eventoId: z.string(),
        name: z.string().min(3),
        email: z.string().email(),
        cpf: z.string().length(11),
        ativo: z.boolean(),
        createdAt: z.date(),
        status: z.string().refine((value) => statusOptions.includes(value)),
        tipoInscricao: z
          .string()
          .refine((value) => ["PARTICIPANTE", "SERVIR"].includes(value)),
        linkSecreto: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inscricao.create({
        data: {
          eventoId: input.eventoId,
          nome: input.name,
          email: input.email,
          cpf: input.cpf,
          ativo: input.ativo,
          status: input.status,
          createdAt: input.createdAt,
          tipoInscricao: input.tipoInscricao,
          linkSecreto: input.linkSecreto,
        },
      });
    }),

  createRemParticipantRegister: publicProcedure
    .input(
      z.object({
        ...createRemRegisterSchema.shape,
        eventId: z.string(),
        secretLink: z
          .object({
            id: z.string(),
            link: z.string(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, secretLink, ...data } = input;
      return await ctx.db.$transaction(async (tx) => {
        const register = await tx.inscricao.create({
          data: {
            eventoId: eventId,
            tipoInscricao: "PARTICIPANTE",
            ...(secretLink && { linkSecreto: secretLink.link }),
            ...data,
          },
        });

        if (secretLink) {
          await tx.linkUse.create({
            data: {
              linkId: secretLink.id,
              dataUtilizacao: new Date(),
              inscricaoId: register.id,
            },
          });

          await tx.linkSecreto.update({
            where: {
              id: secretLink.id,
            },
            data: { usadoCount: { increment: 1 } },
          });
        }

        return { id: register.id };
      });
    }),

  createRemServeRegister: publicProcedure
    .input(
      z.object({
        ...createRemRegisterServeSchema.shape,
        eventId: z.string(),
        secretLink: z
          .object({
            id: z.string(),
            link: z.string(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, manTshirtSize, secretLink, ...data } = input;

      return await ctx.db.$transaction(async (tx) => {
        const register = await tx.inscricao.create({
          data: {
            eventoId: eventId,
            tipoInscricao: "SERVIR",
            ...(manTshirtSize && { manTshirtSize }),
            ...(secretLink && { linkSecreto: secretLink.link }),
            ...data,
          },
        });

        if (secretLink) {
          await tx.linkUse.create({
            data: {
              linkId: secretLink.id,
              dataUtilizacao: new Date(),
              inscricaoId: register.id,
            },
          });

          await tx.linkSecreto.update({
            where: {
              id: secretLink.id,
            },
            data: { usadoCount: { increment: 1 } },
          });
        }

        return { id: register.id };
      });
    }),

  createInscricaoParticipante: publicProcedure
    .input({
      ...participanteSchema,
      id: z.string().min(3),
    })
    .mutation(async ({ ctx, input }) => {
      const inscricao = await ctx.db.inscricao.create({
        data: {
          ...input,
          tipoInscricao: "PARTICIPANTE",
          eventoId: input.eventoId,
          dataNascimento: input.dataNascimento
            ? new Date(input.dataNascimento)
            : null,
        },
      });

      return { id: inscricao.id };
    }),

  createTransferToAnotherEvent: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        obs: z.string(),
        register: z.unknown(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = input.register as Inscricao;
      const filteredRegister = Object.fromEntries(
        Object.entries(data).filter(
          ([key, value]) =>
            ![
              "id",
              "eventoId",
              "evento",
              "vehicleId",
              "vehicle",
              "cartas_obs",
              "cartas_contato_valido",
              "cartas_recebida",
              "linkSecreto",
              "obs",
              "pagamento",
              "cobrancaWoovi",
            ].includes(key) &&
            value !== null &&
            value !== undefined,
        ),
      );

      const select = {
        id: true,
        celular: true,
        nome: true,
        cpf: true,
        status: true,
        tipoInscricao: true,
        reembolso_status: true,
        pagamento_status: true,
        pagamento_total_value: true,
        obs: true,
        pagamento_link_url: true,
        metodo_pagamento: true,
        flags: true,
        evento: {
          select: {
            id: true,
            pista: true,
            topNumero: true,
            linkWhatsappGrupoParticipante: true,
            linkWhatsappGrupoServir: true,
            dataInicio: true,
          },
        },
      };

      return ctx.db.$transaction(async (tx) => {
        const newRegister = await tx.inscricao.create({
          data: {
            ...filteredRegister,
            obs: input.obs,
            eventoId: input.eventId,
            flags: undefined,
          },
          select,
        });

        const oldRegisterCanceled = await tx.inscricao.update({
          where: { id: data.id },
          select: {
            ...select,
            vehicleId: true,
          },
          data: {
            status: "CANCELADA_PELO_CLIENTE",
            vehicle: {
              disconnect: true,
            },
            obs: data.obs
              ? "Transferencia de TOP. " + data.obs
              : "Transferencia de TOP",
          },
        });

        if (data.vehicleId) {
          await tx.vehicle.update({
            where: { id: data.vehicleId },
            data: { usedCapacity: { decrement: 1 } },
          });
        }

        return {
          new: newRegister,
          old: oldRegisterCanceled,
        };
      });
    }),

  updateInscricao: publicProcedure
    .input(updateInscricaoWithIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Filter out undefined values
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined),
      );

      return ctx.db.inscricao.update({
        where: { id },
        data: filteredData,
      });
    }),

  updateRegisterEditingUser: protectedProcedure
    .input(
      z.object({
        ...spousePersonalInfoRemSchema.shape,
        womanTshirtSize: z.string().optional(),
        id: z.string(),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, eventId, ...updateData } = input;
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined),
      );

      return ctx.db.inscricao.update({
        where: { id },
        data: {
          ...filteredData,
          eventoId: eventId,
        },
      });
    }),

  updateInscricaoWithFlag: publicProcedure
    .input(
      z.object({
        id: z.string(),
        flag: FlagsEnumSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, flag } = input;

      return ctx.db.inscricao.update({
        where: { id },
        data: {
          flags: {
            push: flag,
          },
        },
      });
    }),

  createInscricaoLgnd: publicProcedure
    .input({ ...legendarioSchema, id: z.string().min(3) })
    .mutation(async ({ ctx, input }) => {
      const inscricao = await ctx.db.inscricao.create({
        data: {
          ...input,
          tipoInscricao: "SERVIR",
        },
      });
      return { id: inscricao.id };
    }),

  updateInscricaoLgnd: publicProcedure
    .input({ ...legendarioSchema.extend({ id: z.string() }) })
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Filter out undefined values
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined),
      );

      return ctx.db.inscricao.update({
        where: { id },
        data: filteredData,
      });
    }),

  updateFardamentoInscricao: publicProcedure
    .input(
      z.object({
        tamanhoFarda: z.string(),
        aceitaTermos: z.boolean(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inscricao.update({
        where: { id: input.id },
        data: {
          tamanhoFarda: input.tamanhoFarda,
          aceitaTermos: input.aceitaTermos,
        },
      });
    }),

  getInscricaoByCPF: publicProcedure
    .input(z.object({ cpf: z.string().length(11), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findFirst({
        where: { cpf: input.cpf, eventoId: input.eventoId },
        include: {
          evento: {
            select: {
              id: true,
              pista: true,
              topNumero: true,
              linkWhatsappGrupoParticipante: true,
              linkWhatsappGrupoServir: true,
              dataFim: true,
              dataInicio: true,
            },
          },
        },
      });
    }),

  getRegisterById: publicProcedure
    .input(z.object({ id: z.string(), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findFirst({
        where: { id: input.id, eventoId: input.eventoId },
        include: {
          evento: {
            select: {
              id: true,
              pista: true,
              topNumero: true,
              linkWhatsappGrupoParticipante: true,
              linkWhatsappGrupoServir: true,
              dataFim: true,
              dataInicio: true,
            },
          },
        },
      });
    }),

  checkExistRegisterConfirmedWithCPF: publicProcedure
    .input(z.object({ cpf: z.string().length(11), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findFirst({
        where: {
          cpf: input.cpf,
          eventoId: input.eventoId,
          status: "CONFIRMADA",
        },
        select: { id: true },
      });
    }),

  getAllInscricaoByCPF: publicProcedure
    .input(z.object({ cpf: z.string().length(11) }))
    .query(async ({ ctx, input }) => {
      const inscricoes = await ctx.db.inscricao.findMany({
        where: {
          cpf: input.cpf,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          nome: true,
          cpf: true,
          tipoInscricao: true,
          status: true,
          checkinCode: true,
          lgnd_funcao: true,
          spouseName: true,
          spouseCPF: true,
          evento: {
            select: {
              id: true,
              topNumero: true,
              pista: true,
              banner: true,
              periodo: true,
              local: true,
              localSaida: true,
              linkWhatsappGrupoParticipante: true,
              linkWhatsappGrupoServir: true,
              type: true,
            },
          },
        },
      });

      return inscricoes;
    }),

  getInscricaoByCPFToTicketRoute: publicProcedure
    .input(z.object({ cpf: z.string().length(11), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.inscricao.findFirst({
        where: { cpf: input.cpf, eventoId: input.eventoId },
        select: {
          id: true,
          nome: true,
          cpf: true,
          tipoInscricao: true,
          status: true,
          checkinCode: true,
          lgnd_funcao: true,
          spouseName: true,
          spouseCPF: true,
          evento: {
            select: {
              id: true,
              topNumero: true,
              pista: true,
              banner: true,
              periodo: true,
              local: true,
              localSaida: true,
              linkWhatsappGrupoParticipante: true,
              linkWhatsappGrupoServir: true,
              type: true,
            },
          },
        },
      });

      const data = {
        register: {
          id: result?.id,
          nome: result?.nome,
          cpf: result?.cpf,
          tipoInscricao: result?.tipoInscricao,
          status: result?.status,
          checkinCode: result?.checkinCode,
          spouseName: result?.spouseName,
          spouseCPF: result?.spouseCPF,
        },
        event: {
          ...result?.evento,
        },
      };

      if (data) return data;
    }),

  // cpf and event
  getPByUserId: publicProcedure
    .input(z.object({ id: z.string(), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findFirst({
        where: { id: input.id, eventoId: input.eventoId },
      });
    }),

  getInscricaoByUserIdAndChargeId: publicProcedure
    .input(
      z.object({
        id: z.string(),
        eventId: z.string(),
        charge_id: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findFirst({
        where: {
          id: input.id,
          eventoId: input.eventId,
          pagamento_charge_id: input.charge_id,
        },
      });
    }),

  getLegendarioByNumber: publicProcedure
    .input(z.object({ nrLgnd: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.inscricao.findFirst({
        where: { nrLgnd: input.nrLgnd },
      });

      if (data) {
        return data.nome;
      }

      return null;
    }),

  getAllInscritosParticipantes: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
        tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const statusCounts = await ctx.db.inscricao.groupBy({
        by: ["status"],
        where: { eventoId: input.eventoId, tipoInscricao: input.tipoInscricao },
        _count: {
          status: true,
        },
      });

      const result = {
        CONFIRMADA: 0,
        INSCREVENDO: 0,
        AGUARDANDO_PAGAMENTO: 0,
        CANCELADA_PELO_CLIENTE: 0,
        CANCELADA_TEMPO_EXPIRADO: 0,
      };

      statusCounts.forEach((statusCount) => {
        const status = statusCount.status as keyof typeof result;
        if (status in result) {
          result[status] = statusCount._count.status;
        }
      });

      return result;
    }),

  getLettersStats: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        eventoId: input.eventoId,
        tipoInscricao: "PARTICIPANTE",
        status: "CONFIRMADA",
      };

      const [lettersReceived, lettersPending, contactValid, contactNotValid] =
        await Promise.all([
          ctx.db.inscricao.count({
            where: {
              ...where,
              cartas_recebida: true,
            },
          }),
          ctx.db.inscricao.count({
            where: {
              ...where,
              OR: [
                { cartas_recebida: null },
                { cartas_recebida: { isSet: false } },
              ],
            },
          }),
          ctx.db.inscricao.count({
            where: {
              ...where,
              cartas_contato_valido: true,
            },
          }),
          ctx.db.inscricao.count({
            where: {
              ...where,
              cartas_contato_valido: false,
            },
          }),
        ]);

      const data = {
        lettersReceived,
        lettersPending,
        contactValid,
        contactNotValid,
      };
      return data;
    }),

  getCheckInStats: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
        tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.inscricao.aggregate({
        where: {
          eventoId: input.eventoId,
          tipoInscricao: input.tipoInscricao,
          status: "CONFIRMADA",
        },
        _count: {
          _all: true,
          checkin: true,
        },
      });

      const done = stats._count.checkin;
      const pending = stats._count._all - done;
      return {
        done,
        pending,
      };
    }),

  getHealthStats: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.inscricao.aggregate({
        where: {
          eventoId: input.eventoId,
          tipoInscricao: "PARTICIPANTE",
          status: "CONFIRMADA",
        },
        _count: {
          _all: true,
          saude: true,
        },
      });

      const done = stats._count.saude;
      const pending = stats._count._all - done;
      return {
        done,
        pending,
      };
    }),

  getLegendaryNumberEditedStats: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.inscricao.aggregate({
        where: {
          eventoId: input.eventoId,
          tipoInscricao: "PARTICIPANTE",
          status: "CONFIRMADA",
          checkin: true,
        },
        _count: {
          _all: true,
        },
      });

      const done = await ctx.db.inscricao.count({
        where: {
          eventoId: input.eventoId,
          tipoInscricao: "PARTICIPANTE",
          status: "CONFIRMADA",
          checkin: true,
          NOT: {
            OR: [{ nrLgnd: "" }, { nrLgnd: null }],
          },
        },
      });

      const pending = stats._count._all - done;

      return {
        done,
        pending,
      };
    }),

  getRegistersToCreateAutentiqueDocument: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findMany({
        where: {
          eventoId: input.eventId,
          tipoInscricao: input.tipoInscricao,
          status: "CONFIRMADA",
          OR: [
            { documentId: null },
            { checkinStatus: null },
            { checkinStatus: ENUM_CHECKIN_STATUS.INVALID_DOCUMENTS },
          ],
        },
        select: {
          id: true,
          tipoInscricao: true,
          nome: true,
          cpf: true,
          email: true,
          celular: true,
          dataNascimento: true,
          estadoCivil: true,
          rua: true,
          ruaNumero: true,
          bairro: true,
          cidade: true,
          cep: true,
          nomeContatoEmergencia: true,
          celularContatoEmergencia: true,
          evento: {
            select: {
              id: true,
              pista: true,
              dataInicio: true,
              topNumero: true,
            },
          },
        },
        orderBy: [{ nome: "asc" }, { familia: "asc" }],
      });
    }),

  getRegisterByAutentiqueDocumentId: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findFirst({
        select: {
          id: true,
          eventoId: true,
          checkinStatus: true,
          documentId: true,
        },
        where: {
          documentId: input.documentId,
        },
      });
    }),

  updateStatusInscricao: publicProcedure
    .input({
      ...paymentSchema.extend({
        id: z.string(),
        eventoId: z.string(),
        status: z.string(),
        linkSecreto: z.string().optional(),
        checkinCode: z.string().optional(),
        checkinStatus: CheckInStatusEnum.optional(),
      }),
    })
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inscricao.update({
        where: { id: input.id }, // need to fix Type '{ cpf: string; }' is not assignable to type 'InscricaoWhereUniqueInput'.
        data: {
          status: input.status,
          linkSecreto: input.linkSecreto,
          checkinCode: input.checkinCode,
          checkinStatus: input.checkinStatus,
          pagamento_status: input.pagamento_status,
          // pagamento_data: input.pagamento_data,
          pagamento_couponValue: input.pagamento_couponValue,
          metodo_pagamento: input.metodo_pagamento,
          pagamento_integracao_service: input.pagamento_integracao_service,
          pagamento_integracao_status: input.pagamento_integracao_status,

          // new types
          pagamento_top_value: input.pagamento_top_value,
          pagamento_fee_card: input.pagamento_fee_card,
          pagamento_discount_value: input.pagamento_discount_value,
          pagamento_installment: input.pagamento_installment,
          pagamento_value_per_installment:
            input.pagamento_value_per_installment,
          pagamento_total_value: input.pagamento_top_value,
          pagamento_link_url: input.pagamento_link_url,
        },
      });
    }),

  updateCheckin: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
        id: z.string(),
        checkin: z.boolean().optional(),
        check_obs: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: {
        checkin?: boolean;
        check_obs?: string;
      } = {};

      if (input.checkin !== undefined) {
        updateData.checkin = input.checkin;
      }

      if (input.check_obs !== undefined) {
        updateData.check_obs = input.check_obs;
      }

      return ctx.db.inscricao.update({
        where: { eventoId: input.eventoId, id: input.id },
        data: updateData,
      });
    }),

  updateCheckinStatus: publicProcedure
    .input(
      z.object({
        eventoId: z.string(),
        id: z.string(),
        checkinStatus: z.string(),
        documentId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inscricao.update({
        select: { checkinStatus: true },
        where: { eventoId: input.eventoId, id: input.id },
        data: {
          checkinStatus: input.checkinStatus,
          ...(input.documentId !== null
            ? { documentId: input.documentId }
            : {}),
        },
      });
    }),

  updateLettersReceived: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
        id: z.string(),
        cartas_recebida: z.boolean().optional(),
        cartas_obs: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: {
        cartas_recebida?: boolean;
        cartas_obs?: string;
      } = {};

      if (input.cartas_recebida !== undefined) {
        updateData.cartas_recebida = input.cartas_recebida;
      }

      if (input.cartas_obs !== undefined) {
        updateData.cartas_obs = input.cartas_obs;
      }

      return ctx.db.inscricao.update({
        where: { eventoId: input.eventoId, id: input.id },
        data: updateData,
      });
    }),

  updateLettersContactIsValid: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
        id: z.string(),
        cartas_contato_valido: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inscricao.update({
        where: { eventoId: input.eventoId, id: input.id },
        data: {
          cartas_contato_valido: input.cartas_contato_valido ?? null,
        },
      });
    }),

  updateFamilia: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        familia: z.number().min(1).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inscricao.update({
        where: { id: input.id },
        data: {
          familia: input.familia,
        },
      });
    }),

  updateRegisterWithParticipantNumber: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        eventoId: z.string(),
        field: z.enum(["nrLgnd", "nrRem"]),
        value: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { field, value, eventoId, id } = input;

      return ctx.db.inscricao.update({
        where: {
          eventoId,
          id,
        },
        data: {
          [field]: value,
        },
      });
    }),

  updateInscricaoLgndFuncao: protectedProcedure
    .input(
      z.object({
        lgnd_funcao: z.string().optional().nullable(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inscricao.update({
        where: { id: input.id },
        data: {
          lgnd_funcao: input.lgnd_funcao,
        },
      });
    }),

  updateInscricaoWithSaude: protectedProcedure
    .input(
      z.object({
        saude: z.number().optional().nullable(),
        saude_obs: z.string().optional(),
        inscricaoId: z.string(),
        eventoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: { saude?: number | null; saude_obs?: string } = {};

      if (input.saude !== undefined) {
        updateData.saude = input.saude;
      }

      if (input.saude_obs !== undefined) {
        updateData.saude_obs = input.saude_obs;
      }
      return ctx.db.inscricao.update({
        where: { id: input.inscricaoId, eventoId: input.eventoId },
        data: updateData,
      });
    }),

  getAllParticipantes: publicProcedure
    .input(
      z.object({
        eventoId: z.string(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.inscricao.findMany({
        where: {
          eventoId: input.eventoId,
          tipoInscricao: "PARTICIPANTE",
          ...(input?.status ? { status: input.status } : {}),
        },
      });

      return data;
    }),

  getAllRegistersWithPagination: publicProcedure
    .input(PaginationInscricaoSchema)
    .query(async ({ ctx, input }) => {
      const {
        page,
        pageSize: take,
        status,
        search,
        filters,
        checkin,
        tipoInscricao,
        eventoId,
        orderBy,
      } = input;

      const skip = (page - 1) * take;

      const dynamicFilters = setDynamicFilters(filters);

      const where: Prisma.InscricaoWhereInput = {
        eventoId,
        tipoInscricao,
        ...(checkin !== undefined ? { checkin } : {}),
        ...(status !== undefined ? { status } : {}),
        ...dynamicFilters,
        ...(search
          ? {
              OR: [
                { nome: { contains: search, mode: "insensitive" } },
                { cpf: { contains: search } },
                { nrLgnd: { contains: search } },
              ],
            }
          : {}),
      };

      const [data, totalItems] = await Promise.all([
        ctx.db.inscricao.findMany({
          where,
          take,
          skip,
          orderBy,
          include: {
            evento: {
              select: {
                id: true,
                type: true,
                topNumero: true,
                pista: true,
                dataInicio: true,
              },
            },
          },
        }),
        ctx.db.inscricao.count({
          where,
        }),
      ]);

      const totalPages = Math.ceil(totalItems / input.pageSize);

      return {
        data,
        totalPages,
        currentPage: input.page,
        totalItems,
      };
    }),

  getAllServir: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
        eventoId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findMany({
        where: {
          tipoInscricao: "SERVIR",
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.eventoId ? { eventoId: input.eventoId } : {}),
        },
      });
    }),

  getAllParticipantesByStatus: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.inscricao.findMany({
      where: {
        tipoInscricao: "PARTICIPANTE",
        OR: [
          { status: "CONFIRMADA" },
          { status: "AGUARDANDO_PAGAMENTO" },
          { status: "INSCREVENDO" },
          { status: "CANCELADA_TEMPO_EXPIRADO" },
        ],
      },
    });
  }),

  getAllServirByStatus: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.inscricao.findMany({
      where: {
        tipoInscricao: "SERVIR",
        OR: [
          { status: "CONFIRMADA" },
          { status: "AGUARDANDO_PAGAMENTO" },
          { status: "INSCREVENDO" },
          { status: "CANCELADA_TEMPO_EXPIRADO" },
        ],
      },
    });
  }),

  getAllInscricaoByStatus: publicProcedure
    .input(z.object({ status: z.string(), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findMany({
        where: {
          eventoId: input.eventoId,
          tipoInscricao: "PARTICIPANTE",
          AND: [{ status: input.status }],
        },
      });
    }),

  getInscricaoByUserId: publicProcedure
    .input(z.object({ id: z.string(), eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findFirst({
        where: { id: input.id, eventoId: input.eventId },
        include: {
          evento: {
            select: {
              id: true,
              titulo: true,
              topNumero: true,
              pista: true,
              dataInicio: true,
              dataFim: true,
              linkWhatsappGrupoParticipante: true,
              linkWhatsappGrupoServir: true,
              type: true,
              banner: true,
              slug: true,
              periodo: true,
              local: true,
            },
          },
        },
      });
    }),

  getRegisterByCheckInCode: publicProcedure
    .input(
      z.object({
        checkinCode: z.string(),
        eventId: z.string(),
        tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findFirst({
        select: {
          id: true,
          eventoId: true,
          checkinStatus: true,
          checkinCode: true,
          checkin: true,
          check_obs: true,
          status: true,
          nome: true,
          celular: true,
          cpf: true,
          familia: true,
          tipoInscricao: true,
        },
        where: {
          eventoId: input.eventId,
          checkinCode: input.checkinCode,
          tipoInscricao: input.tipoInscricao,
        },
      });
    }),

  getAllInscricaoByMultipleStatus: publicProcedure
    .input(z.object({ statuses: z.array(z.string()), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.inscricao.findMany({
        where: {
          AND: [
            { eventoId: input.eventoId },
            { OR: input.statuses.map((status) => ({ status })) },
          ],
        },
      });
    }),

  updatePaymentStatus: publicProcedure
    .input(
      z.object({
        inscricaoId: z.string(),
        status: StatusEnum.optional(),
        checkinCode: z.string().optional(),
        checkinStatus: CheckInStatusEnum.optional(),
        pagamento_status: z.enum([
          "CHARGE_CREATED",
          "CHARGE_COMPLETED",
          "TRANSACTION_REFUND_RECEIVED",
          "CHARGE_EXPIRED",
          "CREDIT_CARD_PAYMENT_COMPLETED",
          "PAYMENT_OVERDUE",
        ]),
        metodo_pagamento: z.enum(["PIX", "CARTAO"]),
        pagamento_data: z.date(),
        pagamento_couponValue: z.string().optional(),
        pagamento_top_value: z.number().optional(),
        pagamento_discount_value: z.number().optional(),
        pagamento_fee_card: z.number().optional(),
        pagamento_integracao_status: z.string(),
        pagamento_integracao_service: z.enum(["WOOVI", "ASAAS"]),
        pagamento_charge_id: z.string().nullable().optional(),
        reembolso_value: z.number().nullable().optional(),
        reembolso_status: z.enum(["PENDING", "DONE"]).nullable().optional(),
        reembolso_receipt: z.string().nullable().optional(),
        reembolso_description: z.string().nullable().optional(),
        reembolso_created: z.date().nullable().optional(),
        pagamento_link_url: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentInscricao = await ctx.db.inscricao.findUnique({
        where: { id: input.inscricaoId },
      });

      if (!currentInscricao) {
        throw new Error("Inscricao nao encontrada");
      }

      if (
        currentInscricao.status === "CONFIRMADA" &&
        input.status !== "CANCELADA_PELO_CLIENTE"
      ) {
        return currentInscricao;
      }

      // Define the update data
      const updateData = {
        status: input.status,
        checkinCode: input.checkinCode,
        checkinStatus: input.checkinStatus,
        pagamento_status: input.pagamento_status,
        pagamento_integracao_status: input.pagamento_integracao_status,
        pagamento_integracao_service: input.pagamento_integracao_service,
        metodo_pagamento: input.metodo_pagamento,
        pagamento_data: input.pagamento_data,
        pagamento_top_value: input.pagamento_top_value,
        pagamento_discount_value: input.pagamento_discount_value,
        pagamento_fee_card: input.pagamento_fee_card,
        pagamento_couponValue: input.pagamento_couponValue,
        ...(input?.pagamento_link_url
          ? { pagamento_link_url: input.pagamento_link_url }
          : {}),
        ...(input?.pagamento_charge_id
          ? { pagamento_charge_id: input.pagamento_charge_id }
          : {}),
      };

      // Perform the update
      return ctx.db.inscricao.update({
        where: { id: input.inscricaoId },
        data: updateData,
      });
    }),

  updatedPaymentRefunded: publicProcedure
    .input(
      z.object({
        inscricaoId: z.string(),
        status: z.enum(["CANCELADA_PELO_CLIENTE"]).nullable(),
        pagamento_status: z
          .enum([
            "TRANSACTION_REFUND_RECEIVED",
            "TRANSACTION_REFUND_IN_PROGRESS",
          ])
          .nullable(),
        reembolso_status: z.enum(["PENDING", "DONE"]).nullable(),
        reembolso_value: z.number().nullable(),
        reembolso_description: z.string().nullable(),
        reembolso_type: z.enum(["TOTAL", "PARTIAL"]).nullable().optional(),
        reembolso_receipt: z.string().nullable(),
        reembolso_created: z.date().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { inscricaoId, ...updateData } = input;

      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(
          ([, value]) => value !== undefined || value !== null,
        ),
      );

      return ctx.db.inscricao.update({
        where: {
          id: inscricaoId,
        },
        data: filteredData,
      });
    }),

  getInscricoesWithHealthDefined: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.inscricao.findMany({
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
          tipoInscricao: "PARTICIPANTE",
          // saude: { not: null },
        },
      });

      return data;
    }),

  getInscricoesToClassificateFamily: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
        quantityFamily: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.inscricao.findMany({
        select: {
          id: true,
          saude: true,
          familia: true,
          dataNascimento: true,
          imc: true,
        },
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
          tipoInscricao: "PARTICIPANTE",
        },
        orderBy: [{ saude: "asc" }],
      });

      const calculateAge = (birthDate: Date): number => {
        return differenceInYears(new Date(), new Date(birthDate));
      };

      const finalSorted = data
        .map((item) => ({
          ...item,
          idade: calculateAge(item.dataNascimento!),
        }))
        .sort((a, b) => {
          if (a.saude !== b.saude) {
            return a.saude! - b.saude!; // saude menor na frente [1, 2, 3, 4, ....]
          }
          if (a.idade !== b.idade) {
            return b.idade - a.idade; // mais velhos na frente [60, 44, 32 ....]
          }
          return b.imc! - a.imc!;
        });

      const numFamilies = input.quantityFamily;

      let familyCounter = 1;
      const distributedFamilies = [];

      for (const item of finalSorted) {
        distributedFamilies.push({
          ...item,
          familia: familyCounter, // Atribui a família de 1 até numFamilies
        });

        // Incrementa o contador de família e reinicia se passar do limite
        familyCounter = familyCounter < numFamilies ? familyCounter + 1 : 1;
      }

      return distributedFamilies;
    }),

  updateInscrioesWithFamily: protectedProcedure
    .input(
      z.object({
        inscricoes: z.array(updateFamilyClassificationSchema),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const validRegisters = input.inscricoes;

      if (validRegisters.length === 0) {
        throw Error("Nenhuma inscrição válida para atualização.");
      }

      // retorna obj com o array de ids correspondete a família ex: {'1': ['id', 'id']}
      const groupedUpdates = validRegisters.reduce(
        (acc, { id, familia }) => {
          const key = familia === null ? "null" : String(familia);
          if (!acc[key]) acc[key] = [];
          acc[key].push(id);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      const batchUpdates = Object.entries(groupedUpdates).map(
        ([familia, ids]) => ({
          familia,
          ids,
        }),
      );

      // $transaction = garante consistência sendo que todos os dados serão atualizados ou nenhum se houver algum erro
      const updated = await ctx.db.$transaction(
        batchUpdates.map(({ familia, ids }) =>
          // updateMany = atualiza vários registros com o mesmo valor de família
          ctx.db.inscricao.updateMany({
            where: { id: { in: ids }, eventoId: input.eventId },
            data: { familia: Number(familia) },
          }),
        ),
      );

      return updated;
    }),

  getChartFamily: protectedProcedure
    .input(z.object({ eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.inscricao.groupBy({
        by: ["familia"],
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
          tipoInscricao: "PARTICIPANTE",
        },
        _count: {
          _all: true,
          familia: true,
        },
        orderBy: {
          familia: "asc",
        },
      });

      // Agrupa registros sem família como "Não classificados"
      const familyCounts = data.reduce(
        (acc, { familia, _count }) => {
          const key = familia ?? "Não classificados"; // Define 'Não classificados' para null
          acc[key] = (acc[key] ?? 0) + _count._all;
          return acc;
        },
        {} as Record<string, number>,
      );

      const chart = Object.entries(familyCounts).map(([family, registers]) => ({
        family:
          family === "Não classificados"
            ? "Não classificados"
            : `Família ${family}`,
        registers,
      }));

      return chart;
    }),

  downloadRegistersCSV: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
        status: z.string().optional(),
        checkin: z.boolean().optional(),
        tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"]),
        fields: z.array(z.string()).optional(),
        search: PaginationInscricaoSchema.shape.search,
        filters: PaginationInscricaoSchema.shape.filters,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fields =
        input.fields?.filter(
          (field) => !["index", "actions", "classificacaoIMC"].includes(field),
        ) ?? [];

      // Substitui 'idade' por 'dataNascimento' e 'spouseAge' por 'spouseBirthDate' se presentes
      const processField = (field: string): string => {
        if (field === "idade") return "dataNascimento";
        if (field === "spouseAge") return "spouseBirthDate";
        return field;
      };

      const processedFields = fields.map(processField);

      const select = processedFields.reduce(
        (acc, field) => {
          acc[field] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      const dynamicFilters = setDynamicFilters(input.filters);

      const result = await ctx.db.inscricao.findMany({
        select: {
          ...select,
          vehicle: {
            select: {
              name: true,
              identifier: true,
              type: true,
            },
          },
        },
        where: {
          eventoId: input.eventoId,
          tipoInscricao: input.tipoInscricao,
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.checkin ? { checkin: input.checkin } : {}),
          ...dynamicFilters,
          ...(input.search
            ? {
                OR: [
                  { nome: { contains: input.search, mode: "insensitive" } },
                  { cpf: { contains: input.search } },
                  ...(input.tipoInscricao === "SERVIR"
                    ? [{ nrLgnd: { contains: input.search } }]
                    : []),
                ],
              }
            : {}),
        },
        orderBy: [{ familia: "asc" }, { nome: "asc" }],
      });

      const data = formatedDataToCSVTable(result);

      const headers = input.fields
        ?.filter((field) => !["actions"].includes(field))
        ?.map((field) => {
          const customLabel = fieldHeaderLabelMap[field]?.toUpperCase();
          const defaultLabel = field
            .replace(/([A-Z])/g, " $1")
            .replaceAll("_", " ")
            .toUpperCase()
            .trim();

          return {
            key: field,
            label: customLabel ?? defaultLabel,
          };
        });

      return {
        data,
        headers,
      };
    }),

  getRegisterWithVehicleId: protectedProcedure
    .input(
      z.object({
        vehicleId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const register = await ctx.db.inscricao.findFirst({
        select: {
          vehicleId: true,
        },
        where: {
          vehicleId: input.vehicleId,
        },
      });

      if (register) return true;
      return false;
    }),

  updateConfirmedSubscriptionWithBoardingPlan: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        eventoId: z.string(),
        vehicleId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, eventoId, vehicleId } = input;
      await ctx.db.$transaction(async (tx) => {
        const currentRegistration = await tx.inscricao.findUnique({
          where: { id, eventoId },
          select: { vehicleId: true, status: true },
        });

        if (
          !currentRegistration ||
          currentRegistration.status !== "CONFIRMADA"
        ) {
          throw new Error("Inscrição não está confirmado");
        }

        const previousVehicleId = currentRegistration.vehicleId;
        const sameVehicle = vehicleId === previousVehicleId;

        if (sameVehicle) {
          return { success: true };
        }

        const updated =
          vehicleId !== undefined
            ? { vehicle: { connect: { id: vehicleId } } }
            : { vehicle: { disconnect: true } };

        await tx.inscricao.update({
          where: { id, eventoId },
          data: updated,
          select: { id: true },
        });

        if (vehicleId !== undefined) {
          await tx.vehicle.update({
            where: { id: vehicleId, eventId: eventoId },
            data: { usedCapacity: { increment: 1 } },
            select: { usedCapacity: true },
          });
        }

        if (previousVehicleId) {
          await tx.vehicle.update({
            where: { id: previousVehicleId },
            data: { usedCapacity: { decrement: 1 } },
            select: { usedCapacity: true },
          });
        }

        return { success: true };
      });
    }),

  getUniqueColumnValueToFilter: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
        tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"]),
        status: z.string().optional(),
        checkin: z.boolean().optional(),
        columns: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { eventoId, status, checkin, tipoInscricao } = input;
      const columns = input.columns as [keyof Inscricao];

      const data = await Promise.all(
        columns.map(async (column) => {
          const uniqueValues = await ctx.db.inscricao.findMany({
            select: { [column]: true },
            distinct: [column],
            where: {
              eventoId,
              tipoInscricao,
              ...(status ? { status } : {}),
              ...(checkin ? { checkin } : {}),
            },
            orderBy: { [column]: "asc" },
          });

          return {
            column: column,
            options: uniqueValues.map((item) => String(item[column])),
          };
        }),
      );

      return Object.fromEntries(
        data.map(({ column, options }) => [column, options]),
      );
    }),

  getAllParticipantsAndLegendaryFamilies: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const registers = await ctx.db.inscricao.findMany({
        select: {
          id: true,
          familia: true,
          nome: true,
          lgnd_funcao: true,
          nrLgnd: true,
          vehicleId: true,
          tipoInscricao: true,
          vehicle: {
            select: {
              type: true,
            },
          },
        },
        orderBy: { familia: "asc" },
        where: { eventoId: input.eventId, status: "CONFIRMADA" },
      });

      if (!registers.length) throw Error("Não encontramos dados");

      const familiesMap = new Map<
        string,
        { count: number; vehicleId: string | null }
      >();

      registers
        .filter((reg) => reg.tipoInscricao === "PARTICIPANTE" && reg.familia)
        .forEach((reg) => {
          if (!reg.familia) return;
          const key = reg.familia.toString();
          if (!familiesMap.has(key)) {
            familiesMap.set(key, {
              count: 1,
              vehicleId: reg.vehicleId ?? null,
            });
          } else {
            const family = familiesMap.get(key)!;
            family.count += 1;

            if (!family.vehicleId && reg.vehicleId) {
              family.vehicleId = reg.vehicleId;
            }
          }
        });

      const participants = Array.from(familiesMap.entries()).map(
        ([id, data]) => ({
          id,
          name: `Família ${id}`,
          participants: data.count,
          vehicleId: data.vehicleId,
          type: "PARTICIPANTE",
        }),
      );

      const legendary = registers
        .filter((reg) => reg.tipoInscricao === "SERVIR")
        .filter((reg) => reg.vehicle?.type !== "CAR")
        .map((reg) => ({
          id: reg.id,
          name: reg.nome,
          identifier: reg.nrLgnd,
          service: reg.lgnd_funcao ?? null,
          family: reg.familia ?? null,
          vehicleId: reg.vehicleId ?? null,
          type: reg.tipoInscricao,
        }))
        .sort((a, b) => {
          if (a.service === null) return 1;
          if (b.service === null) return -1;
          if (a.service !== b.service) {
            return String(a.service).localeCompare(String(b.service));
          }
        });

      const result = [];

      result.push(...participants, ...legendary);

      return result;
    }),

  getAllLegendary: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.inscricao.findMany({
        where: {
          eventoId: input.eventId,
          tipoInscricao: "SERVIR",
          status: "CONFIRMADA",
        },
        select: {
          id: true,
          nome: true,
          nrLgnd: true,
          lgnd_funcao: true,
          familia: true,
          vehicleId: true,
        },
      });

      if (!data.length) throw Error("Não encontramos dados");

      const sortedData = data.slice().sort((a, b) => {
        if (a.lgnd_funcao === null) return 1;
        if (b.lgnd_funcao === null) return -1;
        if (a.lgnd_funcao !== b.lgnd_funcao) {
          return String(a.lgnd_funcao).localeCompare(String(b.lgnd_funcao));
        }
        if (a.familia === null) return 1;
        if (b.familia === null) return -1;
        return String(a.familia).localeCompare(String(b.familia));
      });

      return sortedData.map((item) => ({
        id: item.id,
        name: item.nome,
        family: item.familia,
        identifier: item.nrLgnd,
        service: item.lgnd_funcao,
        vehicleId: item.vehicleId,
      }));
    }),

  updateParticipantsWithVehicle: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        boarding: z.array(
          z.object({
            vehicleId: z.string(),
            users: z.array(
              z.object({
                id: z.string(),
                type: z.enum(["PARTICIPANTE", "SERVIR"]),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, boarding } = input;

      const allocated = boarding.filter(
        ({ vehicleId }) => vehicleId !== "unallocated",
      );
      const unallocated = boarding.find(
        ({ vehicleId }) => vehicleId === "unallocated",
      );

      return await ctx.db.$transaction(async (tx) => {
        const embarkedResults = await Promise.all(
          allocated.map(async ({ vehicleId, users }) => {
            const familiesNumber = users
              .filter((user) => user.type === "PARTICIPANTE")
              .map((user) => Number(user.id));

            const userIds = users
              .filter((user) => user.type === "SERVIR")
              .map((user) => user.id);

            if (familiesNumber.length === 0 && userIds.length === 0) {
              await tx.vehicle.update({
                where: { id: vehicleId },
                data: { usedCapacity: 0 },
              });

              return { vehicleId, usersCount: 0 };
            }

            const [familiesUpdated, legendaryUpdated] = await Promise.all([
              tx.inscricao.updateMany({
                where: {
                  tipoInscricao: "PARTICIPANTE",
                  familia: { in: familiesNumber },
                  eventoId: eventId,
                },
                data: { vehicleId },
              }),

              tx.inscricao.updateMany({
                where: {
                  id: { in: userIds },
                  tipoInscricao: "SERVIR",
                  eventoId: eventId,
                },
                data: { vehicleId },
              }),
            ]);

            const usersCount = familiesUpdated.count + legendaryUpdated.count;

            await tx.vehicle.update({
              where: { id: vehicleId, eventId },
              data: { usedCapacity: usersCount },
            });

            return { vehicleId, usersCount };
          }),
        );

        const disembarked = { unallocated: true, usersCount: 0 };

        if (unallocated) {
          const familiesNumber = unallocated.users
            .filter((user) => user.type === "PARTICIPANTE")
            .map((user) => Number(user.id));

          const userIds = unallocated.users
            .filter((user) => user.type === "SERVIR")
            .map((user) => user.id);

          const [familiesUpdated, legendaryUpdated] = await Promise.all([
            tx.inscricao.updateMany({
              where: {
                tipoInscricao: "PARTICIPANTE",
                familia: { in: familiesNumber },
                eventoId: eventId,
              },
              data: { vehicleId: null },
            }),

            tx.inscricao.updateMany({
              where: {
                id: { in: userIds },
                tipoInscricao: "SERVIR",
                eventoId: eventId,
              },
              data: { vehicleId: null },
            }),
          ]);

          disembarked.usersCount =
            familiesUpdated.count + legendaryUpdated.count;
        }

        const totalBoarding = embarkedResults.reduce(
          (sum, { usersCount }) => sum + usersCount,
          0,
        );

        return {
          embarked: embarkedResults,
          disembarked,
          totalBoarding,
        };
      });
    }),

  updateParticipantsWithVehicleWithInngest: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        boarding: z.array(
          z.object({
            vehicleId: z.string(),
            users: z.array(
              z.object({
                id: z.string(),
                type: z.enum(["PARTICIPANTE", "SERVIR"]),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { eventId, boarding } = input;

      const allocated = boarding.filter(
        ({ vehicleId }) => vehicleId !== "unallocated",
      );

      const unallocated = boarding.find(
        ({ vehicleId }) => vehicleId === "unallocated",
      );

      await inngest.send({
        name: EVENTS_NAME.CREATE_BOARDING_PLAN_PARTICIPANTS,
        data: { eventId, boarding: { allocated, unallocated } },
      });

      return { status: "processing", message: "boarding plan process started" };
    }),

  processAllocatedVehicles: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        allocated: z.array(
          z.object({
            vehicleId: z.string(),
            users: z.array(
              z.object({
                type: z.enum(["PARTICIPANTE", "SERVIR"]),
                id: z.string(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, allocated } = input;

      const results = await Promise.all(
        allocated.map(async ({ vehicleId, users }) => {
          const familiesNumber = users
            .filter((user) => user.type === "PARTICIPANTE")
            .map((user) => Number(user.id));

          const userIds = users
            .filter((user) => user.type === "SERVIR")
            .map((user) => String(user.id));

          if (familiesNumber.length === 0 && userIds.length === 0) {
            await ctx.db.vehicle.update({
              where: { id: vehicleId },
              data: { usedCapacity: 0 },
            });
            return { vehicleId, usersCount: 0 };
          }

          const [familiesUpdated, legendaryUpdated] = await Promise.all([
            ctx.db.inscricao.updateMany({
              where: {
                tipoInscricao: "PARTICIPANTE",
                familia: { in: familiesNumber },
                eventoId: eventId,
              },
              data: { vehicleId },
            }),

            ctx.db.inscricao.updateMany({
              where: {
                id: { in: userIds },
                tipoInscricao: "SERVIR",
                eventoId: eventId,
              },
              data: { vehicleId },
            }),
          ]);

          const usersCount = familiesUpdated.count + legendaryUpdated.count;

          await ctx.db.vehicle.update({
            where: { id: vehicleId, eventId },
            data: { usedCapacity: usersCount },
          });

          return { vehicleId, usersCount };
        }),
      );
      return results;
    }),

  processUnallocatedVehicles: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        unallocated: z.object({
          vehicleId: z.string(),
          users: z.array(
            z.object({
              id: z.string(),
              type: z.enum(["PARTICIPANTE", "SERVIR"]),
            }),
          ),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, unallocated } = input;

      return ctx.db.$transaction(async (tx) => {
        const disembarked = { unallocated: true, usersCount: 0 };

        const familiesNumber = unallocated.users
          .filter((user) => user.type === "PARTICIPANTE")
          .map((user) => Number(user.id));

        const userIds = unallocated.users
          .filter((user) => user.type === "SERVIR")
          .map((user) => user.id);

        const [familiesUpdated, legendaryUpdated] = await Promise.all([
          tx.inscricao.updateMany({
            where: {
              tipoInscricao: "PARTICIPANTE",
              familia: { in: familiesNumber },
              eventoId: eventId,
            },
            data: { vehicleId: null },
          }),

          tx.inscricao.updateMany({
            where: {
              id: { in: userIds },
              tipoInscricao: "SERVIR",
              eventoId: eventId,
            },
            data: { vehicleId: null },
          }),
        ]);

        disembarked.usersCount = familiesUpdated.count + legendaryUpdated.count;
        return disembarked;
      });
    }),

  updateLegendaryWithVehicle: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        boarding: z.array(
          z.object({
            vehicleId: z.string(),
            users: z.array(
              z.object({
                id: z.string(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, boarding } = input;

      const allocated = boarding.filter(
        ({ vehicleId }) => vehicleId !== "unallocated",
      );
      const unallocated = boarding.find(
        ({ vehicleId }) => vehicleId === "unallocated",
      );

      const report: {
        vehicles: { vehicleId: string; usersCount: number }[];
        unallocated: { usersCount: number };
      } = {
        vehicles: [],
        unallocated: { usersCount: 0 },
      };

      await ctx.db.$transaction(async (tx) => {
        for (const { vehicleId, users } of allocated) {
          const userIds = users.map((user) => user.id);
          if (userIds.length === 0) {
            await tx.vehicle.update({
              where: {
                id: vehicleId,
              },
              data: {
                usedCapacity: userIds.length,
              },
            });

            report.vehicles.push({
              vehicleId,
              usersCount: userIds.length,
            });
            continue;
          }

          await tx.inscricao.updateMany({
            where: {
              id: { in: userIds },
              eventoId: eventId,
            },
            data: {
              vehicleId,
            },
          });

          await tx.vehicle.update({
            where: {
              id: vehicleId,
            },
            data: {
              usedCapacity: users.length,
            },
          });

          report.vehicles.push({
            vehicleId,
            usersCount: users.length,
          });
        }

        if (unallocated) {
          const usersId = unallocated.users.map((user) => user.id);

          await tx.inscricao.updateMany({
            where: {
              id: { in: usersId },
              eventoId: eventId,
            },
            data: {
              vehicleId: null,
            },
          });

          report.unallocated = {
            usersCount: usersId.length,
          };
        }
      });

      return {
        sucess: true,
        report,
      };
    }),

  cleanBoardingPlanWhenFamiliesChange: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId } = input;

      return await ctx.db.$transaction(async (tx) => {
        const registers = await tx.inscricao.findMany({
          select: {
            id: true,
            vehicle: { select: { id: true, name: true, type: true } },
          },
          where: {
            tipoInscricao: "PARTICIPANTE",
            eventoId: eventId,
            vehicleId: { not: null },
            vehicle: {
              type: "BUS",
            },
          },
        });

        const groupedMap = registers.reduce(
          (acc, curr) => {
            if (!curr.vehicle) return acc;

            const vehicleId = curr.vehicle.id;
            const userId = curr.id;

            if (!acc[vehicleId]) {
              acc[vehicleId] = { vehicleId, users: [] };
            }

            acc[vehicleId].users.push(userId);

            return acc;
          },
          {} as Record<string, { vehicleId: string; users: string[] }>,
        );

        const grouped = Object.values(groupedMap).map((group) => ({
          ...group,
          userCount: group.users.length,
        }));

        const userIds = registers.map((r) => r.id);

        await tx.inscricao.updateMany({
          where: {
            id: { in: userIds },
          },
          data: {
            vehicleId: null,
          },
        });

        for (const { vehicleId, userCount } of grouped) {
          const vehiclesUpdated = await tx.vehicle.update({
            where: { id: vehicleId, eventId },
            data: { usedCapacity: { decrement: userCount } },
          });
        }
      });
    }),

  getBoardingPlanResult: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { eventId } = input;

      const vehicles = await ctx.db.vehicle.findMany({
        where: { eventId },
        include: {
          registration: {
            select: {
              familia: true,
              nome: true,
              tipoInscricao: true,
              lgnd_funcao: true,
            },
            where: { eventoId: eventId },
            orderBy: [{ familia: "asc" }],
          },
        },
      });

      const formattedData = vehicles.map((vehicle) => {
        const registers = [...vehicle.registration].sort((a, b) => {
          const aIsLegend = a.lgnd_funcao ? 0 : 1;
          const bIsLegend = b.lgnd_funcao ? 0 : 1;

          if (aIsLegend !== bIsLegend) return aIsLegend - bIsLegend;
          return a.familia?.toString().localeCompare(String(b.familia));
        });

        return {
          vehicle: {
            id: vehicle.id,
            name: vehicle.name,
            identifier: vehicle.identifier,
            plate: vehicle.plate,
            owner: vehicle.owner,
            totalCapacity: vehicle.totalCapacity ?? 0,
            usedCapacity: vehicle.usedCapacity ?? 0,
          },
          registers,
        };
      });

      return formattedData;
    }),
});
