"use client";

import { reais } from "@/lib/utils/money";
import { cn } from "@/lib/utils";
import React, { useMemo, useEffect, useState } from "react";
import { TicketPriceLabel } from "./ticket-price-label";
import { ButtonCounter } from "@/app/_components/ui/button-counter";
import { Separator } from "@/app/_components/ui/separator";
import { Button } from "@/app/_components/ui/button";
import { MANADA_DAY } from "../participar/constant";
import { EventDetailImage } from "./event-detail-image";
import { Card, CardContent } from "@/app/_components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/app/_components/ui/drawer";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { type TicketType, useTickets } from "./stores/ticket-store";
import { TicketByTypeReport } from "./ticket-by-type";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { useCupomDesconto } from "@/app/_components/coupon/useCupomDesconto";
import { useFormStore } from "@/app/_components/participante/useFormStore";

const Options = () => {
  const { ticket, setTicket, tickets } = useTickets();

  const getLabelManada = (idade: string) => {
    if (idade === "FREE_CHILD") return "Grátis";
    if (idade === "PAID_CHILD") return "Criança 6 a 10 anos";
    if (idade === "ADULT") return "Adultos e Crianças maiores de 11 anos";
    return "";
  };

  const { ticketsValue, ticketsType } = MANADA_DAY;

  const ticketsReport = useMemo(() => {
    const selectedTickets: Array<{
      type: TicketType;
      value: number;
      quantity: number;
    }> = [];

    if (ticket.ADULT > 0) {
      selectedTickets.push({
        type: "ADULT",
        value: ticketsValue.ADULT,
        quantity: ticket.ADULT,
      });
    }

    if (ticket.PAID_CHILD > 0) {
      selectedTickets.push({
        type: "PAID_CHILD",
        value: ticketsValue.PAID_CHILD,
        quantity: ticket.PAID_CHILD,
      });
    }

    if (ticket.FREE_CHILD > 0) {
      selectedTickets.push({
        type: "FREE_CHILD",
        value: ticketsValue.FREE_CHILD,
        quantity: ticket.FREE_CHILD,
      });
    }

    return selectedTickets;
  }, [ticket, ticketsValue]);

  return (
    <div className={cn("flex w-full flex-col gap-6 sm:gap-3")}>
      {tickets.length > 0 ? (
        ticketsReport.map((ticket, i) => (
          <TicketByTypeReport key={i + 1} {...ticket} />
        ))
      ) : (
        <>
          <TicketPriceLabel
            text={ticketsType.ADULT}
            label={getLabelManada("ADULT")}
            price={reais(ticketsValue.ADULT)}
            button={
              <ButtonCounter
                onDecrement={() =>
                  setTicket({
                    ...ticket,
                    ADULT: ticket.ADULT - 1,
                  })
                }
                onIncrement={() =>
                  setTicket({
                    ...ticket,
                    ADULT: ticket.ADULT + 1,
                  })
                }
                max={10}
                min={0}
                value={ticket.ADULT}
              />
            }
          />

          <Separator />

          <TicketPriceLabel
            text={ticketsType.PAID_CHILD}
            label={getLabelManada("PAID_CHILD")}
            price={reais(ticketsValue.PAID_CHILD)}
            button={
              <ButtonCounter
                onDecrement={() =>
                  setTicket({
                    ...ticket,
                    PAID_CHILD: ticket.PAID_CHILD - 1,
                  })
                }
                onIncrement={() =>
                  setTicket({
                    ...ticket,
                    PAID_CHILD: ticket.PAID_CHILD + 1,
                  })
                }
                max={10}
                min={0}
                value={ticket.PAID_CHILD}
              />
            }
          />

          <Separator />
          <TicketPriceLabel
            text={ticketsType.FREE_CHILD}
            label={getLabelManada("FREE_CHILD")}
            price={reais(ticketsValue.FREE_CHILD)}
            button={
              <ButtonCounter
                onDecrement={() =>
                  setTicket({ ...ticket, FREE_CHILD: ticket.FREE_CHILD - 1 })
                }
                onIncrement={() =>
                  setTicket({ ...ticket, FREE_CHILD: ticket.FREE_CHILD + 1 })
                }
                max={10}
                min={0}
                value={ticket.FREE_CHILD}
              />
            }
          />
        </>
      )}
    </div>
  );
};

