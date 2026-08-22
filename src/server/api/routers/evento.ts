import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { type FeeObject, type FeeRates } from "@/lib/types";
import {
  CreateEventSchema,
  EventGeneralInfo,
  EventTicketInfo,
  EventTypeEnumSchema,
} from "./schema";
import { ITOP } from "@/lib/constants";
import { eventSchema } from "@/lib/auth/models/event";
import { getUserPermissions } from "@/lib/utils/getUserPermissions";
import { getMembership } from "../services/get-membership";
import { convertToDecimal128Map } from "@/server/utils/convertToDecimal128Map";

export const eventoRouter = createTRPCRouter({
  createEvent: protectedProcedure
    .input(
      z.object({
        event: z.object({
          ...CreateEventSchema.shape,
          slug: z.string(),
          topNumero: z.number(),
          linkWhatsappGrupoParticipante: z.string().url(),
          linkWhatsappGrupoServir: z.string().url(),
          terms: z.string(),
          type: EventTypeEnumSchema,
        }),
        orgSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";
      const member = await getMembership(input.orgSlug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const { cannot } = getUserPermissions(userId, membership.role);

      if (cannot("create", "Event")) {
        throw new Error("Not authorized to create event");
      }

      return ctx.db.evento.create({
        data: {
          ...input.event,
          organizationId: organization.id,
          ownerId: userId,
          pista: organization.name,
          banner: "/itop-og-logo.png",
          openServir: false,
          openParticipar: false,
          posted: false,
          hero: 0,
          credit_card_fees: convertToDecimal128Map(ITOP.cardFee),
          itopFee: ITOP.fee,
        },
      });
    }),

  checkIfTopNumberExists: protectedProcedure
    .input(
      z.object({
        topNumero: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.evento.findFirst({
        where: {
          topNumero: input.topNumero,
        },
      });

      if (result) {
        return true;
      }

      return false;
    }),

  updateGeneralInfo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...EventGeneralInfo.shape,
        type: EventTypeEnumSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined),
      );

      return ctx.db.evento.update({
        where: { id },
        data: filteredData,
      });
    }),

  updateTicketInfo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...EventTicketInfo.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      console.log({ id });

      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined),
      );

      return ctx.db.evento.update({
        where: { id },
        data: filteredData,
      });
    }),

  updateEventTerms: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        terms: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, terms } = input;

      return ctx.db.evento.update({
        where: { id },
        data: {
          terms,
        },
      });
    }),

  updateEventList: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        list: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, list } = input;

      return ctx.db.evento.update({
        where: { id },
        data: {
          list,
        },
      });
    }),

  getEventPostedByNumberTop: publicProcedure
    .input(z.object({ topNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.evento.findFirst({
        where: { posted: true, topNumero: input.topNumber },
      });

      function convertReceivedFeesToSimpleObject(fees: FeeObject | undefined) {
        const convertedFees: FeeRates = {};
        if (!fees) {
          return convertedFees;
        }

        for (const [key, value] of Object.entries(fees)) {
          convertedFees[key] = parseFloat(value.$numberDecimal);
        }

        return convertedFees;
      }

      const fees = convertReceivedFeesToSimpleObject(
        event?.credit_card_fees as FeeObject | undefined,
      );

      return {
        ...event,
        credit_card_fees: fees,
      };
    }),

  getEventBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const eventFound = await ctx.db.evento.findFirst({
        where: { slug: input.slug },
      });

      function convertReceivedFeesToSimpleObject(fees: FeeObject | undefined) {
        const convertedFees: FeeRates = {};
        if (!fees) {
          return convertedFees;
        }

        for (const [key, value] of Object.entries(fees)) {
          convertedFees[key] = parseFloat(value.$numberDecimal);
        }

        return convertedFees;
      }

      const fees = convertReceivedFeesToSimpleObject(
        eventFound?.credit_card_fees as FeeObject | undefined,
      );

      const event = {
        ...eventFound,
        credit_card_fees: fees,
      };
      return eventFound ? event : null;
    }),

  getEventById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.evento.findFirst({
        where: { id: input.id },
      });
    }),

  getAllEvento: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.evento.findMany({
      where: {
        posted: true,
      },
    });
  }),

  getHeroEvents: publicProcedure.query(async ({ ctx }) => {
    const events = await ctx.db.evento.findMany({
      where: {
        posted: true,
        hero: {
          not: 0,
        },
      },
      orderBy: {
        hero: "asc",
      },
    });

    return events;
  }),

  getCurrentEvent: publicProcedure.query(async ({ ctx }) => {
    const currentDay = new Date();

    const event = await ctx.db.evento.findFirst({
      where: {
        posted: true,
        dataFim: {
          gte: currentDay,
        },
      },
      orderBy: {
        dataFim: "desc",
      },
    });
    return event;
  }),

  getOnGoingEvents: publicProcedure.query(async ({ ctx }) => {
    const currentDay = new Date();

    const onGoingEvents = await ctx.db.evento.findMany({
      where: {
        posted: true,
        dataFim: {
          gt: currentDay, // O evento ainda não terminou
        },
      },
      orderBy: {
        dataFim: "asc", // Ordena pela data de término (descendente)
      },
    });

    return onGoingEvents;
  }),

  getEventsClosed: publicProcedure.query(async ({ ctx }) => {
    const currentDay = new Date();

    const events = await ctx.db.evento.findMany({
      where: {
        posted: true,
        dataFim: {
          lt: currentDay,
        },
      },
      orderBy: {
        dataFim: "desc",
      },
    });
    return events;
  }),

  getEventDetails: protectedProcedure
    .input(z.object({ orgSlug: z.string(), eventSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";
      const member = await getMembership(input.orgSlug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const { cannot } = getUserPermissions(userId, membership.role);

      if (cannot("read", "Event")) {
        throw new Error("Not authorized to get event");
      }

      return ctx.db.evento.findUnique({
        where: {
          slug: input.eventSlug,
          organizationId: organization.id,
        },
      });
    }),

  getEvents: protectedProcedure
    .input(z.object({ orgSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";
      const member = await getMembership(input.orgSlug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const { cannot } = getUserPermissions(userId, membership.role);

      if (cannot("read", "Event")) {
        throw new Error("Not authorized to get event");
      }

      return ctx.db.evento.findMany({
        where: { organizationId: organization.id },
        orderBy: { topNumero: "desc" },
      });
    }),

  getSettingsEvent: protectedProcedure
    .input(z.object({ orgSlug: z.string(), eventSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";
      const member = await getMembership(input.orgSlug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const { cannot } = getUserPermissions(userId, membership.role);

      if (cannot("read", "Event")) {
        throw new Error("Not authorized to get event");
      }

      const result = await ctx.db.evento.findUnique({
        where: { slug: input.eventSlug, organizationId: organization.id },
        select: {
          Inscricao: {
            where: {
              status: "CONFIRMADA",
            },
          },
          vagasParticipar: true,
          vagasServir: true,
          openParticipar: true,
          openServir: true,
          posted: true,
          type: true,
        },
      });

      const occupiedSpotsParticipant = result?.Inscricao.filter(
        (register) =>
          register.tipoInscricao === "PARTICIPANTE" &&
          register.status === "CONFIRMADA",
      ).length;

      const occupiedSpotsLegendary = result?.Inscricao.filter(
        (register) =>
          register.tipoInscricao === "SERVIR" &&
          register.status === "CONFIRMADA",
      ).length;

      return {
        type: result?.type,
        offeredSpotsParticipants: result?.vagasParticipar,
        offeredSpotsLegendary: result?.vagasServir,
        registrationIsOpenParticipants: result?.openParticipar,
        registrationIsOpenLegendary: result?.openServir,
        eventIsOpen: result?.posted,
        occupiedSpotsParticipant,
        occupiedSpotsLegendary,
      };
    }),

  updatePostedEvent: protectedProcedure
    .input(
      z.object({
        orgSlug: z.string(),
        eventSlug: z.string(),
        posted: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";
      const member = await getMembership(input.orgSlug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const { cannot } = getUserPermissions(userId, membership.role);

      if (cannot("update", "Event")) {
        throw new Error("Not authorized to update event");
      }

      return ctx.db.evento.update({
        where: { slug: input.eventSlug, organizationId: organization.id },
        data: { posted: input.posted },
      });
    }),

  updateRegisterStatus: protectedProcedure
    .input(
      z.object({
        orgSlug: z.string(),
        eventSlug: z.string(),
        openParticipar: z.boolean().optional(),
        openServir: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";
      const member = await getMembership(input.orgSlug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const { cannot } = getUserPermissions(userId, membership.role);

      if (cannot("update", "Event")) {
        throw new Error("Not authorized to update event");
      }

      return ctx.db.evento.update({
        where: { slug: input.eventSlug, organizationId: organization.id },
        data: {
          ...(input.openParticipar !== undefined && {
            openParticipar: input.openParticipar,
          }),
          ...(input.openServir !== undefined && {
            openServir: input.openServir,
          }),
        },
      });
    }),

  updateEvent: protectedProcedure
    .input(
      z.object({
        orgSlug: z.string(),
        eventSlug: z.string(),
        event: z.object({
          titulo: z.string(),
          description: z.string(),
          subtitulo: z.string(),
          periodo: z.string(),
          dataInicio: z.string(),
          dataFim: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";
      const member = await getMembership(input.orgSlug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const event = await ctx.db.evento.findUnique({
        where: { slug: input.eventSlug, organizationId: organization.id },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      const { cannot } = getUserPermissions(userId, membership.role);
      const authEvent = eventSchema.parse(event);

      if (cannot("update", authEvent)) {
        throw new Error("Not authorized to update event");
      }

      return ctx.db.evento.update({
        where: { id: event.id },
        data: input.event,
      });
    }),
});
