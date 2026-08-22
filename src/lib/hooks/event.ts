"use client";
import { api } from "@/trpc/react";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { useEventStore } from "../store/EventStore";
import { useEffect } from "react";
import { getCurrentEventFromCookie } from "../utils/getCurrentEventFromCookie";

export const useFindManyEvent = () => {
  const orgSlug = getCurrentOrgFromCookie();
  const { data: events, isLoading } = api.evento.getEvents.useQuery({
    orgSlug: orgSlug ?? "",
  });
  return { events, isLoading };
};

export const useFindEvent = () => {
  const orgSlug = getCurrentOrgFromCookie();
  const eventSlug = getCurrentEventFromCookie();

  const { setEvent } = useEventStore();

  const { data: event, isLoading } = api.evento.getEventDetails.useQuery({
    orgSlug: orgSlug ?? "",
    eventSlug: eventSlug ?? "",
  });

  useEffect(() => {
    if (event) {
      setEvent(event);
      return;
    }
    setEvent(null);
  }, [event, setEvent]);

  return { event, isLoading };
};
