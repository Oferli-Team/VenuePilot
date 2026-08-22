"use client";

import { CardEvent, type CardEventProps } from "./card-event";
import { Heading } from "../ui/heading";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

type CardsEventProps = {
  cards: CardEventProps[];
  title: string;
};

export const EventsCardsCarousel = ({ cards, title }: CardsEventProps) => {
  return (
    <div className="flex flex-col gap-6">
      <Heading lineLeft title={title} />
      <Carousel
        opts={{
          align: "start",
        }}
      >
        <CarouselContent className="gap-6">
          {cards?.length &&
            cards.map((card) => (
              <CarouselItem key={card.id} className="md:basis-1/2 lg:basis-1/3">
                <CardEvent key={card.id} {...card} btnLabel="Ver Detalhe" />
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
