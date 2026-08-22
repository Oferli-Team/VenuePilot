"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/trpc/react";
import Image, { type ImageProps } from "next/image";
import { type LinkSecreto } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { WHATSAPP_BASE_URL } from "@/lib/whatsapp";
import { ITOP } from "@/lib/constants";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { IconText } from "../ui/icon-text";
import { Badge } from "../ui/badge";
import { FaWhatsapp } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import { Backpack, Calendar, MapPin, Pin } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { TicketOptions } from "./ticket-options";

const EventImage = ({ ...props }: ImageProps) => (
  <Image
    {...props}
    className="h-full w-full"
    width={600}
    height={400}
    alt={props.alt}
  />
);

const EventBadge = ({
  isClosed,
  isBothOpen,
  secretLink,
}: {
  isClosed: boolean;
  isBothOpen: boolean;
  secretLink?: LinkSecreto;
}) => {
  const getBadgeIconColor = () => {
    if (secretLink) {
      if (secretLink.ativo) {
        return "text-success";
      } else {
        return "text-muted-foreground";
      }
    }
    if (isClosed) return "text-destructive";
    if (isBothOpen) return "text-success";
    return "text-muted-foreground";
  };

  const getBadgeLabel = () => {
    if (secretLink) {
      if (secretLink.ativo) {
        return "Ativo";
      } else {
        return "Indisponível";
      }
    }
    if (isClosed) return "Indisponível";
    if (isBothOpen) return "Ativo";
    return "";
  };

  return (
    <Badge variant="secondary" className="absolute left-0 top-0 z-10 m-2 gap-1">
      <GoDotFill className={getBadgeIconColor()} />
      {getBadgeLabel()}
    </Badge>
  );
};

export type EventDetailPros = {
  type: ENUM_EVENT_TYPE;
  id: string;
  banner: string;
  titulo: string;
  subtitulo: string;
  description: string;
  topNumero: number;
  periodo: string;
  contact?: string;
  local: string;
  localSaida: string;
  localUrl: string;
  vagasServir: number;
  vagasParticipar: number;
  valorParticipante: number;
  valorParaObterCertificacao?: number;
  valorParaLgndCertificados: number;
  openServir: boolean;
  openParticipar: boolean;
  secretLink?: LinkSecreto;
  list?: string;
};

