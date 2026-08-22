import {
  createCustomer,
  createPayment,
  getCustomerByCpf,
  getCustomerChargesAtAsaas,
  getPixQrCode,
} from "@/lib/actions/asaas";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { generateCheckInCode } from "@/lib/utils/generateCheckInCode";
import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";
import { parse } from "date-fns";
import { convertToBasisPoint } from "@/lib/utils/basisPoint";
import {
  buildPaymentRequest,
  buildPixChargeRequest,
} from "@/server/utils/buildPaymentRequest";
import { sendNotificationWhenRegisterConfirmedByInngest } from "@/lib/utils/sendNotificationWhenRegisterConfirmedByInngest";

export const chargeAsaasSchema = z.object({
  id: z.string(),
  customer: z.string(),
  status: z.string(),
  value: z.number(),
  netValue: z.number(),
  description: z.string(),
  dateCreated: z.string(),
  dueDate: z.string(),
  billingType: z.enum(["PIX", "CREDIT_CARD"]),
  installment: z.string(),
  installmentNumber: z.number(),
  invoiceUrl: z.string(),
  invoiceNumber: z.string(),
  externalReference: z.string(),
  discount: z.object({
    value: z.number(),
    limitDate: z.string().optional(),
    dueDateLimitDays: z.number(),
    type: z.literal("FIXED"),
  }),
});

export const asaasCustomerRequestSchema = z.object({
  name: z.string(),
  cpfCnpj: z.string(),
  email: z.string(),
  phone: z.string(),
  addressNumber: z.string(),
  postalCode: z.string(),
  externalReference: z.string().optional(),
  notificationDisabled: z.boolean().optional(),
});

export const eventInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  topNumber: z.number(),
});

export const paymentAmountsSchema = z.object({
  eventValue: z.number(),
  installment: z.number(),
  valuePerInstallment: z.number(),
  discount: z.number(),
  fee: z.number(),
  totalValue: z.number(),
});

export const cardInfoSchema = z.object({
  holderName: z.string(),
  number: z.string(),
  expiryMonth: z.string(),
  expiryYear: z.string(),
  ccv: z.string(),
});