export const TicketOptionsManadaDay = () => {
  const {
    setStartRegister,
    ticket,
    setTickets,
    startRegister,
    step,
    setStep,
    tickets,
  } = useTickets();

  const { setTopValue, setMethod, amount } = useCalcValueTopStore();
  const { eventRegister } = useFormStore();

  const { cupom } = useCupomDesconto();

  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const { titulo, banner, ticketsValue } = MANADA_DAY;

  const onRedirect = () => {
    setStartRegister(true);
    setOpen(false);

    const _tickets: Array<{
      type: TicketType;
      index: number;
      value: 0;
    }> = Object.entries(ticket)
      .filter(([_, value]) => value !== 0)
      .flatMap(([key, value]) =>
        Array.from({ length: value }, () => ({
          type: key as TicketType,
          value: 0 as const,
        })),
      )
      .map((item, i) => ({ ...item, index: i + 1, value: 0 as const }));

    setTickets(_tickets);
  };

  const disabled = useMemo(() => {
    return Object.values(ticket).every((value) => value === 0);
  }, [ticket]);

  const total = useMemo(() => {
    const _amount = Object.entries(ticket).reduce((acc, [key, quantity]) => {
      const price = ticketsValue[key as keyof typeof ticketsValue] || 0;
      return acc + price * quantity;
    }, 0);

    return _amount;
  }, [ticket, ticketsValue]);

  useEffect(() => {
    setTopValue(total);
  }, [total, setTopValue]);

  useEffect(() => {
    if (cupom && cupom?.desconto === 10000 && amount === 0) {
      setMethod("free");
    }
  }, [cupom, amount, setStep, setMethod]);

  const buttonFixed = `fixed bottom-0 left-0 right-0 z-20 h-24 justify-center w-full items-center border-t bg-card px-6 sm:hidden`;

  return (
    <>
      <aside
        className={`relative h-fit w-full space-y-4 sm:sticky sm:top-24 sm:w-[42rem] ${isMobile ? "hidden" : "block"}`}
      >
        <EventDetailImage
          src={eventRegister?.banner ?? banner}
          alt={`Imagem do top - ${titulo}`}
          className="relative hidden h-64 w-full overflow-hidden rounded-md bg-card sm:block"
        />
        <Card className="flex flex-col justify-between gap-6 p-4">
          {!eventRegister?.id ? (
            <CardContent>
              <p>Ingresso não disponível</p>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col gap-4 p-0 sm:p-0">
              <p className="font-bold">Ingressos</p>

              <Options />

              <div className="flex items-center justify-between border-t pt-4">
                <p>Total {tickets.length > 1 ? "Ingressos" : "Ingresso"}</p>
                <p className="text-2xl font-semibold">{reais(total)}</p>
              </div>

              {startRegister && (
                <Button
                  variant="ghostblue"
                  onClick={() => {
                    setStartRegister(false);
                    setTickets([]);
                    setStep("data");
                    setMethod("pix");
                  }}
                  type="button"
                  className="w-fit self-end"
                >
                  Voltar para selecionar Ingressos
                </Button>
              )}

              {!startRegister && (
                <Button
                  onClick={onRedirect}
                  className="mt-4 hidden font-semibold md:flex"
                  size="lg"
                  disabled={disabled}
                  type="button"
                >
                  Comprar Ingresso
                </Button>
              )}

              {startRegister && step === "data" && (
                <Button
                  className="mt-4 hidden font-semibold md:flex"
                  size="lg"
                  disabled={disabled}
                  type="submit"
                >
                  Continuar com Pagamento
                </Button>
              )}
            </CardContent>
          )}
        </Card>
      </aside>

      {isMobile && step === "data" && (
        <div className={buttonFixed}>
          <Button
            className="mt-4 h-14 w-full font-semibold"
            size="lg"
            disabled={disabled}
            type="submit"
          >
            Continuar com Pagamento
          </Button>
        </div>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger
          className={cn(buttonFixed, `${startRegister ? "hidden" : "flex"}`)}
        >
          {eventRegister?.id ? (
            <p className="font-semi-bold flex h-10 w-full items-center justify-center rounded-md bg-primary p-2 uppercase">
              Inscrição
            </p>
          ) : (
            <p>Ingresso não disponível</p>
          )}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="uppercase">Inscreva-se</DrawerTitle>
            <DrawerDescription />

            <Options />

            <Button
              onClick={onRedirect}
              className="mb-2 mt-6 flex font-semibold md:hidden"
              size="lg"
              disabled={disabled}
              type="button"
            >
              Comprar Ingresso
            </Button>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </>
  );
};
