import { getServerSession, type NextAuthOptions } from "next-auth";
import EmailProvider, {
  type SendVerificationRequestParams,
} from "next-auth/providers/email";

import { SignInEmailTemplate } from "@/components/emails/SignInEmailTemplate";
import { env } from "@/env";
import { getData, sendEmail } from "@/lib/mailer";
import { db } from "@/server/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters";
import { cookies } from "next/headers";

export const sendVerificationRequest = async ({
  identifier: email,
  url,
  provider,
}: SendVerificationRequestParams): Promise<void> => {
  const emailHtml = await getData(SignInEmailTemplate({ email, url }));
  try {
    await sendEmail(
      email,
      "Inscrições Top - Clique no link para verificar seu email",
      emailHtml,
      provider,
    );
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60 days
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    EmailProvider({
      server: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      },
      from: env.SMTP_FROM,
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    // redirect to the home page after signing in
    signIn: async () => {
      return true;
    },

    jwt: async ({ token }) => {
      const user = await db.user.findUnique({
        where: {
          email: token.email ?? "",
        },
        include: {
          member_on: {
            select: {
              organization: {
                select: {
                  slug: true,
                },
              },
            },
            take: 1,
          },
        },
      });

      const cookieStore = cookies();
      const inviteId = cookieStore.get("inviteId")?.value;
      const orgSlug = cookieStore.get("orgSlug")?.value;

      if (!orgSlug && user && user?.member_on.length > 0) {
        const firstOrgSlug = user.member_on[0]?.organization.slug;
        if (firstOrgSlug) {
          cookieStore.set("orgSlug", firstOrgSlug, {
            maxAge: 60 * 24 * 60 * 60, // 60 days
          });
        }
      }

      if (inviteId && user) {
        try {
          const invite = await db.invite.findUnique({
            where: { id: inviteId },
          });

          if (invite && invite.email === user.email) {
            await db.$transaction([
              db.member.create({
                data: {
                  userId: user.id,
                  organizationId: invite.organizationId,
                  role: invite.role,
                },
              }),
              db.invite.delete({
                where: { id: inviteId },
              }),
            ]);

            const organization = await db.organization.findUnique({
              where: { id: invite.organizationId },
              select: { slug: true },
            });

            if (organization?.slug) {
              cookieStore.set("orgSlug", organization.slug);
            }
          }
          cookieStore.delete("inviteId");
        } catch (error) {
          console.error("JWT Callback - Failed to process invite:", error);
        }
      }

      if (user) {
        token = {
          ...token,
          id: user.id,
          cpf: user.cpf,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      }

      return token;
    },

    session: ({ session, token }) => {
      const modifiedSession = { ...session };
      if (token) {
        if (!session.user) modifiedSession.user = {};
        modifiedSession.user.id = token.id;
        modifiedSession.user.cpf = token.cpf;
        modifiedSession.user.name = token.name;
        modifiedSession.user.email = token.email;
        modifiedSession.user.image = token.image;
        modifiedSession.user.role = token.role;
      }
      return modifiedSession;
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request", // (used for check email message)
    newUser: "/identificacao", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
