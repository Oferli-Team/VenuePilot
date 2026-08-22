import { type PrismaClient } from "@prisma/client";

export const getMembership = async (orgSlug: string, userId: string, db: PrismaClient) => {
  if (!orgSlug) {
    return null;
  }

  const member = await db.member.findFirst({
    where: {
      userId,
      organization: {
        slug: orgSlug,
      },
    },
    include: {
      organization: true,
    },
  });

  if (!member) {
    return null;
  }

  return member;
}
