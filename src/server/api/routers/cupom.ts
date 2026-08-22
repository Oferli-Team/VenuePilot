import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const cupomRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        codigo: z.string().min(3),
        desconto: z.number().min(1).max(10000),
        quantidade: z.number().min(1),
        eventoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const couponCode = await ctx.db.cupomDesconto.findFirst({
        where: {
          eventoId: input.eventoId,
          codigo: input.codigo,
        },
      });

      if (couponCode)
        throw new Error(`Código de cupom "${input.codigo}" já existente`);

      return ctx.db.cupomDesconto.create({
        data: {
          codigo: input.codigo,
          desconto: input.desconto,
          quantidade: input.quantidade,
          eventoId: input.eventoId,
          ativo: true,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.cupomDesconto.findFirst({
        where: { id: input.id },
      });
    }),

  getByCodigo: publicProcedure
    .input(z.object({ codigo: z.string().min(3), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.cupomDesconto.findFirst({
        where: {
          codigo: input.codigo.toUpperCase(),
          eventoId: input.eventoId,
        },
      });
    }),

  getAll: protectedProcedure
    .input(z.object({ eventoId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.cupomDesconto.findMany({
        where: {
          eventoId: input.eventoId,
        },
        orderBy: {
          codigo: "asc",
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        codigo: z.string().min(3),
        desconto: z.number().min(1).max(10000),
        quantidade: z.number().min(1),
        eventoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const couponCode = await ctx.db.cupomDesconto.findFirst({
        where: {
          AND: [
            { codigo: input.codigo },
            { id: { not: input.id } },
            { eventoId: input.eventoId },
          ],
        },
      });

      if (couponCode)
        throw new Error(
          `O cupom '${input.codigo}' já está cadastrado. Tente outro nome!`,
        );

      return ctx.db.cupomDesconto.update({
        where: { id: input.id },
        data: {
          codigo: input.codigo,
          desconto: input.desconto,
          quantidade: input.quantidade,
          eventoId: input.eventoId,
        },
      });
    }),

  updateActive: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ativo: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cupomDesconto.update({
        where: { id: input.id },
        data: {
          ativo: input.ativo,
        },
      });
    }),

  usarCupom: publicProcedure
    .input(
      z.object({
        eventoId: z.string(),
        id: z.string(),
        inscricaoId: z.string(),
        usadoCount: z.number(),
      }),
    )
    .output(
      z.object({
        updateCupomDesconto: z.object({ id: z.string() }),
        cupomUse: z.object({ id: z.string() }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const _cupomDesconto = await ctx.db.cupomDesconto.findFirst({
        where: { id: input.id },
      });

      if (!_cupomDesconto) throw new Error("Cupom não encontrado");

      if (_cupomDesconto.usadoCount >= _cupomDesconto.quantidade)
        throw new Error("Cupom esgotado");

      const updateCupomDesconto = await ctx.db.cupomDesconto.update({
        where: { id: input.id },
        data: {
          usadoCount: input.usadoCount,
        },
      });

      const cupomUse = await ctx.db.cupomUse.create({
        data: {
          eventoId: input.eventoId,
          cupomId: input.id,
          inscricaoId: input.inscricaoId,
          dataUtilizacao: new Date(),
        },
      });

      return {
        updateCupomDesconto,
        cupomUse,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cupomDesconto.delete({
        where: { id: input.id },
      });
    }),
});
