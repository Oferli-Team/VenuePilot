import { env } from "@/env";
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "incricao-top-dev",
  eventKey: env.INNGEST_EVENT_KEY,
});
