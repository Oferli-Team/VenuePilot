import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function fixEventoSlugs() {
  try {
    // Find all events with null slugs
    const eventsWithNullSlugs = await prisma.evento.findMany({
      // where: {
      //   slug: null,
      // },
      select: {
        id: true,
      },
    });

    console.log(`Found ${eventsWithNullSlugs.length} events with null slugs`);

    // Update each event with a unique UUID
    for (const event of eventsWithNullSlugs) {
      await prisma.evento.update({
        where: {
          id: event.id,
        },
        data: {
          slug: uuidv4(),
        },
      });
    }

    console.log("Successfully updated all events with null slugs");
  } catch (error) {
    console.error("Error fixing event slugs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

void fixEventoSlugs();
