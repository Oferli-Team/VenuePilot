// scripts/updateAllCoupons.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateAllCoupons() {
  const eventoId = "66a2e5bd82913dab2d6b6cf7";

  try {
    const updateResult = await prisma.cupomDesconto.updateMany({
      data: {
        eventoId: eventoId,
      },
    });

    console.log(`Updated ${updateResult.count} coupons successfully.`);
  } catch (error) {
    console.error("Error updating coupons:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
    console.log("Script finished.");
  }
}

void updateAllCoupons();
