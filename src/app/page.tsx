import { Section } from "@/components/ui/section";
import { GoogleAnalytics } from "@next/third-parties/google";
import { env } from "@/env";

import { api } from "@/trpc/server";
import { EventsCardsCarousel } from "@/components/evento-top/events-cards-carousel";
import { HeadingHomeHero } from "@/components/heading-home-hero";
import { EventsHeroCarousel } from "@/components/evento-top/events-hero-carousel";

export default async function Home() {
  const eventsHero = await api.evento.getHeroEvents();
  const closedEvents = await api.evento.getEventsClosed();
  const onGoingEvents = await api.evento.getOnGoingEvents();

  return (
    <div className="relative mb-24 flex flex-col items-center justify-center gap-12 pt-28">
      <Section className="flex flex-col justify-between gap-12 bg-home bg-contain bg-bottom bg-no-repeat sm:flex-row sm:items-center sm:gap-6">
        <HeadingHomeHero className="w-auto px-4 sm:px-0" />
        <EventsHeroCarousel cards={eventsHero} />
      </Section>

      <Section className="rounded-md bg-primary/50 bg-gradient-to-l from-card/80 to-card py-6">
        <EventsCardsCarousel cards={onGoingEvents} title="Próximos" />
      </Section>

      <Section className="rounded-md bg-primary/50 bg-gradient-to-l from-card/80 to-card py-6">
        <EventsCardsCarousel cards={closedEvents} title="Encerrados" />
      </Section>
      <GoogleAnalytics gaId={env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
    </div>
  );
}
