"use client";

import { TicketItem } from "./ticket-item";
import { FaWhatsapp } from "react-icons/fa6";
import { type ReactNode } from "react";
import { type Inscricao, type Evento } from "@prisma/client";
import { maskCPF } from "@/lib/utils/maskCPF";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Backpack, Ticket as TicketIcon } from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { eventTypeMap } from "@/lib/constants";
import { ENUM_EVENT_TYPE } from "@/lib/enum";

type TicketItem = {
  title: string;
  description: ReactNode | string | number;
};

type Register = Pick<
  Inscricao,
  | "id"
  | "nome"
  | "cpf"
  | "tipoInscricao"
  | "status"
  | "checkinCode"
  | "lgnd_funcao"
  | "spouseName"
  | "spouseCPF"
>;

export type TicketProps = {
  register: Register & { hiddenGroupWhatsAppButton?: boolean };
  event: Pick<
    Evento,
    | "topNumero"
    | "linkWhatsappGrupoParticipante"
    | "linkWhatsappGrupoServir"
    | "local"
    | "pista"
    | "periodo"
    | "banner"
    | "type"
  >;
};

export const Ticket = ({ register, event }: TicketProps) => {
  const {
    topNumero,
    linkWhatsappGrupoParticipante,
    linkWhatsappGrupoServir,
    local,
    pista,
    periodo,
    banner,
  } = event;

  const {
    nome,
    cpf,
    status,
    checkinCode,
    tipoInscricao,
    lgnd_funcao,
    spouseName,
    spouseCPF,
    hiddenGroupWhatsAppButton = false,
  } = register;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const whatsGroup =
    tipoInscricao === "SERVIR"
      ? linkWhatsappGrupoServir
      : linkWhatsappGrupoParticipante;

  const statusTypes = [
    {
      status: "CONFIRMADA",
      label: "Confirmada",
      color: "text-green-600",
    },
    {
      status: "AGUARDANDO_PAGAMENTO",
      label: "Pendente",
      color: "text-destructive",
    },
    {
      status: "INSCREVENDO",
      label: "Pendente",
      color: "text-destructive",
    },
    {
      status: "CANCELADA_PELO_CLIENTE",
      label: "Reembolsado",
      color: "text-orange-600",
    },
  ];

  const inscricaoStatus = statusTypes.find((item) => item.status === status);
  const statusColor = inscricaoStatus?.color ?? "text-foreground";
  const isRegisterConfirmed = status === "CONFIRMADA";

  const type = event.type as ENUM_EVENT_TYPE;

  return (
    <Card className="relative flex w-full flex-col items-center gap-4 p-4 md:flex-row md:items-start">
      {/* Event title - Mobile */}
      <CardHeader className="z-10 flex w-full flex-col flex-wrap items-center p-0 text-center sm:hidden">
        <div className="w-full">
          <CardTitle>
            {eventTypeMap[type]}#{topNumero}
          </CardTitle>
          <CardDescription>{pista}</CardDescription>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{periodo}</p>
          <p>{local}</p>
        </div>
      </CardHeader>

      <div className="z-10 sm:pt-4">
        <h2 className="flex items-center pb-4 text-base font-bold text-muted-foreground">
          <TicketIcon className="mr-1" />
          Ticket
        </h2>
        {!checkinCode && (
          <div className="h-40 max-h-60 w-full max-w-60 overflow-hidden rounded-lg border">
            <Image
              src={banner}
              alt={`Banner do evento ${topNumero}`}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {checkinCode && (
          <>
            <div className="w-full max-w-60 overflow-hidden">
              <QRCodeSVG
                style={{
                  height: "100%",
                  maxWidth: "100%",
                  width: "100%",
                  background: "white",
                  padding: "6px",
                  border: "1px",
                  borderColor: "rgba(99, 99, 99, 0.4)",
                  borderRadius: "6px",
                }}
                value={checkinCode}
              />
            </div>
            <p className="pt-2 text-center text-xs sm:text-sm">
              QR code para check-in
            </p>
          </>
        )}
      </div>

      <div className="z-10 w-full items-start">
        <CardHeader className="text-for hidden flex-row flex-wrap items-center gap-6 sm:flex">
          <div className="border-r pr-6">
            <CardTitle>
              {eventTypeMap[type]}#{topNumero}
            </CardTitle>
            <CardDescription>{pista}</CardDescription>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{periodo}</p>
            <p>{local}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-0 sm:p-4">
          {type === ENUM_EVENT_TYPE.LEGENDARIOS ||
          type === ENUM_EVENT_TYPE.MANADADAY ? (
            <TicketItem
              className="text-center sm:hidden"
              title={nome ?? ""}
              description={cpf ? maskCPF(cpf) : "-"}
            />
          ) : (
            <div className="space-y-2 sm:hidden">
              <TicketItem
                className="text-center"
                title={nome ?? ""}
                description={cpf ? maskCPF(cpf) : "-"}
              />
              <TicketItem
                className="text-center"
                title={spouseName ?? ""}
                description={maskCPF(spouseCPF ?? "")}
              />
            </div>
          )}

          <div className="flex justify-between gap-4 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-4 md:gap-16">
            {type === ENUM_EVENT_TYPE.LEGENDARIOS ||
            type === ENUM_EVENT_TYPE.MANADADAY ? (
              <TicketItem
                title={nome ?? ""}
                description={cpf ? maskCPF(cpf) : "-"}
                className="hidden sm:block"
              />
            ) : (
              <div className="hidden space-y-2 sm:block">
                <p className="text-xs font-semibold sm:text-sm">Inscritos</p>
                <div className="space-y-2">
                  <TicketItem
                    title={nome ?? ""}
                    description={maskCPF(cpf ?? "")}
                  />
                  <TicketItem
                    title={spouseName ?? ""}
                    description={maskCPF(spouseCPF ?? "")}
                  />
                </div>
              </div>
            )}

            <TicketItem title="Inscricão" description={tipoInscricao} />

            {tipoInscricao === "SERVIR" &&
              lgnd_funcao &&
              isRegisterConfirmed && (
                <TicketItem
                  title="Função"
                  description={lgnd_funcao.replaceAll("_", " ")}
                />
              )}
            <TicketItem
              title="Status"
              description={inscricaoStatus?.label}
              descriptionColor={statusColor}
            />
          </div>

          {isRegisterConfirmed && (
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              {tipoInscricao === "PARTICIPANTE" &&
                type === ENUM_EVENT_TYPE.LEGENDARIOS && (
                  <Button asChild>
                    <a
                      href="https://www.legendariosms.com/mochila"
                      target="_blank"
                    >
                      <Backpack className="mr-1 h-4 w-4" />
                      Acessar a lista
                    </a>
                  </Button>
                )}
              {!hiddenGroupWhatsAppButton && (
                <Button asChild className="bg-success hover:bg-success/90">
                  <a href={whatsGroup} target="_blank">
                    <FaWhatsapp className="mr-1 h-4 w-4" />
                    Entrar no Grupo
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </div>

      <div className="absolute bottom-0 right-0 top-0 z-0 flex justify-end">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-card via-card/60 to-transparent sm:bg-gradient-to-r sm:via-card/10"></div>

        <div className="items-end opacity-10">
          <Image
            src={banner}
            width={600}
            height={600}
            alt={`Banner do evento ${topNumero}`}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </Card>
  );
};
