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
    link: string;
    slug: string;
  };
};
// TEMP SOLUTION TO KEPP THE SECRET LINK FOR TOP 1099
export default async function TopEventPage({ params }: TopEventPageParams) {
  const { link, slug } = params;

  const evento = await api.evento.getEventBySlug({ slug });

  if (!evento?.id) {
    return (
      <div className="h-screen bg-home bg-center bg-no-repeat">
        <Section className="flex h-full  flex-col items-center justify-center">
          <DetailBlur />
          <NotFound />
        </Section>
      </div>
    );
  }

  const linkSecreto = await api.linkSecreto.getByLink({
    link,
    eventoId: evento.id,
  });

  if (!linkSecreto) {
    return (
      <div className="h-screen bg-home bg-center bg-no-repeat">
        <Section className="flex h-full  flex-col items-center justify-center">
          <DetailBlur />
          <NotFound
            title="Ops, link inválido!"
            description="Você pode ter digitado algo errado ou o link não existe."
          />
        </Section>
      </div>
    );
  }

  const secretLinkIsValid = linkSecreto?.quantidade > linkSecreto?.usadoCount;

  if (!secretLinkIsValid) {
    return (
      <div className="h-screen bg-home bg-center bg-no-repeat">
        <Section className="flex h-full  flex-col items-center justify-center">
          <DetailBlur />
          <NotFound
            title="Ops, link inválido!"
            description="Este link foi expirado, tente um novo link."
          />
        </Section>
      </div>
    );
  }

  const event: EventDetailPros = {
    ...evento,
    type: evento.type as ENUM_EVENT_TYPE,
  };

  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetail secretLink={linkSecreto} {...event} />
    </Suspense>
  );
}
