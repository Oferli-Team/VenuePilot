import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { cupomRouter } from "./routers/cupom";
import { dashboardRouter } from "./routers/dashboard";
import { eventoRouter } from "./routers/evento";
import { inscricaoRouter } from "./routers/inscricao";
import { linkSecretoRouter } from "./routers/linkSecreto";
import { organizationRouter } from "./routers/organization";
import { payloadRouter } from "./routers/payload";
import { memberRouter } from "./routers/member";
import { inviteRouter } from "./routers/invite";
import { vehicleRouter } from "./routers/vehicle";
import { integrationRoute } from "./routers/integration";
import { paymentsRoute } from "./routers/payments";
import { manandaDayRoute } from "./routers/manada-day";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  member: memberRouter,
  invite: inviteRouter,
  inscricao: inscricaoRouter,
  cupom: cupomRouter,
  dashboard: dashboardRouter,
  evento: eventoRouter,
  linkSecreto: linkSecretoRouter,
  payload: payloadRouter,
  organization: organizationRouter,
  vehicle: vehicleRouter,
  integration: integrationRoute,
  payments: paymentsRoute,
  manadaDay: manandaDayRoute,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
