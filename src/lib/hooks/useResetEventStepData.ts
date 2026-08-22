import {
  type EventSteps,
  useEventStepsStore,
} from "@/app/(pages)/manada/[orgSlug]/criar-evento/event-step-store";
import { useInvalidateQueries } from "./useInvalidateQueries";

export function useResetEventStepData(step: EventSteps) {
  const { setDirtyStep } = useEventStepsStore();
  const { invalidateEventStore } = useInvalidateQueries();

  const resetEventStepData = async () => {
    setDirtyStep(step, false);
    await invalidateEventStore();
  };
  return { resetEventStepData };
}
