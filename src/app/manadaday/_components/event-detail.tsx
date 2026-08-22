"use client";

import { Pin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/_components/ui/accordion";
import { Button } from "@/app/_components/ui/button";
import { useFormStore } from "@/app/_components/participante/useFormStore";
import { MANADA_DAY } from "../participar/constant";

export const EventDetail = () => {
  const { eventRegister } = useFormStore();

  const { description, local } = MANADA_DAY;

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="gap-2 rounded-md border bg-card p-4">
        <article
          className="flex flex-1 flex-col gap-2 text-base leading-6"
          dangerouslySetInnerHTML={{
            __html: eventRegister?.description ?? description,
          }}
        />
      </div>

      <Accordion
        type="single"
        className="w-full space-y-4"
        defaultValue="locale"
        collapsible
      >
        <AccordionItem value="locale" className="bg-card">
          <AccordionTrigger
            className="md:text-lg"
            icon={<Pin className="size-4" />}
          >
            Local
          </AccordionTrigger>
          <AccordionContent>
            <p className="mb-2 text-sm sm:text-base">
              {eventRegister?.local ?? local}
            </p>

            {eventRegister?.localUrl && (
              <Button
                className="w-fit"
                asChild
                disabled={!eventRegister?.localUrl}
              >
                <a target="_blank" href={eventRegister?.localUrl}>
                  Como Chegar
                </a>
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