export const EventDetail = ({
  id,
  secretLink,
  banner,
  titulo,
  subtitulo,
  topNumero,
  periodo,
  local,
  localSaida,
  localUrl,
  description,
  vagasParticipar,
  vagasServir,
  valorParaLgndCertificados,
  valorParaObterCertificacao,
  valorParticipante,
  openParticipar,
  openServir,
  type,
  list,
}: EventDetailPros) => {
  const router = useRouter();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSoldOutParticipant, setIsSoldOutParticipant] = useState(false);
  const [isSoldOutServe, setIsSoldOutServe] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const { publicRoutes } = useEventRoutes({
    topNumber: String(topNumero),
  });

  const { data: allParticipantesRegistered } =
    api.inscricao.getAllParticipantes.useQuery({
      status: "CONFIRMADA",
      eventoId: id,
    });

  const { data: allServirRegistered } = api.inscricao.getAllServir.useQuery({
    status: "CONFIRMADA",
    eventoId: id,
  });

  useEffect(() => {
    if (allParticipantesRegistered) {
      setIsSoldOutParticipant(
        allParticipantesRegistered.length >= vagasParticipar,
      );
    }
    if (allServirRegistered) {
      setIsSoldOutServe(allServirRegistered.length >= vagasServir);
    }
  }, [
    vagasParticipar,
    vagasServir,
    allParticipantesRegistered,
    allServirRegistered,
  ]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const routeMap = {
    [ENUM_EVENT_TYPE.LEGENDARIOS]: {
      participate: publicRoutes.register.legendary.participate,
      serve: publicRoutes.register.legendary.serve,
    },
    [ENUM_EVENT_TYPE.REM]: {
      participate: publicRoutes.register.rem.participate,
      serve: publicRoutes.register.rem.serve,
    },
    [ENUM_EVENT_TYPE.LEGADO_FILHA]: {
      participate: publicRoutes.register.legacyDaughter.participate,
      serve: publicRoutes.register.legacyDaughter.serve,
    },
    [ENUM_EVENT_TYPE.LEGADO_FILHO]: {
      participate: publicRoutes.register.legacySon.participate,
      serve: publicRoutes.register.legacySon.serve,
    },
  } as const;

  const linkRegisterParticipant = useMemo(
    () => routeMap[type]?.participate ?? "",
    [type, publicRoutes.register],
  );

  const linkRegisterLegendary = useMemo(
    () => routeMap[type]?.serve ?? "",
    [type, publicRoutes.register],
  );

  const handlePushParticipantPage = () => {
    if (secretLink?.link) {
      setOpenDrawer(false);
      router.push(`${linkRegisterParticipant}?link=${secretLink.link}`);
      return;
    }
    setOpenDrawer(false);
    router.push(linkRegisterParticipant);
  };

  const handlePushServePage = () => {
    if (secretLink?.link) {
      setOpenDrawer(false);
      router.push(`${linkRegisterLegendary}?link=${secretLink?.link}`);
      return;
    }
    setOpenDrawer(false);
    router.push(linkRegisterLegendary);
  };

  const isSoldOut = isSoldOutParticipant && isSoldOutServe; // inscrição para servir e participar esgotadas

  return (
    <>
      <section
        className={`relative z-10 mb-28 mt-20 flex justify-between gap-8 bg-cover bg-center bg-no-repeat sm:mt-24 md:mb-24`}
      >
        <div className="w-full">
          <Button
            variant="link"
            className="mb-2 p-0"
            onClick={() => router.back()}
          >
            Voltar
          </Button>

          {!secretLink?.ativo && isSoldOut && (
            <p className="sticky top-[4.5rem] z-10 mb-2 rounded-md bg-destructive p-1 text-center font-bold drop-shadow-md md:hidden">
              INSCRIÇÕES ESGOTADAS
            </p>
          )}
          <div className="relative mb-4 block h-48 w-full overflow-hidden rounded-md md:hidden">
            {!imageLoaded && (
              <Skeleton className="absolute bottom-0 left-0 top-0  h-full w-full bg-muted" />
            )}
            <EventImage
              src={banner}
              alt={`Imagem do top - ${titulo}`}
              onLoad={handleImageLoad}
              className="object-cover"
            />
            <EventBadge
              isClosed={isSoldOut}
              isBothOpen={openParticipar && openServir}
              secretLink={secretLink}
            />
          </div>

          <div className="relative flex flex-col gap-2">
            <h1 className="m-0 p-0 text-xl font-bold sm:text-3xl">{titulo}</h1>
            <h2 className="text-base font-semibold sm:text-lg">{subtitulo}</h2>
          </div>
          <div className="mt-4 flex flex-col gap-2 ">
            <IconText
              icon={MapPin}
              text={local}
              iconClassName="size-4 sm:size-5 text-primary"
              className="text-base sm:text-lg"
            />

            <IconText
              icon={Calendar}
              text={periodo}
              className="text-base sm:text-lg"
              iconClassName="size-4 sm:size-5 text-primary"
            />
          </div>
          <article
            className="mt-6 flex flex-col gap-2 text-sm leading-6"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <Accordion
            type="single"
            className="mt-6 w-full space-y-4"
            defaultValue="locale"
            collapsible
          >
            {list && (
              <AccordionItem value="list" className="bg-card">
                <AccordionTrigger
                  className="font-medium sm:text-base"
                  icon={<Backpack className="size-4" />}
                >
                  Lista do que levar para o evento
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    className="text-sm leading-6 tracking-wide [&>h1]:mb-1 [&>h2]:mb-1 [&>h3]:mb-1 [&>hr]:my-4 [&>ol]:mb-4 [&>ul]:mb-4"
                    dangerouslySetInnerHTML={{ __html: list }}
                  />
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="locale" className="bg-card">
              <AccordionTrigger
                className="md:text-lg"
                icon={<Pin className="size-4" />}
              >
                Local
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2 text-sm sm:text-base">{localSaida}</p>

                {localUrl !== "" && (
                  <Button className="w-fit" asChild>
                    <a target="_blank" href={localUrl}>
                      Como Chegar
                    </a>
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <aside className="sticky top-24 hidden h-fit w-[42rem] space-y-4 md:block">
          <div className="relative h-64 w-full overflow-hidden rounded-md bg-card">
            {!imageLoaded && (
              <Skeleton className="absolute bottom-0 left-0 top-0 z-0 h-full w-full bg-muted" />
            )}
            <EventImage
              src={banner}
              alt={`Imagem do top - ${titulo}`}
              onLoad={handleImageLoad}
            />
            <EventBadge
              isClosed={isSoldOut}
              isBothOpen={openServir && openParticipar}
              secretLink={secretLink}
            />
          </div>
          <Card className="flex flex-col justify-between gap-6 p-4">
            <CardContent className="flex flex-col gap-2 p-0 sm:p-0">
              {isSoldOut ? null : <p className="font-bold">Inscreva-se</p>}

              <TicketOptions
                isSoldOutParticipant={isSoldOutParticipant}
                isSoldOutServe={isSoldOutServe}
                type={type}
                openParticipar={openParticipar}
                openServir={openServir}
                valorParticipante={valorParticipante}
                valorParaLgndCertificados={valorParaLgndCertificados}
                valorParaObterCertificacao={valorParaObterCertificacao}
                handlePushParticipantPage={handlePushParticipantPage}
                handlePushServePage={handlePushServePage}
                secretLink={secretLink}
              />
            </CardContent>
          </Card>
        </aside>
      </section>

      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerTrigger className="fixed bottom-0 left-0 right-0 z-20 h-24 border-t bg-card px-6 sm:hidden">
          <p className="font-semi-bold flex h-10 w-full items-center justify-center rounded-md bg-primary p-2 uppercase">
            Inscrição
          </p>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="uppercase">Inscreva-se</DrawerTitle>
            <DrawerDescription> </DrawerDescription>
          </DrawerHeader>
          <div className="flex w-full flex-col justify-center gap-8 px-6 pb-6">
            <TicketOptions
              isSoldOutParticipant={isSoldOutParticipant}
              isSoldOutServe={isSoldOutServe}
              type={type}
              openParticipar={openParticipar}
              openServir={openServir}
              valorParticipante={valorParticipante}
              valorParaLgndCertificados={valorParaLgndCertificados}
              valorParaObterCertificacao={valorParaObterCertificacao}
              handlePushParticipantPage={handlePushParticipantPage}
              handlePushServePage={handlePushServePage}
              secretLink={secretLink}
            />

            <Link
              href={`${WHATSAPP_BASE_URL}${ITOP.whatsapp_suporte}`}
              className="flex w-fit items-center gap-1 self-center py-2 text-sm text-primary underline"
            >
              <FaWhatsapp size={16} />
              Falar com suporte
            </Link>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
