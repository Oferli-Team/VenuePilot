import {
  type ChartCheckin,
  type CheckinChartDataProps,
} from "@/components/dashboard/chart-checkin";
import { type ChartCupomDescontoType } from "@/components/dashboard/chart-cupom-desconto";
import { type ChartFamily } from "@/components/dashboard/chart-families";
import { type ChartPaymentMethodType } from "@/components/dashboard/chart-payment-method";
import { shirtSizesREM } from "@/lib/constants";
import type { ENUM_EVENT_TYPE } from "@/lib/enum";
import { convertFromBasisPoint } from "@/lib/utils/basisPoint";
import {
  calcTotalValuePending,
  calculateDashboardSummary,
  calcValueReceive,
} from "@/lib/utils/dashboard";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { Inscricao } from "@prisma/client";
import { z } from "zod";

export const dashboardRouter = createTRPCRouter({
  getConfirmedAndPendingRegistersByRegisterType: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const getRegistersConfirmed = async () => {
        return await ctx.db.inscricao.findMany({
          where: {
            eventoId: input.eventoId,
            status: "CONFIRMADA",
          },
        });
      };

      const getRegistersPending = async () => {
        return await ctx.db.inscricao.findMany({
          where: {
            eventoId: input.eventoId,
            status: { not: "CONFIRMADA" },
          },
        });
      };

      const [totalRegisterConfirmed, totalRegisterPending] = await Promise.all([
        getRegistersConfirmed(),
        getRegistersPending(),
      ]);

      const getTotalRegisterByRegisterType = (registers: Inscricao[]) => {
        const participants = registers.filter(
          (r) => r.tipoInscricao === "PARTICIPANTE",
        ).length;
        const certificate = registers.filter(
          (r) => r.tipoInscricao === "SERVIR" && r.lgndCertificado === true,
        ).length;
        const notCertificate = registers.filter(
          (r) => r.tipoInscricao === "SERVIR" && r.lgndCertificado === false,
        ).length;

        return {
          participants,
          certificate,
          notCertificate,
          total: participants + certificate + notCertificate,
        };
      };

      const {
        participants: participantsConfirmed,
        certificate: certificateConfirmed,
        notCertificate: notCertificateConfirmed,
        total: totalConfirmed,
      } = getTotalRegisterByRegisterType(totalRegisterConfirmed);

      const {
        participants: participantsPending,
        certificate: certificatePending,
        notCertificate: notCertificatePending,
        total: totalPending,
      } = getTotalRegisterByRegisterType(totalRegisterPending);

      const totalServeConfirmed =
        certificateConfirmed + notCertificateConfirmed;

      const totalServePending = certificatePending + notCertificatePending;

      return {
        totalRegistrationConfirmed: totalConfirmed,
        participantsConfirmed,
        serveConfirmed: totalServeConfirmed,
        serveCertificatedConfirmed: certificateConfirmed,
        serveNotCertificatedConfirmed: notCertificateConfirmed,
        totalRegistrationPending: totalPending,
        participantsPending,
        servePending: totalServePending,
        serveCertificatedPending: certificatePending,
        serveNotCertificatedPending: notCertificatePending,
      };
    }),

  getEventSalesData: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(), // Recebe o ID do evento como input
      }),
    )
    .query(async ({ ctx, input }) => {
      const evento = await ctx.db.evento.findFirst({
        where: { id: input.eventoId },
      });

      if (!evento) {
        throw new Error("Evento não encontrado");
      }

      const {
        totalReceived,
        totalReceivedParticipant,
        totalReceivedLgndCertificated,
        totalReceivedLgndNotCertificated,
      } = await calcValueReceive(ctx.db, evento.id, evento.itopFee ?? 1);

      return {
        totalReceived,
        servirReceived:
          totalReceivedLgndNotCertificated + totalReceivedLgndCertificated,
        participanteReceived: totalReceivedParticipant,
        lgndSemCertificadoReceived: totalReceivedLgndNotCertificated,
        lgndComCertificadoReceived: totalReceivedLgndCertificated,
      };
    }),

  getEventSalesPendingData: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(), // Recebe o ID do evento como input
      }),
    )
    .query(async ({ ctx, input }) => {
      const evento = await ctx.db.evento.findFirst({
        where: { id: input.eventoId },
      });

      if (!evento) {
        throw new Error("Evento não encontrado");
      }

      const itopFee = evento.itopFee ?? 1;

      const [
        totalparticipantePending,
        totalLgndComCertificadoPending,
        totalLgndSemCertificadoPending,
      ] = await Promise.all([
        calcTotalValuePending(
          ctx.db,
          evento.id,
          "PARTICIPANTE",
          null,
          evento.valorParticipante,
          itopFee,
        ),
        calcTotalValuePending(
          ctx.db,
          evento.id,
          "SERVIR",
          true,
          evento.valorParaLgndCertificados,
          itopFee,
        ),
        calcTotalValuePending(
          ctx.db,
          evento.id,
          "SERVIR",
          false,
          evento.valorParaObterCertificacao,
          itopFee,
        ),
      ]);

      const totalServirPending =
        totalLgndSemCertificadoPending + totalLgndComCertificadoPending;

      const totalPending = totalparticipantePending + totalServirPending;

      return {
        totalPending,
        totalServirPending,
        totalparticipantePending,
        totalLgndSemCertificadoPending,
        totalLgndComCertificadoPending,
      };
    }),

  getEventSalesDataToRelatorio: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(), // Recebe o ID do evento como input
      }),
    )
    .query(async ({ ctx, input }) => {
      const evento = await ctx.db.evento.findFirst({
        where: { id: input.eventoId },
      });

      if (!evento) {
        throw new Error("Evento não encontrado");
      }

      return calculateDashboardSummary(
        ctx.db,
        input.eventoId,
        evento.type as ENUM_EVENT_TYPE,
        evento.itopFee ?? 1,
      );
    }),

  reportByRegistersAndPayment: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const evento = await ctx.db.evento.findFirst({
        where: { id: input.eventId },
      });

      if (!evento) {
        throw new Error("Evento não encontrado");
      }

      const registers = await ctx.db.inscricao.findMany({
        where: {
          eventoId: input.eventId,
          status: "CONFIRMADA",
        },
        select: {
          cpf: true,
          nome: true,
          status: true,
          tipoInscricao: true,
          lgndCertificado: true,
          pagamento_status: true,
          metodo_pagamento: true,
          pagamento_couponValue: true,
          pagamento_discount_value: true,
          pagamento_top_value: true,
          obs: true,
          evento: {
            select: { type: true },
          },
        },
        orderBy: [{ tipoInscricao: "asc" }, { nome: "asc" }],
      });

      const registersWithTotalPaid = registers.map((r) => {
        const totalPaid = r.pagamento_top_value! - r.pagamento_discount_value!;
        return {
          ...r,
          pagamento_discount_value: convertFromBasisPoint(
            r.pagamento_discount_value!,
          ),
          pagamento_top_value: convertFromBasisPoint(r.pagamento_top_value!),
          totalPaid: convertFromBasisPoint(totalPaid),
        };
      });

      return registersWithTotalPaid;
    }),

  getAllRegisterCanceled: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allRegistersCanceled = await ctx.db.inscricao.findMany({
        where: {
          eventoId: input.eventId,
          status: "CANCELADA_PELO_CLIENTE",
        },
        select: {
          nome: true,
          cpf: true,
          status: true,
          tipoInscricao: true,
          pagamento_status: true,
          pagamento_link_url: true,
          reembolso_status: true,
          reembolso_description: true,
          reembolso_receipt: true,
          obs: true,
        },
      });

      const registersCanceled = allRegistersCanceled.filter(
        (reg) => !reg.reembolso_status || reg.reembolso_status === null,
      );

      const registersRefunded = allRegistersCanceled.filter(
        (reg) => reg.reembolso_status !== null,
      );

      return {
        refunded: {
          count: registersRefunded.length,
          registers: registersRefunded,
        },
        canceled: {
          count: registersCanceled.length,
          registers: registersCanceled,
        },
      };
    }),

  getPaymentMethodByRegisterType: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const getPaymentMethodByRegisterType = async (
        registerType: "PARTICIPANTE" | "SERVIR",
        method: "PIX" | "CARTAO" | "CUPOM_GRATUITO",
      ) => {
        return await ctx.db.inscricao.count({
          where: {
            eventoId: input.eventoId,
            tipoInscricao: registerType,
            metodo_pagamento: method,
            status: "CONFIRMADA",
          },
        });
      };

      const [
        participanteByPix,
        serveByPix,
        participanteByCreditCard,
        serveByCreditCard,
        participanteBy100OFF,
        serveBy100OFF,
      ] = await Promise.all([
        getPaymentMethodByRegisterType("PARTICIPANTE", "PIX"),
        getPaymentMethodByRegisterType("SERVIR", "PIX"),
        getPaymentMethodByRegisterType("PARTICIPANTE", "CARTAO"),
        getPaymentMethodByRegisterType("SERVIR", "CARTAO"),
        getPaymentMethodByRegisterType("PARTICIPANTE", "CUPOM_GRATUITO"),
        getPaymentMethodByRegisterType("SERVIR", "CUPOM_GRATUITO"),
      ]);

      const chart: ChartPaymentMethodType[] = [
        {
          inscricaoType: "Participante",
          pix: participanteByPix,
          creditCard: participanteByCreditCard,
          cupom: participanteBy100OFF,
        },
        {
          inscricaoType: "Servir",
          pix: serveByPix,
          creditCard: serveByCreditCard,
          cupom: serveBy100OFF,
        },
      ];

      const report = [
        {
          tipoInscricao: "Participar",
          pix: participanteByPix,
          creditCard: participanteByCreditCard,
          free: participanteBy100OFF,
          total:
            participanteByPix + participanteByCreditCard + participanteBy100OFF,
        },
        {
          tipoInscricao: "Servir",
          pix: serveByPix,
          creditCard: serveByCreditCard,
          free: serveBy100OFF,
          total: serveByPix + serveByCreditCard + serveBy100OFF,
        },
      ];

      return { chart, report };
    }),

  getAllPaymentMethodData: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const countRegisterConfirmedByPaymentMethod = async (
        tipoInscricao: "PARTICIPANTE" | "SERVIR",
        lgndCertificado: boolean | null,
        metodo_pagamento: "PIX" | "CARTAO" | "CUPOM_GRATUITO",
      ) => {
        return await ctx.db.inscricao.count({
          where: {
            eventoId: input.eventoId,
            tipoInscricao,
            metodo_pagamento,
            ...(lgndCertificado !== null ? { lgndCertificado } : {}),
            status: "CONFIRMADA",
          },
        });
      };

      const [
        participanteByPix,
        lgndCertificadoByPix,
        lgndNaoCertificadoByPix,
        participanteByCreditCard,
        lgndCertificadoByCreditCard,
        lgndNaoCertificadoByCreditCard,
        participanteBy100OFF,
        lgndNaoCertificadoBy100OFF,
        lgndCertificadoBy100OFF,
      ] = await Promise.all([
        countRegisterConfirmedByPaymentMethod("PARTICIPANTE", null, "PIX"),
        countRegisterConfirmedByPaymentMethod("SERVIR", true, "PIX"),
        countRegisterConfirmedByPaymentMethod("SERVIR", false, "PIX"),
        countRegisterConfirmedByPaymentMethod("PARTICIPANTE", null, "CARTAO"),
        countRegisterConfirmedByPaymentMethod("SERVIR", true, "CARTAO"),
        countRegisterConfirmedByPaymentMethod("SERVIR", false, "CARTAO"),
        countRegisterConfirmedByPaymentMethod(
          "PARTICIPANTE",
          null,
          "CUPOM_GRATUITO",
        ),
        countRegisterConfirmedByPaymentMethod(
          "SERVIR",
          false,
          "CUPOM_GRATUITO",
        ),
        countRegisterConfirmedByPaymentMethod("SERVIR", true, "CUPOM_GRATUITO"),
      ]);

      const chart: ChartPaymentMethodType[] = [
        {
          inscricaoType: "Participante",
          pix: participanteByPix,
          creditCard: participanteByCreditCard,
          cupom: participanteBy100OFF,
        },
        {
          inscricaoType: "LGND Certif.",
          pix: lgndCertificadoByPix,
          creditCard: lgndCertificadoByCreditCard,
          cupom: lgndCertificadoBy100OFF,
        },
        {
          inscricaoType: "LGND Não Certif.",
          pix: lgndNaoCertificadoByPix,
          creditCard: lgndNaoCertificadoByCreditCard,
          cupom: lgndNaoCertificadoBy100OFF,
        },
      ];

      const relatorio = [
        {
          tipoInscricao: "Participante",
          pix: participanteByPix,
          creditCard: participanteByCreditCard,
          free: participanteBy100OFF,
          total:
            participanteByPix + participanteByCreditCard + participanteBy100OFF,
        },
        {
          tipoInscricao: "Legendário Certificado",
          pix: lgndCertificadoByPix,
          creditCard: lgndCertificadoByCreditCard,
          free: lgndCertificadoBy100OFF,
          total:
            lgndCertificadoByPix +
            lgndCertificadoByCreditCard +
            lgndCertificadoBy100OFF,
        },
        {
          tipoInscricao: "Legendário Não Certificado",
          pix: lgndNaoCertificadoByPix,
          creditCard: lgndNaoCertificadoByCreditCard,
          free: lgndNaoCertificadoBy100OFF,
          total:
            lgndNaoCertificadoByPix +
            lgndNaoCertificadoByCreditCard +
            lgndNaoCertificadoBy100OFF,
        },
      ];

      return { chart, relatorio };
    }),

  getCupomsUsed: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cupomsUsed = await ctx.db.inscricao.groupBy({
        by: ["pagamento_couponValue"],
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
        },
        _count: {
          _all: true,
        },
        orderBy: {
          pagamento_couponValue: "asc",
        },
      });

      const data: ChartCupomDescontoType[] = cupomsUsed
        .filter(
          (cupom) =>
            cupom.pagamento_couponValue !== "none" &&
            cupom.pagamento_couponValue !== null,
        )
        .map((cupom) => {
          return {
            cupom: cupom.pagamento_couponValue!,
            usado: cupom._count._all,
          };
        });

      return data;
    }),

  getAllCuponsUsed: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const inscricoesComCupons = await ctx.db.inscricao.groupBy({
        by: ["pagamento_couponValue"],
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
          pagamento_discount_value: { gt: 0 },
        },
        _count: {
          _all: true,
        },
        orderBy: {
          pagamento_couponValue: "asc",
        },
      });

      const inscricoes = await ctx.db.inscricao.findMany({
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
          pagamento_discount_value: { gt: 0 },
        },
        select: {
          pagamento_couponValue: true,
          pagamento_discount_value: true,
          nome: true,
          id: true,
        },
      });

      const registersWithOutDiscountValue = inscricoes.filter(
        (reg) => reg.pagamento_discount_value === null,
      );

      if (registersWithOutDiscountValue.length > 0) {
        throw new Error(
          `Inscrições com valores de pagamento inválidos: ${registersWithOutDiscountValue
            .map((reg) => `${reg.nome} (ID: ${reg.id})`)
            .join(", ")}`,
        );
      }

      const descontoPorCupom = inscricoes.reduce(
        (acc, inscricao) => {
          const cupom = inscricao.pagamento_couponValue;

          if (cupom) {
            const desconto = inscricao.pagamento_discount_value!;

            acc[cupom] ??= 0;
            acc[cupom] += desconto;
          }

          return acc;
        },
        {} as Record<string, number>,
      );

      const cuponsFiltrados = inscricoesComCupons
        .map((cupom) => cupom.pagamento_couponValue)
        .filter((cupom): cupom is string => cupom !== null);

      const cuponsDetalhes = await ctx.db.cupomDesconto.findMany({
        where: {
          eventoId: input.eventoId,
          codigo: {
            in: cuponsFiltrados,
          },
        },
        select: {
          codigo: true,
          desconto: true,
          id: true,
        },
      });

      const result = inscricoesComCupons.map((inscricaoComCupom) => {
        const cupomDetalhe = cuponsDetalhes.find(
          (cupom) => cupom.codigo === inscricaoComCupom.pagamento_couponValue,
        );

        const cupomKey = inscricaoComCupom.pagamento_couponValue!;

        return {
          cupomId: cupomDetalhe?.id,
          cupomName: cupomKey,
          totalUsed: inscricaoComCupom._count._all,
          percent: cupomDetalhe?.desconto ?? 0,
          discountTotal: convertFromBasisPoint(descontoPorCupom[cupomKey] ?? 0),
        };
      });

      return result;
    }),

  getCheckinState: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const servirFields = {
        eventoId: input.eventoId,
        tipoInscricao: "SERVIR",
        status: "CONFIRMADA",
      };

      const participarFields = {
        eventoId: input.eventoId,
        tipoInscricao: "PARTICIPANTE",
        status: "CONFIRMADA",
      };

      const participantesChecked = await ctx.db.inscricao.count({
        where: {
          ...participarFields,
          checkin: true,
        },
      });

      const allpartcipante = await ctx.db.inscricao.count({
        where: participarFields,
      });

      const legendariosChecked = await ctx.db.inscricao.count({
        where: {
          ...servirFields,
          checkin: true,
        },
      });

      const allServir = await ctx.db.inscricao.count({
        where: servirFields,
      });

      const chartDataParticipante: ChartCheckin[] = [
        {
          checkin: "done",
          registers: participantesChecked,
          fill: "var(--color-done)",
        },
        {
          checkin: "pending",
          registers: allpartcipante - participantesChecked,
          fill: "var(--color-pending)",
        },
      ];

      const chartDataServir: ChartCheckin[] = [
        {
          checkin: "done",
          registers: legendariosChecked,
          fill: "var(--color-done)",
        },
        {
          checkin: "pending",
          registers: allServir - legendariosChecked,
          fill: "var(--color-pending)",
        },
      ];

      const data: CheckinChartDataProps = {
        chartDataParticipante,
        chartDataServir,
      };

      return data;
    }),

  getParticipantesPorFamilia: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const participantesPorFamilia = await ctx.db.inscricao.groupBy({
        by: ["familia"],
        where: {
          eventoId: input.eventoId,
          tipoInscricao: "PARTICIPANTE",
          status: "CONFIRMADA",
        },
        _count: {
          _all: true, // Contagem de todos os registros de cada grupo,
          checkin: true,
        },
        orderBy: {
          familia: "asc", // Ordena pela família em ordem crescente
        },
      });

      const chartData: ChartFamily[] = participantesPorFamilia.map(
        (familia) => ({
          family:
            familia.familia !== null
              ? `Família ${familia.familia?.toString()}`
              : "Não classificados",
          registers: familia._count._all,
          registersCheked: familia._count.checkin,
        }),
      );

      return chartData;
    }),

  getFarda: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tamanho_farda = await ctx.db.inscricao.groupBy({
        by: ["tamanhoFarda"], // Agrupa pelo campo 'tamanhoFarda'
        where: {
          eventoId: input.eventoId,
          tipoInscricao: "PARTICIPANTE",
          status: "CONFIRMADA",
        },
        _count: {
          tamanhoFarda: true, // Contagem de todos os registros para cada tamanho de farda
          checkin: true,
        },
        orderBy: {
          tamanhoFarda: "desc", // Ordena pelo tamanho da farda em ordem crescente
        },
      });

      const chartData = tamanho_farda.map((tamanho) => ({
        tamanho: tamanho.tamanhoFarda,
        quantidade: tamanho._count.tamanhoFarda,
        checked: tamanho._count.checkin,
      }));

      const tamanhoFardaByFamily = await ctx.db.inscricao.findMany({
        select: {
          familia: true,
          nome: true,
          tamanhoFarda: true,
          checkin: true,
        },
        where: {
          eventoId: input.eventoId,
          tipoInscricao: "PARTICIPANTE",
          status: "CONFIRMADA",
        },
        orderBy: [{ familia: "asc" }, { nome: "asc" }],
      });

      const familiaFardaParticipantes = tamanhoFardaByFamily.map((item) => ({
        familia: item.familia,
        nome: item.nome,
        farda: item.tamanhoFarda,
        check_in: item.checkin ? "✅" : "❌",
      }));

      return {
        chartData,
        familiaFardaParticipantes,
      };
    }),

  getRemTshirts: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const registers = await ctx.db.inscricao.findMany({
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
          OR: [{ tipoInscricao: "PARTICIPANTE" }, { tipoInscricao: "SERVIR" }],
        },
        select: {
          tipoInscricao: true,
          familia: true,
          checkin: true,
          manTshirtSize: true,
          womanTshirtSize: true,
          nome: true,
          spouseName: true,
        },
      });

      const manMap = new Map<
        string | null,
        { quantidade: number; checked: number }
      >();
      const womanMap = new Map<
        string | null,
        { quantidade: number; checked: number }
      >();

      const tshirtSizesList = registers
        .sort((a, b) => {
          if (a.tipoInscricao! < b.tipoInscricao!) return -1;
          if (a.tipoInscricao! > b.tipoInscricao!) return 1;
          if (a.nome! < b.nome!) return -1;
          if (a.nome! > b.nome!) return 1;
          return 0;
        })
        .map((reg) => {
          if (reg.manTshirtSize) {
            const current = manMap.get(reg.manTshirtSize) ?? {
              quantidade: 0,
              checked: 0,
            };
            current.quantidade += 1;
            current.checked += reg.checkin ? 1 : 0;
            manMap.set(reg.manTshirtSize, current);
          }

          if (reg.womanTshirtSize) {
            const current = womanMap.get(reg.womanTshirtSize) ?? {
              quantidade: 0,
              checked: 0,
            };
            current.quantidade += 1;
            current.checked += reg.checkin ? 1 : 0;
            womanMap.set(reg.womanTshirtSize, current);
          }

          return {
            tipo: reg.tipoInscricao,
            familia: reg.familia ?? "-",
            homem: reg.nome,
            camisetaMasculina: reg.manTshirtSize ?? "-",
            mulher: reg.spouseName,
            camisetaFeminina: reg.womanTshirtSize ?? "-",
            check_in: reg.checkin ? "✅" : "❌",
          };
        });

      const mapToSortedArray = (
        map: Map<string | null, { quantidade: number; checked: number }>,
      ) => {
        const arr = Array.from(map.entries()).map(([tamanho, dados]) => ({
          tamanho,
          ...dados,
        }));

        return arr.sort((a, b) => {
          if (!a.tamanho) return 1;
          if (!b.tamanho) return -1;

          const indexA = shirtSizesREM.indexOf(a.tamanho);
          const indexB = shirtSizesREM.indexOf(b.tamanho);

          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;

          return a.tamanho.localeCompare(b.tamanho);
        });
      };

      return {
        chartDataMan: mapToSortedArray(manMap),
        chartDataWoman: mapToSortedArray(womanMap),
        tshirtSizesList,
      };
    }),

  getLinkSecretoUsed: protectedProcedure
    .input(
      z.object({
        eventoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const linksSecretos = await ctx.db.inscricao.groupBy({
        by: ["linkSecreto"],
        where: {
          eventoId: input.eventoId,
          status: "CONFIRMADA",
        },
        _count: {
          _all: true,
        },
        orderBy: {
          linkSecreto: "desc", // Ordena pelo tamanho da farda em ordem crescente
        },
      });

      const chartData = linksSecretos
        .filter((link) => link.linkSecreto !== null)
        .map((link) => ({
          link: link.linkSecreto,
          quantidade: link._count._all,
        }));

      return {
        chartData,
      };
    }),
});
