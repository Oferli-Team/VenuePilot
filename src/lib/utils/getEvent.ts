import { api } from "@/trpc/server";
import { type ManadaPagesParams } from "../types";

type GetEventProps = {
  params: ManadaPagesParams["params"];
};

export async function getEvent({ params }: GetEventProps) {
  return await api.evento.getEventBySlug({
    slug: params.numberTop,
  });
}
