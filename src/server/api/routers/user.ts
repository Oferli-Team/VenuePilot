import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  onboarding: protectedProcedure
    .input(z.object({ name: z.string().min(1), cpf: z.string().length(11) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          cpf: input.cpf,
        },
      });
    }),

  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany();
  }),

  updateRoleUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum([
          "USER",
          "ADMIN",
          "SUPER_ADMIN",
          "LADIES",
          "HAKUNA",
          "CHECKIN",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.id },
        data: {
          role: input.role,
        },
      });
    }),
});
