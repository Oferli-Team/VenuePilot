import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createMembersByUserRole() {
  try {
    const orgId = "67eff6beb57ec307c8535812"; // PROD
    // const orgId = "67e8441092e273638578624e"; // STAG

    const users = await prisma.user.findMany({
      where: {
        role: { not: 'USER' },
      },
    })

    console.log(`Encontrados ${users.length} usuários com papel diferente de USER.`);
    console.log("users", users)


    for await (const user of users) {
      const { id: userId, role } = user;

      const member = await prisma.member.findFirst({
        where: {
          userId,
          organizationId: orgId,
        },
      });

      if (member) {
        console.log(`Usuário ${userId} já é membro.`);
        continue;
      }

      await prisma.member.create({
        data: {
          role: role,
          organizationId: orgId,
          userId,
        },
      });

      console.log(`Criado membro para o usuário ${userId} com papel ${role}.`);
    }

    console.log(`Finished creating members for ${users.length} users.`);
  } catch (error) {
    console.error("Erro na operação: ", error);
  } finally {
    await prisma.$disconnect();
  }
}

void createMembersByUserRole();
