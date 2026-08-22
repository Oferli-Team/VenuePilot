import {
  createCustomer,
  createPayment,
  getCustomerByCpf,
  getPixQrCode,
} from "@/lib/actions/asaas";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";
import {
  convertFromBasisPoint,
  convertToBasisPoint,
} from "@/lib/utils/basisPoint";
import {
  buildPaymentRequest,
  buildPixChargeRequest,
} from "@/server/utils/buildPaymentRequest";
import { generateCheckInCode } from "@/lib/utils/generateCheckInCode";
import { StatusEnum } from "./schema";
import { MANADA_DAY } from "@/app/manadaday/participar/constant";
import {
  asaasCustomerRequestSchema,
  cardInfoSchema,
  chargeAsaasSchema,
  eventInfoSchema,
  paymentAmountsSchema,
} from "./payments";
import { parse } from "date-fns";
import { sendNotificationWhenRegisterConfirmedByInngest } from "@/lib/utils/sendNotificationWhenRegisterConfirmedByInngest";
import { type $Enums } from "@prisma/client";
import { calcFee } from "@/lib/utils/calcPlatformFee";
import { type ChartPaymentMethodType } from "@/app/_components/dashboard/chart-payment-method";
import { type ChartCupomDescontoType } from "@/app/_components/dashboard/chart-cupom-desconto";
import { buildRegisterSummary } from "@/lib/utils/dashboard";

const createRegister = z.object({
  eventoId: z.string(),
  name: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().length(11),
  phone: z.string(),
  isLegendary: z.boolean(),
  legendaryNumber: z.string().optional(),
  participants: z.array(
    z.object({
      name: z.string(),
      cpf: z.string().optional(),
      type: z.enum(["ADULT", "PAID_CHILD", "FREE_CHILD"]),
      value: z.number(),
    }),
  ),
});

