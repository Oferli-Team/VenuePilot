import { z } from "zod";

export const eventSchema = z.object({
  __typename: z.literal("Event").default("Event"),
  id: z.string(),
  eventId: z.string(),
  ownerId: z.string(),
});

export type Event = z.infer<typeof eventSchema>;
