"use client";

import { CardEvent, type CardEventProps } from "./card-event";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { useIsMobile } from "@/lib/hooks/ismobile";
import Autoplay from "embla-carousel-autoplay";

type CardsEventProps = {
  cards: CardEventProps[];
};

export const EventsHeroCarousel = ({ cards }: CardsEventProps) => {
  const isMobile = useIsMobile();
  return (
    <div className="mb-6 w-full sm:max-w-sm">
      <Carousel
        opts={{
          align: isMobile ? "center" : "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            stopOnFocusIn: true,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            delay: 4000,
          }),
        ]}
      >
        <CarouselContent className="-ml-2 md:-ml-0">
          {cards?.length &&
            cards.map((card) => (
              <CarouselItem
                key={card.id}
                className="basis-[85%] md:basis-[100%]"
              >
                <CardEvent key={card.id} {...card} btnLabel="Ver Detalhe" />
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="hidden text-primary opacity-60 shadow-md hover:opacity-100 sm:block md:-bottom-14 md:left-[43%] md:top-auto" />
        <CarouselNext className="hidden text-primary opacity-60 shadow-md hover:opacity-100 sm:block md:-bottom-14 md:right-[37%] md:top-auto" />
      </Carousel>
    </div>
  );
};
