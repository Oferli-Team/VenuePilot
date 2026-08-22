import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { CreateVehicleSchema } from "./schema";
import { ENUM_VEHICLE_TYPE } from "@/lib/enum";

export const vehicleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateVehicleSchema)
    .mutation(async ({ ctx, input }) => {
      const vehicleNumber = await ctx.db.vehicle.findFirst({
        where: {
          identifier: { contains: input.identifier },
          type: input.type,
          eventId: input.eventId,
        },
      });

      if (vehicleNumber?.type === input.type)
        throw new Error(
          JSON.stringify({
            title: "Number already exist",
            message: `Não é possível criar novamente uma viatura com o número ${input.identifier}.`,
          }),
        );

      return ctx.db.vehicle.create({
        data: {
          ...input,
          active: true,
          usedCapacity: 0,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.vehicle.findFirst({
        where: { id: input.id },
      });
    }),

  getVehiclesByParticipants: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        active: z.boolean(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.vehicle.findMany({
        where: {
          eventId: input.eventId,
          type: "BUS",
          active: input.active,
        },
        orderBy: {
          name: "asc",
        },
      });
    }),

  getVehiclesByLegendary: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        active: z.boolean(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.vehicle.findMany({
        where: {
          eventId: input.eventId,
          active: input.active,
        },
        orderBy: {
          name: "asc",
        },
      });
    }),

  getAll: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.vehicle.findMany({
        where: {
          eventId: input.eventId,
        },
        orderBy: {
          name: "asc",
        },
      });
    }),

  getAllBus: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.vehicle.findMany({
        select: {
          id: true,
          name: true,
          totalCapacity: true,
          identifier: true,
          owner: true,
          plate: true,
          notes: true,
          function: true,
        },
        where: {
          eventId: input.eventId,
          type: ENUM_VEHICLE_TYPE.BUS,
        },
        orderBy: {
          name: "asc",
        },
      });
    }),

  getAllCars: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.vehicle.findMany({
        select: {
          id: true,
          name: true,
          totalCapacity: true,
          identifier: true,
          owner: true,
          plate: true,
          notes: true,
          function: true,
        },
        where: {
          eventId: input.eventId,
          type: ENUM_VEHICLE_TYPE.CAR,
        },
        orderBy: {
          name: "asc",
        },
      });
    }),

  update: protectedProcedure
    .input(CreateVehicleSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vehicleNumber = await ctx.db.vehicle.findFirst({
        where: {
          id: { not: input.id },
          identifier: input.identifier,
        },
      });

      if (vehicleNumber?.type === input.type)
        throw new Error(
          JSON.stringify({
            title: "Number already exist",
            message: `Já existe um veículo com o número ${input.identifier}.`,
          }),
        );

      return ctx.db.vehicle.update({
        where: { id: input.id, eventId: input.eventId },
        data: {
          name: input.name,
          type: input.type,
          identifier: input.identifier,
          totalCapacity: input.totalCapacity,
          active: input.active,
          function: input.function,
          notes: input.notes,
          owner: input.owner,
          plate: input.plate,
        },
      });
    }),

  updateActive: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        eventId: z.string(),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { active, id, eventId } = input;

      return await ctx.db.$transaction(async (tx) => {
        if (!active) {
          const registrationsAffected = await tx.inscricao.count({
            where: { vehicleId: id },
          });

          if (registrationsAffected > 0) {
            await tx.inscricao.updateMany({
              where: { vehicleId: id },
              data: { vehicleId: null },
            });

            return await tx.vehicle.update({
              where: { id, eventId },
              data: {
                active,
                usedCapacity: 0,
              },
            });
          }
        }

        return await tx.vehicle.update({
          where: { id, eventId },
          data: { active },
        });
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string(), eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const registrationsAffected = await tx.inscricao.count({
          where: { vehicleId: input.eventId },
        });

        if (registrationsAffected > 0) {
          await tx.inscricao.updateMany({
            where: { vehicleId: input.id },
            data: { vehicleId: null },
          });
        }

        await tx.vehicle.delete({
          where: { id: input.id, eventId: input.eventId },
        });
      });
    }),
});
