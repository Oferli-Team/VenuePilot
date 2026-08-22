// prisma/seedUser.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const novoUsuario = await prisma.user.create({
    data: {
      name: 'Asaphe Guimarães Araújo Recaldes',
      email: 'asapherecaldesaraujo@gmail.com',
      emailVerified: new Date(),
      cpf: '01843807661',
      role: 'USER'
    },
  });

  console.log('Novo usuário inserido:', novoUsuario);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
