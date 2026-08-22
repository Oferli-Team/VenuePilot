import { DetailBlur } from "@/components/DetailBlur";
import { NotFound } from "@/components/not-found";
import {
  EventDetail,
  type EventDetailPros,
} from "@/components/evento-top/event-detail";
import { EventDetailSkeleton } from "@/components/evento-top/event-detail-skeleton";

import { Section } from "@/components/ui/section";
import { api } from "@/trpc/server";
import { Suspense } from "react";
import { type ENUM_EVENT_TYPE } from "@/lib/enum";

type TopEventPageParams = {
  params: {
    slug: string;
  };
};

export default async function TopEventPage({ params }: TopEventPageParams) {
  const { slug } = params;
  const topNumber = Number(slug);

  const eventPosted = await api.evento.getEventPostedByNumberTop({ topNumber });

  if (!eventPosted?.id) {
    return (
      <div className="h-screen bg-home bg-center bg-no-repeat">
        <Section className="flex h-full  flex-col items-center justify-center">
          <DetailBlur />
          <NotFound />
        </Section>
      </div>
    );
  }

  const event: EventDetailPros = {
    ...eventPosted,
    type: eventPosted.type as ENUM_EVENT_TYPE,
  };

  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetail {...event} />
    </Suspense>
  );
}
