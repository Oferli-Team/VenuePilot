import { createOrganizationSchema } from "@/app/zod-validation/orgSchema";
import { organizationSchema } from "@/lib/auth/models/organization";
import { roleSchema, type Role } from "@/lib/auth/roles";
import { getUserPermissions } from "@/lib/utils/getUserPermissions";
import { slugify } from "@/lib/utils/slugify";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  type Member,
  type Organization,
  type PrismaClient,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

type Context = {
  db: PrismaClient;
  session: {
    user: {
      id: string;
    };
  };
};

type MemberWithOrganization = Member & {
  organization: Organization;
  role: Role;
};

async function getMemberWithOrganization(
  ctx: Context,
  userId: string,
  slug: string,
): Promise<MemberWithOrganization> {
  const member = await ctx.db.member.findFirst({
    where: {
      userId,
      organization: { slug },
    },
    include: {
      organization: true,
    },
  });

  if (!member?.organization || !member.role) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found or user is not a member",
    });
  }

  const role = roleSchema.parse(member.role);
  return { ...member, role } as MemberWithOrganization;
}

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        shouldAttachUsersByDomain,
        cnpj,
        pixKey,
        managerName,
        managerPhone,
        socialMediaInstagram,
        socialMediaWhatsapp,
        socialMediaYoutube,
        supportContact,
      } = input;

      // Generate a slug from the name
      const baseSlug = slugify(name);

      // Check if slug exists and append number if needed
      let slug = baseSlug;
      let counter = 1;

      while (await ctx.db.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      return ctx.db.organization.create({
        data: {
          name,
          cnpj,
          pixKey,
          managerName,
          managerPhone,
          supportContact,
          socialMediaInstagram,
          socialMediaWhatsapp,
          socialMediaYoutube,
          slug,
          domain: input.domain ?? slug,
          shouldAttachUsersByDomain,
          owner: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          members: {
            create: {
              userId: ctx.session.user.id ?? "",
              role: "SUPER_ADMIN",
            },
          },
        },
      });
    }),

  getOrganizations: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User must be logged in",
      });
    }

    try {
      return await ctx.db.organization.findMany({
        where: {
          OR: [
            { ownerId: ctx.session.user.id },
            {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          events: true,
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organizations",
        cause: error,
      });
    }
  }),

  getAllEventsOrg: protectedProcedure
    .input(
      z.object({
        orgSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findMany({
        where: {
          slug: input.orgSlug,
        },
        select: {
          events: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      });

      const events = org[0]?.events ?? [];

      const getAllRegistersChecked = async (eventId: string) => {
        const registers = await ctx.db.inscricao.findMany({
          where: {
            eventoId: eventId,
            tipoInscricao: "PARTICIPANTE",
            checkin: true,
            status: "CONFIRMADA",
          },
          select: {
            nome: true,
            nrLgnd: true,
            cpf: true,
            celular: true,
            email: true,
            cidade: true,
            estado: true,
            igreja: true,
            igrejaPastor: true,
            evento: {
              select: { topNumero: true },
            },
          },
        });
        return registers.map((reg) => ({
          nome: reg.nome,
          cpf: reg.cpf,
          nrLgnd: reg.nrLgnd,
          celular: reg.celular,
          email: reg.email,
          cidade: reg.cidade,
          estado: reg.estado,
          igreja: reg.igreja,
          igrejaPastor: reg.igrejaPastor,
          topNumero: reg.evento.topNumero.toString(),
        }));
      };

      const allRegisters = (
        await Promise.all(
          events.map((event) => getAllRegistersChecked(event.id)),
        )
      ).flat();

      return allRegisters;
    }),

  update: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        name: z.string().optional(),
        domain: z.string().optional(),
        shouldAttachUsersByDomain: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in",
        });
      }

      try {
        const member = await getMemberWithOrganization(
          ctx as Context,
          ctx.session.user.id,
          input.slug,
        );

        const authOrganization = organizationSchema.parse(member.organization);
        const { cannot } = getUserPermissions(ctx.session.user.id, member.role);

        if (cannot("update", authOrganization)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to update this organization",
          });
        }

        if (input.domain) {
          const existingOrg = await ctx.db.organization.findFirst({
            where: {
              domain: input.domain,
              id: { not: member.organization.id },
            },
          });

          if (existingOrg) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Domain already in use",
            });
          }
        }

        return await ctx.db.organization.update({
          where: { id: member.organization.id },
          data: {
            name: input.name,
            domain: input.domain,
            shouldAttachUsersByDomain: input.shouldAttachUsersByDomain,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update organization",
          cause: error,
        });
      }
    }),

  shutdown: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in",
        });
      }

      try {
        const member = await getMemberWithOrganization(
          ctx as Context,
          ctx.session.user.id,
          input.slug,
        );

        const authOrganization = organizationSchema.parse(member.organization);
        const { cannot } = getUserPermissions(ctx.session.user.id, member.role);

        if (cannot("delete", authOrganization)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to delete this organization",
          });
        }

        return await ctx.db.organization.delete({
          where: { id: member.organization.id },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete organization",
          cause: error,
        });
      }
    }),
});