export const paymentsRoute = createTRPCRouter({
  getRecentCustomerPaymentsByReferenceAsaas: publicProcedure
    .input(
      z.object({
        cpfCnpj: z.string(),
        registerId: z.string(),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { cpfCnpj, registerId, eventId } = input;
      const customer = await getCustomerByCpf(cpfCnpj);

      if (!customer)
        return { chargeAlreadyCreated: undefined, chargeAlreadyPaid: false };

      const externalReference = {
        inscricaoId: registerId,
        eventoId: eventId,
      };

      const JSONFormat = JSON.stringify(externalReference);

      const allPaymentsCreatedFromTheCustomer = await getCustomerChargesAtAsaas(
        customer?.id,
        JSONFormat,
      );

      const chargeAlreadyCreated = allPaymentsCreatedFromTheCustomer?.find(
        (payment) => {
          const chargeNotPaid =
            payment.status === "CREATED" || payment.status === "PENDING";
          const billingTypeCreditCard = payment.billingType === "CREDIT_CARD";
          return billingTypeCreditCard && chargeNotPaid;
        },
      );

      const confirmedPayment = allPaymentsCreatedFromTheCustomer?.find(
        (payment) => {
          return payment.status === "CONFIRMED";
        },
      );

      return {
        chargeAlreadyCreated,
        chargeAlreadyPaid: !!confirmedPayment,
      };
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
      const { eventInfo, eventValue, registerId, confirmedPayment } = input;
      const totalValuePaid =
        confirmedPayment.installmentNumber * confirmedPayment.value;

      const checkinCode = generateCheckInCode();

      await ctx.db.inscricao.update({
        where: {
          id: registerId,
          eventoId: eventInfo.id,
        },
        data: {
          status: ENUM_STATUS.CONFIRMADA,
          pagamento_status: ENUM_PAYMENT_STATUS.CREDIT_CARD_PAYMENT_COMPLETED,
          pagamento_data: parse(
            confirmedPayment.dateCreated,
            "yyyy-MM-dd",
            new Date(),
          ),
          metodo_pagamento: "CARTAO",
          pagamento_integracao_service: "ASAAS",
          pagamento_integracao_status: confirmedPayment.status,
          pagamento_value_per_installment: convertToBasisPoint(
            confirmedPayment.value,
          ),
          pagamento_top_value: convertToBasisPoint(eventValue),
          pagamento_discount_value: convertToBasisPoint(
            confirmedPayment.discount.value,
          ),
          pagamento_installment: confirmedPayment.installmentNumber,
          pagamento_total_value: convertToBasisPoint(totalValuePaid),
          pagamento_link_url: confirmedPayment.invoiceUrl,
          pagamento_charge_id: confirmedPayment.installment,
          checkinCode,
        },
      });
    }),

  createCreditCardPaymentAndUpdateRegister: publicProcedure
    .input(
      z.object({
        registerId: z.string(),
        coupon: z.object({ id: z.string(), code: z.string() }).optional(),
        eventInfo: eventInfoSchema,
        paymentAmounts: paymentAmountsSchema,
        cardInfo: cardInfoSchema,
        customerInfo: asaasCustomerRequestSchema,
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
        const registerUpdated = await tx.inscricao.update({
          where: { id: registerId, eventoId: eventInfo.id },
          data: {
            status: ENUM_STATUS.AGUARDANDO_PAGAMENTO,
            pagamento_status: ENUM_PAYMENT_STATUS.PAGAMENTO_CARTAO_PENDENTE,
            metodo_pagamento: "CARTAO",
            pagamento_integracao_service: "ASAAS",
            pagamento_installment: paymentAmounts.installment,
            pagamento_value_per_installment: paymentAmounts.valuePerInstallment,
            pagamento_total_value: convertToBasisPoint(
              paymentAmounts.totalValue,
            ),
            pagamento_fee_card: convertToBasisPoint(paymentAmounts.fee),
            pagamento_top_value: convertToBasisPoint(paymentAmounts.eventValue),
            pagamento_discount_value: convertToBasisPoint(
              paymentAmounts.discount,
            ),
            ...(coupon
              ? { pagamento_couponValue: coupon.code }
              : { pagamento_couponValue: "none" }),
          },
        });

        if (coupon) {
          await tx.cupomUse.create({
            data: {
              inscricaoId: registerId,
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
        registerType: updateRegisterResult.tipoInscricao as
          | "PARTICIPANTE"
          | "SERVIR",
        eventInfo,
        registerId,
        paymentAmounts,
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

  createPixCharge: publicProcedure
    .input(
      z.object({
        registerId: z.string(),
        cpf: z.string(),
        registerType: z.enum(["PARTICIPANTE", "SERVIR"]),
        coupon: z
          .object({ id: z.string().optional(), code: z.string().optional() })
          .optional(),
        eventInfo: eventInfoSchema,
        paymentAmounts: paymentAmountsSchema.pick({
          totalValue: true,
          eventValue: true,
          discount: true,
          fee: true,
        }),
        customerInfo: asaasCustomerRequestSchema.pick({
          name: true,
          email: true,
          cpfCnpj: true,
          phone: true,
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        registerId,
        cpf,
        registerType,
        coupon,
        eventInfo,
        paymentAmounts,
        customerInfo,
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
        paymentAmounts,
        registerType,
      });

      const response = await createPayment(payload, customer.id);
      const qrCode = await getPixQrCode(response.id);

      const charge = {
        ...response,
        ...qrCode,
      };

      const fields = {
        pagamento_discount_value: convertToBasisPoint(paymentAmounts.discount),
        pagamento_fee_card: convertToBasisPoint(paymentAmounts.fee),
        pagamento_top_value: convertToBasisPoint(paymentAmounts.eventValue),
        pagamento_total_value: convertToBasisPoint(paymentAmounts.totalValue),
        pagamento_installment: 0,
        pagamento_value_per_installment: 0,
      };

      if (coupon?.id && coupon?.code) {
        await ctx.db.$transaction(async (tx) => {
          if (coupon.id) {
            await tx.cupomUse.create({
              data: {
                inscricaoId: registerId,
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

          await tx.inscricao.update({
            where: { id: registerId, eventoId: eventInfo.id },
            data: {
              pagamento_couponValue: coupon.code,
              ...fields,
            },
          });
        });
      } else {
        await ctx.db.inscricao.update({
          where: { id: registerId, eventoId: eventInfo.id },
          data: {
            pagamento_couponValue: "none",
            ...fields,
          },
        });
      }

      return charge;
    }),

  updateRegisterWithCouponOff: publicProcedure
    .input(
      z.object({
        registerId: z.string(),
        eventId: z.string(),
        paymentAmounts: paymentAmountsSchema.pick({
          totalValue: true,
          eventValue: true,
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

        await tx.cupomUse.create({
          data: {
            cupomId: couponUsed.id,
            eventoId: eventId,
            inscricaoId: registerId,
            dataUtilizacao: new Date(),
          },
        });

        const checkinCode = generateCheckInCode();

        const registerUpdated = await tx.inscricao.update({
          include: {
            evento: {
              select: {
                id: true,
                titulo: true,
                pista: true,
                topNumero: true,
                dataFim: true,
                dataInicio: true,
                linkWhatsappGrupoParticipante: true,
                linkWhatsappGrupoServir: true,
                type: true,
              },
            },
          },
          where: { id: registerId, eventoId: eventId },
          data: {
            status: ENUM_STATUS.CONFIRMADA,
            checkinCode,
            pagamento_status: ENUM_PAYMENT_STATUS.GRATUITO,
            pagamento_couponValue: couponUsed.codigo,
            pagamento_top_value: convertToBasisPoint(paymentAmounts.eventValue),
            pagamento_discount_value: convertToBasisPoint(
              paymentAmounts.discount,
            ),
            pagamento_total_value: convertToBasisPoint(
              paymentAmounts.totalValue,
            ),
            pagamento_fee_card: convertToBasisPoint(paymentAmounts.fee),
            metodo_pagamento: "CUPOM_GRATUITO",
            pagamento_integracao_service: undefined,
          },
        });

        await sendNotificationWhenRegisterConfirmedByInngest({
          event: registerUpdated.evento,
          register: registerUpdated,
        });

        return registerUpdated;
      });
    }),
});
