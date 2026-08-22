import { z } from "zod";
import { eventSchema } from "../models/event";

export const eventSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("read"),
    z.literal("create"),
    z.literal("update"),
    z.literal("delete"),
  ]),
  z.union([z.literal("Event"), eventSchema]),
]);

export type EventSubject = z.infer<typeof eventSubject>;
