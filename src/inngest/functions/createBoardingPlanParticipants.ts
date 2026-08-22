import { api } from "@/trpc/server";
import { inngest } from "../client";
import { EVENTS_NAME } from "../events";

export const createBoardingPlanParticipants = inngest.createFunction(
  { id: "update-boarding-plan-participants" },
  { event: EVENTS_NAME.CREATE_BOARDING_PLAN_PARTICIPANTS },
  async ({ event, step }) => {
    type Items = {
      vehicleId: string;
      users: { id: string; type: "PARTICIPANTE" | "SERVIR" }[];
    };

    const { eventId, boarding } = event.data as {
      eventId: string;
      boarding: {
        allocated: Items[];
        unallocated: Items;
      };
    };

    const { allocated, unallocated } = boarding;

    const embarked = await step.run(
      "process-allocated-registers-on-vehicles",
      async () => {
        return await api.inscricao.processAllocatedVehicles({
          allocated,
          eventId,
        });
      },
    );

    const disembarked = await step.run(
      "process-unallocated-registers-on-vehicles",
      async () => {
        if (!unallocated) return { message: "Not data to update" };

        const result = await api.inscricao.processUnallocatedVehicles({
          unallocated,
          eventId,
        });

        return result;
      },
    );

    const totalBoarding = embarked.reduce(
      (sum, { usersCount }) => sum + usersCount,
      0,
    );

    await step.sendEvent("boarding.completed", {
      name: "boarding.completed",
      data: {
        eventId,
        embarked,
        disembarked,
        totalBoarding,
      },
    });

    return {
      message: "boarding plan completed",
      eventId,
      embarked,
      disembarked,
      totalBoarding,
    };
  },
);
