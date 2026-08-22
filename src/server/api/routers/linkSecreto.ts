import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const linkSecretoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        link: z.string().min(3),
        quantidade: z.number().min(1),
        eventoId: z.string(),
        tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.linkSecreto.findFirst({
        where: {
          eventoId: input.eventoId,
          link: input.link,
        },
      });

      if (link) throw new Error(`Link secreto "${link.link}" já existente`);

      return ctx.db.linkSecreto.create({
        data: {
          link: input.link,
          quantidade: input.quantidade,
          eventoId: input.eventoId,
          ativo: true,
          tipoInscricao: input.tipoInscricao,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.linkSecreto.findFirst({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              usos: true,
            },
          },
        },
      });

      if (!link) {
        throw new Error("Link não encontrado");
      }

      return {
        ...link,
        usadoCount: link._count.usos,
      };
    }),

  getByLink: publicProcedure
    .input(z.object({ link: z.string().min(3), eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.linkSecreto.findFirst({
        where: {
          link: input.link.toLowerCase(),
          eventoId: input.eventoId,
        },
        include: {
          _count: {
            select: {
              usos: true,
            },
          },
        },
      });

      if (!link) {
        return null;
      }

      return {
        ...link,
        usadoCount: link._count.usos,
      };
    }),

  getAll: protectedProcedure
    .input(z.object({ eventoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const links = await ctx.db.linkSecreto.findMany({
        where: {
          eventoId: input.eventoId,
        },
        orderBy: {
          link: "asc",
        },
        include: {
          _count: {
            select: {
              usos: true,
            },
          },
        },
      });

      return links.map((link) => ({
        ...link,
        usadoCount: link._count.usos,
        quantidadeDisponivel: link.quantidade - link._count.usos,
      }));
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        link: z.string().min(3),
        quantidade: z.number().min(1),
        tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"]),
        eventoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingLink = await ctx.db.linkSecreto.findFirst({
        where: {
          AND: [
            { link: input.link },
            { id: { not: input.id } },
            { eventoId: input.eventoId },
          ],
        },
      });

      if (existingLink)
        throw new Error(
          `O link '${input.link}' já está cadastrado. Tente outro nome!`,
        );

      return ctx.db.linkSecreto.update({
        where: { id: input.id, eventoId: input.eventoId },
        data: {
          link: input.link,
          quantidade: input.quantidade,
          tipoInscricao: input.tipoInscricao,
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
      return ctx.db.linkSecreto.update({
        where: { id: input.id },
        data: {
          ativo: input.ativo,
        },
      });
    }),

  usarLink: publicProcedure
    .input(
      z.object({
        id: z.string(),
        inscricaoId: z.string(),
        eventoId: z.string(),
      }),
    )
    .output(
      z.object({
        updateLinkSecreto: z.object({ id: z.string() }),
        linkUse: z.object({ id: z.string() }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const _linkSecreto = await ctx.db.linkSecreto.findFirst({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              usos: true,
            },
          },
        },
      });

      if (!_linkSecreto) throw new Error("Link secreto não encontrado");

      if (_linkSecreto._count.usos >= _linkSecreto.quantidade)
        throw new Error("Link secreto esgotado");

      const updateLinkSecreto = await ctx.db.linkSecreto.update({
        where: { id: input.id },
        data: {
          usadoCount: {
            increment: 1,
          },
        },
      });

      const inscricaoUpdated = await ctx.db.inscricao.update({
        where: { id: input.inscricaoId },
        data: {
          linkSecreto: _linkSecreto.link,
        },
      });

      const linkUse = await ctx.db.linkUse.create({
        data: {
          linkId: input.id,
          inscricaoId: input.inscricaoId,
          dataUtilizacao: new Date(),
        },
      });

      return {
        updateLinkSecreto,
        linkUse,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.linkSecreto.delete({
        where: { id: input.id },
      });
    }),
});
