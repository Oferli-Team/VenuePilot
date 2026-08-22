import { protectedProcedure, publicProcedure } from "../trpc";

import { getUserPermissions } from "@/lib/utils/getUserPermissions";
import { Role } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter } from "../trpc";
import { getMembership } from "../services/get-membership";

export const inviteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        email: z.string().email(),
        role: z.nativeEnum(Role),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";

      const member = await getMembership(input.slug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const { cannot } = getUserPermissions(userId, membership.role);

      if (cannot("create", "Invite")) {
        throw new Error("User does not have permission to invite members");
      }

      const inviteWithSameEmail = await ctx.db.invite.findFirst({
        where: {
          email: input.email,
          organizationId: organization.id,
        },
      });

      if (inviteWithSameEmail) {
        throw new Error("Invite with this email already exists");
      }

      const memberWithSameEmail = await ctx.db.member.findFirst({
        where: {
          organizationId: organization.id,
          user: {
            email: input.email,
          },
        },
      });

      if (memberWithSameEmail) {
        throw new Error("Member with this email already exists");
      }

      return ctx.db.invite.create({
        data: {
          email: input.email,
          role: input.role,
          organizationId: organization.id,
          authorId: userId,
        },
      });
    }),

  getInvite: publicProcedure
    .input(
      z.object({
        inviteId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.invite.findUnique({
        where: { id: input.inviteId },
        select: {
          id: true,
          email: true,
          role: true,
          organizationId: true,
          createdAt: true,
          organization: {
            select: {
              name: true,
              slug: true,
            },
          },
          author: {
            select: {
              name: true,
            },
          },
        },
      });
    }),

  getInvites: protectedProcedure
    .input(
      z.object({
        orgSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";

      const member = await getMembership(input.orgSlug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const { cannot } = getUserPermissions(userId, membership.role);

      if (cannot("read", "Invite")) {
        return null;
      }

      return ctx.db.invite.findMany({
        where: { organizationId: organization.id },
      });
    }),

  acceptInvite: protectedProcedure
    .input(
      z.object({
        inviteId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";

      const invite = await ctx.db.invite.findUnique({
        where: { id: input.inviteId },
      });

      if (!invite) {
        throw new Error("Invite not found");
      }

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (invite.email !== user.email) {
        throw new Error("Invite does not match user email");
      }

      return await ctx.db.$transaction([
        ctx.db.member.create({
          data: {
            userId: userId,
            organizationId: invite.organizationId,
            role: invite.role,
          },
        }),
        ctx.db.invite.delete({
          where: { id: input.inviteId },
        }),
      ]);
    }),

  rejectInvite: protectedProcedure
    .input(
      z.object({
        inviteId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";

      const invite = await ctx.db.invite.findUnique({
        where: { id: input.inviteId },
      });

      if (!invite) {
        throw new Error("Invite not found");
      }

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (invite.email !== user.email) {
        throw new Error("Invite does not match user email");
      }

      return ctx.db.invite.delete({ where: { id: input.inviteId } });
    }),

  revokeInvite: protectedProcedure
    .input(
      z.object({
        orgSlug: z.string(),
        inviteId: z.string(),
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

      if (cannot("delete", "Invite")) {
        throw new Error("User does not have permission to delete invites");
      }

      const invite = await ctx.db.invite.findUnique({
        where: { id: input.inviteId, organizationId: organization.id },
      });

      if (!invite) {
        throw new Error("Invite not found");
      }

      return ctx.db.invite.delete({ where: { id: input.inviteId } });
    }),

  getPendingInvites: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id ?? "";

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return ctx.db.invite.findMany({
      where: {
        email: user.email ?? "",
      },
    });
  }),
});