export const manandaDayRoute = createTRPCRouter({
  createInitial: publicProcedure
    .input(createRegister)
    .mutation(async ({ ctx, input }) => {
      const { participants, ...data } = input;
      const register = await ctx.db.manadaDayRegister.create({
        data: {
          ...data,
          status: "INSCREVENDO",
        },
      });

      const participantsToCreate = participants.map((p) => ({
        name: p.name,
        cpf: p.cpf,
        type: p.type,
        value: p.value,
        manadaDayRegisterId: register.id,
      }));

      await ctx.db.participant.createMany({
        data: participantsToCreate,
      });

      return register.id;
    }),

  updateRegister: publicProcedure
    .input(
      z.object({
        id: z.string(),
        ...createRegister.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, participants, ...rest } = input;

      // Filter out undefined values
      const filteredData = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== undefined),
      );

      const updatedRegister = await ctx.db.manadaDayRegister.update({
        where: { id },
        data: filteredData,
      });

      // Se participantes foram enviados, verifica alterações
      if (participants && participants.length > 0) {
        const existingParticipants = await ctx.db.participant.findMany({
          where: { manadaDayRegisterId: id },
          orderBy: { id: "asc" }, // ordena para comparar corretamente
        });

        const inputSorted = [...participants].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        const existingSorted = [...existingParticipants].sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        const hasDifference =
          existingParticipants.length !== participants.length ||
          existingSorted.some((existing, index) => {
            const input = inputSorted[index];
            return (
              existing.name !== input?.name ||
              existing.cpf !== input?.cpf ||
              existing.type !== input?.type ||
              existing.value !== input?.value
            );
          });

        // Se houver diferença, atualiza os participantes
        if (hasDifference) {
          console.log("alterou dados, atualizar");
          await ctx.db.participant.deleteMany({
            where: { manadaDayRegisterId: id },
          });

          await ctx.db.participant.createMany({
            data: participants.map((p) => ({
              ...p,
              manadaDayRegisterId: id,
            })),
          });
        }
      }

      return updatedRegister;
    }),

  getRegisterById: publicProcedure
    .input(z.object({ id: z.string(), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.manadaDayRegister.findFirst({
        where: { id: input.id, eventoId: input.eventoId },
        include: {
          participants: {
            select: { name: true, cpf: true, type: true },
          },
          evento: {
            select: {
              id: true,
              pista: true,
              titulo: true,
              topNumero: true,
              linkWhatsappGrupoParticipante: true,
              linkWhatsappGrupoServir: true,
              dataFim: true,
              dataInicio: true,
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

  updateCheckIn: protectedProcedure
    .input(
      z.object({
        checkInIds: z.array(z.string()),
        uncheckInIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { checkInIds, uncheckInIds } = input;

      if (checkInIds.length > 0) {
        await ctx.db.participant.updateMany({
          where: {
            id: { in: checkInIds },
          },
          data: { checkin: true },
        });
      }

      if (uncheckInIds.length > 0) {
        await ctx.db.participant.updateMany({
          where: {
            id: { in: uncheckInIds },
          },
          data: { checkin: false },
        });
      }

      return { success: true };
    }),

  getAllManadaDayRegisters: publicProcedure
    .input(
      z.object({
        eventoId: z.string(),
        checkin: z.boolean().optional(),
        status: z
          .enum(["CONFIRMADA", "AGUARDANDO_PAGAMENTO", "INSCREVENDO"])
          .optional(),
        orderBy: z
          .array(
            z.object({
              name: z.enum(["asc", "desc"]).optional(),
              cpf: z.enum(["asc", "desc"]).optional(),
            }),
          )
          .default([{ name: "asc" }]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { checkin, status, eventoId, orderBy } = input;

      const data = await ctx.db.manadaDayRegister.findMany({
        where: {
          eventoId: eventoId,
          ...(checkin ? { checkin } : {}),
          ...(status ? { status } : {}),
        },
        orderBy,
        include: {
          participants: true,
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
      });

      return data;
    }),

  updateRegisterAlreadyPaid: publicProcedure
    .input(
      z.object({
        eventInfo: eventInfoSchema,
        registerId: z.string(),
        eventValue: z.number(),
        confirmedPayment: chargeAsaasSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventInfo, registerId, confirmedPayment } = input;
      const totalValuePaid =
        confirmedPayment.installmentNumber * confirmedPayment.value;

      await ctx.db.$transaction(async (tx) => {
        const register = await tx.manadaDayRegister.update({
          where: {
            id: registerId,
            eventoId: eventInfo.id,
          },
          include: {
            participants: { select: { id: true } },
          },
          data: {
            status: ENUM_STATUS.CONFIRMADA,
            paymentStatus: ENUM_PAYMENT_STATUS.PAGAMENTO_CARTAO_CONCLUIDO,
            paymentData: parse(
              confirmedPayment.dateCreated,
              "yyyy-MM-dd",
              new Date(),
            ),
            paymentMethod: "CARTAO",
            paymentIntegrationService: "ASAAS",
            paymentInstallment: confirmedPayment.installmentNumber,
            paymentValuePerInstallment: convertToBasisPoint(
              confirmedPayment.value,
            ),
            paymentTotalValue: convertToBasisPoint(totalValuePaid),
            paymentDiscount: convertToBasisPoint(
              confirmedPayment.discount.value,
            ),
            identifier: generateCheckInCode(),
            paymentLinkUrl: confirmedPayment.invoiceUrl,
            paymentChargeId: confirmedPayment.installment,
          },
        });

        await Promise.all(
          register.participants.map((participant) =>
            tx.participant.update({
              where: { id: participant.id },
              data: {
                checkinCode: generateCheckInCode(),
              },
            }),
          ),
        );
      });
    }),

  createPixCharge: publicProcedure
    .input(
      z.object({
        registerId: z.string(),
        cpf: z.string(),
        eventInfo: eventInfoSchema,
        paymentAmounts: paymentAmountsSchema.pick({
          totalValue: true,
          fee: true,
          discount: true,
        }),
        customerInfo: asaasCustomerRequestSchema.pick({
          name: true,
          email: true,
          cpfCnpj: true,
          phone: true,
        }),
        coupon: z
          .object({ id: z.string().optional(), code: z.string().optional() })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        registerId,
        cpf,
        eventInfo,
        paymentAmounts,
        customerInfo,
        coupon,
      } = input;

      let customer = await getCustomerByCpf(customerInfo.cpfCnpj);
      customer ??= await createCustomer({
        ...customerInfo,
        notificationDisabled: true,
      });

      if (!customer) {
        throw new Error("Não foi possível gerar cobrança, tente novamente.");
      }

      const payload = buildPixChargeRequest({
        registerId,
        cpf,
        eventInfo,
        paymentAmounts: {
          fee: paymentAmounts.fee,
          totalValue: paymentAmounts.totalValue,
          eventValue: 0,
          discount: paymentAmounts.discount,
        },
        registerType: "PARTICIPANTE",
      });

      const response = await createPayment(payload, customer.id);
      const qrCode = await getPixQrCode(response.id);

      const charge = {
        ...response,
        ...qrCode,
      };

      const fields = {
        paymentFeeCard: convertToBasisPoint(paymentAmounts.fee),
        paymentTotalValue: convertToBasisPoint(paymentAmounts.totalValue),
        paymentDiscount: convertToBasisPoint(paymentAmounts.discount),
      };

      if (coupon?.id && coupon?.code) {
        await ctx.db.$transaction(async (tx) => {
          if (coupon.id) {
            await tx.cupomUseManada.create({
              data: {
                manadaDayRegisterId: registerId,
                eventoId: eventInfo.id,
                dataUtilizacao: new Date(),
                cupomId: coupon.id,
              },
            });

            await tx.cupomDesconto.update({
              where: { id: coupon.id },
              data: { usadoCount: { increment: 1 } },
            });
          }

          await tx.manadaDayRegister.update({
            where: { id: registerId, eventoId: eventInfo.id },
            data: {
              ...fields,
              paymentCouponUsed: coupon.code,
            },
          });
        });
      } else {
        await ctx.db.manadaDayRegister.update({
          where: { id: registerId, eventoId: eventInfo.id },
          data: fields,
        });
      }

      return charge;
    }),

  createCreditCardPaymentAndUpdateRegister: publicProcedure
    .input(
      z.object({
        registerId: z.string(),
        eventInfo: eventInfoSchema,
        paymentAmounts: paymentAmountsSchema,
        cardInfo: cardInfoSchema,
        customerInfo: asaasCustomerRequestSchema,
        coupon: z.object({ id: z.string(), code: z.string() }).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        registerId,
        customerInfo,
        cardInfo,
        paymentAmounts,
        eventInfo,
        coupon,
      } = input;

      let customer = await getCustomerByCpf(customerInfo.cpfCnpj);

      customer ??= await createCustomer({
        ...customerInfo,
        notificationDisabled: true,
      });

      if (!customer) {
        return {
          success: false,
          payment: null,
          error: "Falha ao criar/encontrar customer no sistema de pagamento",
        };
      }

      const updateRegisterResult = await ctx.db.$transaction(async (tx) => {
        const registerUpdated = await tx.manadaDayRegister.update({
          where: { id: registerId, eventoId: eventInfo.id },
          data: {
            status: ENUM_STATUS.AGUARDANDO_PAGAMENTO,
            paymentStatus: ENUM_PAYMENT_STATUS.PAGAMENTO_CARTAO_PENDENTE,
            paymentMethod: "CARTAO",
            paymentIntegrationService: "ASAAS",
            paymentInstallment: paymentAmounts.installment,
            paymentValuePerInstallment: paymentAmounts.valuePerInstallment,
            paymentTotalValue: convertToBasisPoint(paymentAmounts.totalValue),
            paymentFeeCard: convertToBasisPoint(paymentAmounts.fee),
            paymentDiscount: convertToBasisPoint(paymentAmounts.discount),
            ...(coupon
              ? { paymentCouponUsed: coupon.code }
              : { paymentCouponUsed: "none" }),
          },
        });

        if (coupon) {
          await tx.cupomUseManada.create({
            data: {
              manadaDayRegisterId: registerId,
              eventoId: eventInfo.id,
              dataUtilizacao: new Date(),
              cupomId: coupon.id,
            },
          });

          await tx.cupomDesconto.update({
            where: { id: coupon.id },
            data: { usadoCount: { increment: 1 } },
          });
        }

        return registerUpdated;
      });

      if (!updateRegisterResult) {
        return {
          payment: null,
          error: "Falha ao atualizar status da inscrição",
        };
      }

      const paymentInfo = buildPaymentRequest({
        cpf: updateRegisterResult.cpf ?? "",
        registerType: "PARTICIPANTE",
        eventInfo,
        registerId,
        paymentAmounts: {
          ...paymentAmounts,
          eventValue: 0,
        },
        cardInfo,
        customerInfo: {
          ...customerInfo,
          notificationDisabled: false,
        },
      });

      const payment = await createPayment(paymentInfo, customer.id);

      if (!payment || payment.errors) {
        return {
          payment: null,
          error:
            payment?.errors?.[0]?.description || "Falha ao processar pagamento",
        };
      }

      return { payment };
    }),

  updateRegisterWithCouponOff: publicProcedure
    .input(
      z.object({
        registerId: z.string(),
        eventId: z.string(),
        paymentAmounts: paymentAmountsSchema.pick({
          totalValue: true,
          discount: true,
          fee: true,
        }),
        coupon: z.object({ id: z.string() }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { registerId, eventId, coupon, paymentAmounts } = input;

      return await ctx.db.$transaction(async (tx) => {
        const couponUsed = await tx.cupomDesconto.update({
          where: { id: coupon.id },
          data: { usadoCount: { increment: 1 } },
        });

        await tx.cupomUseManada.create({
          data: {
            cupomId: couponUsed.id,
            eventoId: eventId,
            manadaDayRegisterId: registerId,
            dataUtilizacao: new Date(),
          },
        });

        const identifier = generateCheckInCode();

        const registerUpdated = await tx.manadaDayRegister.update({
          include: {
            participants: {
              select: { id: true, name: true, type: true, cpf: true },
            },
            evento: {
              select: {
                id: true,
                titulo: true,
                type: true,
                dataFim: true,
                dataInicio: true,
              },
            },
          },
          where: { id: registerId, eventoId: eventId },
          data: {
            status: ENUM_STATUS.CONFIRMADA,
            identifier,
            paymentStatus: ENUM_PAYMENT_STATUS.GRATUITO,
            paymentCouponUsed: couponUsed.codigo,
            paymentDiscount: convertToBasisPoint(paymentAmounts.discount),
            paymentTotalValue: convertToBasisPoint(paymentAmounts.totalValue),
            paymentFeeCard: convertToBasisPoint(paymentAmounts.fee),
            paymentMethod: "CUPOM_GRATUITO",
            paymentIntegrationService: undefined,
          },
        });

        await Promise.all(
          registerUpdated.participants.map((participante) =>
            tx.participant.update({
              where: { id: participante.id },
              data: {
                checkinCode: generateCheckInCode(),
              },
            }),
          ),
        );

        const register = {
          id: registerUpdated.id,
          cpf: registerUpdated.cpf,
          status: registerUpdated.status,
          participants: registerUpdated.participants,
          nome: registerUpdated.name,
          celular: registerUpdated.phone,
          identifier,
          tipoInscricao: "",
          flags: [],
        };

        await sendNotificationWhenRegisterConfirmedByInngest({
          register,
          event: registerUpdated.evento,
        });

        return registerUpdated;
      });
    }),

  updatePaymentStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: StatusEnum,
        identifier: z.string().optional(),
        paymentStatus: z.enum([
          "CHARGE_CREATED",
          "CHARGE_COMPLETED",
          "TRANSACTION_REFUND_RECEIVED",
          "CHARGE_EXPIRED",
          "CREDIT_CARD_PAYMENT_COMPLETED",
          "PAYMENT_OVERDUE",
        ]),
        paymentIntegrationStatus: z.string(),
        paymentMethod: z.string(),
        paymentData: z.date(),
        paymentTotalValue: z.number().optional(),
        paymentFeeCard: z.number().optional(),
        paymentValuePerInstallment: z.string().optional(),
        paymentInstallment: z.number().optional(),
        paymentIntegrationService: z.enum(["WOOVI", "ASAAS"]),
        paymentChargeId: z.string().nullable().optional(),
        paymentLinkUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentRegister = await ctx.db.manadaDayRegister.findUnique({
        include: {
          participants: {
            select: {
              name: true,
              type: true,
              cpf: true,
            },
          },
        },
        where: { id: input.id },
      });

      if (!currentRegister) {
        throw new Error("Inscricao nao encontrada");
      }

      if (
        currentRegister.status === "CONFIRMADA" &&
        input.status !== "CANCELADA_PELO_CLIENTE"
      ) {
        return currentRegister;
      }

      // Define the update data
      const updateData = {
        status: input.status,
        identifier: input.identifier,
        paymentStatus: input.paymentStatus,
        paymentIntegrationStatus: input.paymentIntegrationStatus,
        paymentIntegrationService: input.paymentIntegrationService,
        paymentMethod: input.paymentMethod,
        paymentData: input.paymentData,
        paymentTotalValue: input.paymentTotalValue,
        paymentFeeCard: input.paymentFeeCard,
        ...(input?.paymentLinkUrl
          ? { paymentLinkUrl: input.paymentLinkUrl }
          : {}),
        ...(input?.paymentChargeId
          ? { paymentChargeId: input.paymentChargeId }
          : {}),
      };

      return await ctx.db.$transaction(async (tx) => {
        const register = await tx.manadaDayRegister.update({
          where: { id: input.id },
          include: {
            participants: {
              select: {
                name: true,
                type: true,
                cpf: true,
              },
            },
          },
          data: updateData,
        });

        if (input.status === "CONFIRMADA") {
          const participantes = await tx.participant.findMany({
            where: { manadaDayRegisterId: register.id },
          });

          await Promise.all(
            participantes.map((participante) =>
              tx.participant.update({
                where: { id: participante.id },
                data: {
                  checkinCode: generateCheckInCode(),
                },
              }),
            ),
          );
        }

        return register;
      });
    }),

  getRegisterByUserIdAndChargeId: publicProcedure
    .input(
      z.object({
        id: z.string(),
        eventId: z.string(),
        charge_id: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.manadaDayRegister.findFirst({
        where: {
          id: input.id,
          eventoId: input.eventId,
          paymentChargeId: input.charge_id,
        },
      });
    }),

  getRegisterByIdentifier: publicProcedure
    .input(z.object({ identifier: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.manadaDayRegister.findFirst({
        where: { identifier: input.identifier },
        select: {
          id: true,
          name: true,
          cpf: true,
          status: true,
          identifier: true,
          participants: {
            select: {
              id: true,
              name: true,
              checkinCode: true,
              cpf: true,
              type: true,
            },
          },
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

      const participants: {
        id: string;
        nome: string;
        cpf: string | null;
        tipoInscricao: string;
        status: string;
        checkinCode: string;
        hiddenroupWhatsAppButton: boolean;
      }[] = result?.participants?.map((participant) => {
        const participantType = {
          ["ADULT"]: MANADA_DAY.ticketsType.ADULT,
          ["PAID_CHILD"]: MANADA_DAY.ticketsType.PAID_CHILD,
          ["FREE_CHILD"]: MANADA_DAY.ticketsType.FREE_CHILD,
        };
        return {
          id: participant.id,
          nome: participant.name,
          cpf: participant.cpf,
          checkinCode: participant.checkinCode,
          status: result.status,
          tipoInscricao: participantType[participant.type],
          hiddenGroupWhatsAppButton: true,
        };
      });

      const data = {
        register: {
          id: result?.id,
          nome: result?.name,
          cpf: result?.cpf,
          tipoInscricao: "",
          status: result?.status,
          checkinCode: result?.identifier,
        },
        participants,
        event: {
          ...result?.evento,
        },
      };

      if (result) return data;
    }),

  updatedPaymentRefunded: publicProcedure
    .input(
      z.object({
        registerId: z.string(),
        status: z.enum(["CANCELADA_PELO_CLIENTE"]).nullable(),
        paymentStatus: z.enum(["TRANSACTION_REFUND_RECEIVED"]),
        paymentIntegrationStatus: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { registerId, ...updateData } = input;

      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(
          ([, value]) => value !== undefined || value !== null,
        ),
      );

      return ctx.db.manadaDayRegister.update({
        where: {
          id: registerId,
        },
        data: filteredData,
      });
    }),

  getConfirmedAndPendingRegistersDashoboard: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const totalParticipants = await ctx.db.participant.findMany({
        where: {
          manadaDayRegister: {
            eventoId: input.eventoId,
          },
        },
        select: {
          id: true,
          type: true,
          manadaDayRegister: {
            select: {
              status: true,
              paymentTotalValue: true,
              evento: {
                select: {
                  itopFee: true,
                },
              },
            },
          },
        },
      });

      const getTotal = (
        status: string[],
        type?: $Enums.MANADADAY_PARTICIPANT_TYPE,
      ) => {
        if (type) {
          const filtered = totalParticipants.filter(
            (reg) =>
              reg.type === type &&
              status.includes(reg.manadaDayRegister.status),
          ).length;
          return filtered;
        }

        const filtered = totalParticipants.filter((reg) =>
          status.includes(reg.manadaDayRegister.status),
        );

        return filtered.length;
      };

      const totalPending = getTotal([
        "AGUARDANDO_PAGAMENTO",
        "CANCELADA_TEMPO_EXPIRADO",
        "INSCREVENDO",
      ]);
      const totalAdult = getTotal(["CONFIRMADA"], "ADULT");
      const totalPaidChild = getTotal(["CONFIRMADA"], "PAID_CHILD");
      const totalFreeChild = getTotal(["CONFIRMADA"], "FREE_CHILD");

      return {
        totalRegisterConfirmed: totalAdult + totalPaidChild + totalFreeChild,
        totalRegisterPending: totalPending,
        totalAdult: totalAdult,
        totalPaidChild: totalPaidChild,
        totalFreeChild: totalFreeChild,
      };
    }),

  getAllPaymentMethodData: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allPayments = await ctx.db.manadaDayRegister.findMany({
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
        },
        select: {
          paymentMethod: true,
        },
      });

      const paymentByPix = allPayments.filter(
        (reg) => reg.paymentMethod === "PIX",
      ).length;
      const paymentByCreditCard = allPayments.filter(
        (reg) => reg.paymentMethod === "CARTAO",
      ).length;
      const paymentByFree = allPayments.filter(
        (reg) => reg.paymentMethod === "CUPOM_GRATUITO",
      ).length;

      const chart: ChartPaymentMethodType[] = [
        {
          inscricaoType: "Ingressos",
          pix: paymentByPix,
          creditCard: paymentByCreditCard,
          cupom: paymentByFree,
        },
      ];

      return { chart };
    }),

  getCheckinStateByCategory: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allParticipants = await ctx.db.participant.findMany({
        where: {
          manadaDayRegister: {
            status: "CONFIRMADA",
            eventoId: input.eventoId,
          },
        },
        select: {
          checkin: true,
          type: true,
        },
      });

      type Summary = {
        [key in $Enums.MANADADAY_PARTICIPANT_TYPE]?: {
          done: number;
          pending: number;
        };
      };

      const summary: Summary = {};

      for (const part of allParticipants) {
        const type = part.type;
        const isDone = part.checkin === true;

        if (!summary[type]) {
          summary[type] = { done: 0, pending: 0 };
        }

        if (isDone) {
          summary[type].done += 1;
        } else {
          summary[type].pending += 1;
        }
      }

      const registerChecked = allParticipants.filter(
        (reg) => reg.checkin === true,
      ).length;
      const registerUnChecked = allParticipants.filter(
        (reg) => !reg.checkin,
      ).length;

      return {
        summary,
        stats: {
          done: registerChecked,
          pending: registerUnChecked,
        },
      };
    }),

  getCupomsUsed: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cupomsUsed = await ctx.db.manadaDayRegister.groupBy({
        by: ["paymentCouponUsed"],
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
        },
        _count: {
          _all: true,
        },
        orderBy: {
          paymentCouponUsed: "asc",
        },
      });

      const data: ChartCupomDescontoType[] = cupomsUsed
        .filter(
          (cupom) =>
            cupom.paymentCouponUsed !== "none" &&
            cupom.paymentCouponUsed !== null,
        )
        .map((cupom) => {
          return {
            cupom: cupom.paymentCouponUsed!,
            usado: cupom._count._all,
          };
        });

      return data;
    }),

  getFinancialReport: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const evento = await ctx.db.evento.findFirst({
        where: { id: input.eventoId },
      });

      if (!evento) {
        throw new Error("Evento não encontrado");
      }

      const calcSales = async () => {
        const registers = await ctx.db.manadaDayRegister.findMany({
          where: {
            status: "CONFIRMADA",
            eventoId: evento.id,
          },
          select: {
            paymentTotalValue: true,
            paymentDiscount: true,
            paymentFeeCard: true,
            paymentStatus: true,
          },
        });

        const registersFree = registers.filter(
          (reg) => reg.paymentStatus === "GRATUITO",
        ).length;

        const registersWithDiscount = registers.filter(
          (reg) => reg.paymentDiscount! > 0 && reg.paymentStatus !== "GRATUITO",
        );
        const registersNoDiscount = registers.filter(
          (reg) => reg.paymentDiscount === 0,
        );

        // Calcula o valor total pago para registros com desconto
        const totalValuesWithDiscount = registersWithDiscount.map((reg) => {
          return reg.paymentTotalValue! - reg.paymentFeeCard!;
        });
        const totalPaidWithDiscount = totalValuesWithDiscount.reduce(
          (acc, curr) => acc + curr,
          0,
        );

        // Calcula o valor total pago para registros sem desconto
        const totalValuesNoDiscount = registersNoDiscount.map((reg) => {
          const topValue = reg.paymentTotalValue! - reg.paymentFeeCard!;
          return topValue;
        });
        const totalPaidFullValue = totalValuesNoDiscount.reduce(
          (acc, curr) => acc + curr,
          0,
        );

        return {
          totalSales: convertFromBasisPoint(
            totalPaidWithDiscount + totalPaidFullValue,
          ),
          totalSalesNoDiscount: {
            count: registersNoDiscount.length,
            value: convertFromBasisPoint(totalPaidFullValue),
          },
          totalSalesWithDiscount: {
            count: registersWithDiscount.length,
            value: convertFromBasisPoint(totalPaidWithDiscount),
          },
          totalSalesFree: {
            count: registersFree,
          },
        };
      };

      const registersPending = await ctx.db.manadaDayRegister.findMany({
        where: {
          AND: {
            OR: [
              { status: "CANCELADA_TEMPO_EXPIRADO" },
              { status: "AGUARDANDO_PAGAMENTO" },
              { status: "INSCREVENDO" },
            ],
          },
          eventoId: evento.id,
        },
        select: {
          paymentTotalValue: true,
          paymentFeeCard: true,
          participants: true,
        },
      });

      const result = await calcSales();
      const salesPending = registersPending.reduce((acc, reg) => {
        const total = reg.paymentTotalValue! - reg.paymentFeeCard!;
        return acc + total;
      }, 0);

      const data = [
        buildRegisterSummary(
          "Ingressos",
          result.totalSalesFree.count,
          result.totalSalesWithDiscount.count,
          result.totalSalesNoDiscount.count,
          result.totalSalesWithDiscount.value,
          result.totalSalesNoDiscount.value,
          result.totalSales,
          evento.itopFee ?? 5,
        ),
      ];

      return {
        report: data,
        salesPending: convertFromBasisPoint(
          calcFee(salesPending, evento.itopFee!),
        ),
        salesConfirmed: calcFee(result.totalSales, evento.itopFee!),
      };
    }),
});
