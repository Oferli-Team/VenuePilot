import { roleSchema } from "@/lib/auth/roles";
import { getUserPermissions } from "@/lib/utils/getUserPermissions";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { getMembership } from "../services/get-membership";

export const memberRouter = createTRPCRouter({
  getUserMembership: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = await getMembership(
        input.slug,
        ctx.session.user.id!,
        ctx.db,
      );

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      return {
        membership,
        organization,
      };
    }),

  getOrganizationMembers: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";

      const member = await getMembership(input.slug, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { organization, ...membership } = member;

      const { cannot } = getUserPermissions(userId, membership.role);

      if (cannot("read", "User")) {
        return null;
      }

      return ctx.db.member.findMany({
        where: { organization: { id: organization.id } },
        select: {
          id: true,
          role: true,
          organization: {
            select: {
              ownerId: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  updateMember: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        memberId: z.string(),
        role: roleSchema,
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

      if (cannot("update", "User")) {
        throw new Error("Not authorized to update member");
      }

      return ctx.db.member.update({
        where: { id: input.memberId, organizationId: organization.id },
        data: { role: input.role },
      });
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        memberId: z.string(),
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

      if (cannot("delete", "User")) {
        throw new Error("Not authorized to remove member");
      }

      return ctx.db.member.delete({
        where: { id: input.memberId, organizationId: organization.id },
      });
    }),
});
