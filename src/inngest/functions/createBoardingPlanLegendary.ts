import { inngest } from "../client";
import { EVENTS_NAME } from "../events";
import { db } from "@/server/db";

export const createBoardingPlanLegendary = inngest.createFunction(
  { id: "update-boarding-plan-legendary" },
  { event: EVENTS_NAME.CREATE_BOARDING_PLAN_LEGENDARY },
  async ({ event, step }) => {
    const { eventId, boarding } = event.data as {
      eventId: string;
      boarding: Record<string, { id: string }[]>;
    };

    const BATCH_SIZE = 50;

    const allocatedEntries = Object.entries(boarding).filter(
      ([vehicleId]) => vehicleId !== "unallocated",
    );

    const allocatedUsersIds = allocatedEntries.flatMap((item) => {
      const vehicleId = item[0];
      const users = item[1];

      return users.map((user) => ({
        vehicleId: vehicleId,
        userId: user.id,
      }));
    });

    const unallocatedUserIds =
      boarding["unallocated"]?.map((user) => user.id) ?? [];

    const updatedLocatedVehicle = allocatedEntries.map(
      ([vehicleId, users]) => ({
        id: vehicleId,
        registersCount: users.length,
      }),
    );

    const unallocatedResults = await step.run(
      { id: "unallocated-update" },
      async () => {
        const batchPromises = [];
        const totalUnallocatedProcessed = unallocatedUserIds.length;

        for (let i = 0; i < totalUnallocatedProcessed; i += BATCH_SIZE) {
          const batchUserIds = unallocatedUserIds.slice(i, i + BATCH_SIZE);
          const updates = batchUserIds.map((userId) =>
            db.inscricao.update({
              select: { id: true },
              where: { id: userId, eventoId: eventId },
              data: { vehicleId: null },
            }),
          );
          batchPromises.push(Promise.all(updates));
        }

        const results = await Promise.all(batchPromises);
        const totalUnallocatedDone = results.reduce(
          (sum, batch) => sum + batch.length,
          0,
        );

        return {
          totalUnallocatedProcessed,
          totalUnallocatedDone,
        };
      },
    );

    const allocatedResults = await step.run(
      { id: "allocated-update" },
      async () => {
        const totalAllocatedProcessed = allocatedUsersIds.length;

        const batchPromises = [];
        for (let i = 0; i < totalAllocatedProcessed; i += BATCH_SIZE) {
          const batchUserIds = allocatedUsersIds.slice(i, i + BATCH_SIZE);
          const updates = batchUserIds.map((item) =>
            db.inscricao.update({
              select: { id: true },
              where: { id: item.userId, eventoId: eventId },
              data: { vehicleId: item.vehicleId },
            }),
          );
          batchPromises.push(Promise.all(updates));
        }

        const results = await Promise.all(batchPromises);
        const totalAllocatedDone = results.reduce(
          (sum, batch) => sum + batch.length,
          0,
        );

        return {
          totalAllocatedProcessed,
          totalAllocatedDone,
        };
      },
    );

    const vehicleCapacityResults = await step.run(
      { id: "vehicle-used-capacity-update" },
      async () => {
        const totalVehiclesProcessed = updatedLocatedVehicle.length;

        const batchPromises = [];
        for (let i = 0; i < totalVehiclesProcessed; i += BATCH_SIZE) {
          const batchVehicles = updatedLocatedVehicle.slice(i, i + BATCH_SIZE);
          const updates = batchVehicles.map((vehicle) =>
            db.vehicle
              .update({
                where: { id: vehicle.id, eventId },
                data: { usedCapacity: vehicle.registersCount },
              })
              .then((result) => ({
                vehicleId: vehicle.id,
                newCapacity: vehicle.registersCount,
                updated: !!result,
              }))
              .catch((error) => {
                console.error(
                  `Erro ao atualizar vehicleId ${vehicle.id}:`,
                  error,
                );
                return {
                  vehicleId: vehicle.id,
                  newCapacity: vehicle.registersCount,
                  updated: false,
                };
              }),
          );
          batchPromises.push(Promise.all(updates));
        }

        const batchResults = await Promise.all(batchPromises);
        const capacityUpdates = batchResults.flat();

        return {
          vehiclesProcessed: totalVehiclesProcessed,
          capacityUpdates,
        };
      },
    );

    return {
      success: true,
      unallocated: unallocatedResults,
      allocated: allocatedResults,
      vehicleCapacity: vehicleCapacityResults,
    };
  },
);
