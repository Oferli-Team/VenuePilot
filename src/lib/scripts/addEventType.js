import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addEventType() {
  try {
    const eventsWithNullType = await prisma.evento.findMany({
      select: {
        id: true,
      },
    });

    console.log(`Found ${eventsWithNullType.length} events without type`);

    for (const event of eventsWithNullType) {
      await prisma.evento.update({
        where: {
          id: event.id,
        },
        data: {
          type: "LEGENDARIOS",
        },
      });
    }

    console.log(`Successfully updated ${eventsWithNullType.length} events`);
  } catch (error) {
    console.error("Error fixing event type:", error);
  } finally {
    await prisma.$disconnect();
  }
}

void addEventType();
