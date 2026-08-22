import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const payloadRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const payloads = await ctx.db.woovipayloads.findMany();
      return payloads;
    } catch (error) {
      console.error("Error fetching payloads:", error);
      throw new Error("Failed to fetch payloads");
    }
  }),

  getPayload: publicProcedure
    .input(z.object({ endToEndId: z.string(), event: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const payload = await ctx.db.woovipayloads.findFirst({
          where: {
            endToEndId: input.endToEndId,
            event: input.event,
          },
          select: {
            id: true,
          },
        });

        return payload;
      } catch (error) {
        console.error("Error fetching payload:", error);
        throw new Error("Failed to fetch payload");
      }
    }),

  savePayload: publicProcedure
    .input(
      z.object({
        charge: z.any(),
        company: z.any(),
        correlationID: z.string(),
        endToEndId: z.string(),
        event: z.string(),
        pix: z.any(),
        payload: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const payload = await ctx.db.woovipayloads.create({
        data: {
          charge: JSON.stringify(input.charge),
          company: JSON.stringify(input.company),
          correlationId: input.correlationID,
          endToEndId: input.endToEndId,
          event: input.event,
          createdAt: new Date(),
          pix: JSON.stringify(input.pix),
          payload: JSON.stringify(input.payload),
        },
      });

      return payload;
    }),

  getPayloadAsaas: publicProcedure
    .input(z.object({ payloadId: z.string(), event: z.string() }))
    .query(async ({ ctx, input }) => {
      const payload = await ctx.db.asaaspayloads.findFirst({
        where: { payloadId: input.payloadId, event: input.event },
        select: {
          id: true,
        },
      });
      return payload;
    }),

  savePayloadAsaas: publicProcedure
    .input(
      z.object({
        payloadId: z.string(),
        event: z.string(),
        payment: z.any(),
        inscricaoId: z.string().optional(),
        eventoId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const payload = await ctx.db.asaaspayloads.create({
        data: {
          payloadId: input.payloadId,
          event: input.event,
          payment: JSON.stringify(input.payment),
          inscricaoId: input.inscricaoId,
          eventoId: input.eventoId,
        },
      });

      return payload;
    }),
});
