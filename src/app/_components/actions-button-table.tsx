"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLinkInscritosOrLgndServir } from "@/lib/constants";
import { type ModalId, useModalStore } from "@/lib/store/ModalStore";
import { isAdmin, isHakuna } from "@/lib/utils/hasRole";
import { ClipboardPlus, FileText, Mails, SquarePen, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "./ui/use-toast";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { getCurrentMembership } from "@/lib/hooks/member";
import type { Loading } from "@/lib/types";
import React from "react";
import { createDisclaimerByUser } from "@/lib/queries/client";
import { ENUM_CHECKIN_STATUS, ENUM_EVENT_TYPE } from "@/lib/enum";
import { useEventStore } from "@/lib/store/EventStore";

export const ActionsButtonTable = ({
  registerId,
  checkinStatus,
}: {
  registerId: string;
  checkinStatus: ENUM_CHECKIN_STATUS | null;
}) => {
  const { membership } = getCurrentMembership();
  const { event } = useEventStore();

  const pathname = usePathname();
  const url = getLinkInscritosOrLgndServir(pathname);
  const { orgsRoutes } = useEventRoutes({
    userId: registerId,
    userType: url,
  });

  const { openModal, inscricao } = useModalStore();

  const [loading, setLoading] = React.useState<Loading>("initial");

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    modalId: ModalId,
  ) => {
    // impede de abrir o sidebar
    e.stopPropagation();
    if (!inscricao) {
      toast({
        title: "Ops, não foi possível abrir edição",
        variant: "destructive",
      });
      return;
    }

    openModal(modalId, inscricao);
  };

  const createAutentiqueDoc = async () => {
    setLoading("loading");
    try {
      if (!inscricao) return;

      const result = await createDisclaimerByUser({
        id: inscricao.id,
        cpf: inscricao.cpf!,
        nome: inscricao.nome!,
        email: inscricao.email!,
        celular: inscricao.celular!,
        dataNascimento: inscricao.dataNascimento,
        tipoInscricao: inscricao.tipoInscricao!,
        estadoCivil: inscricao.estadoCivil!,
        nomeContatoEmergencia: inscricao.nomeContatoEmergencia!,
        celularContatoEmergencia: inscricao.celularContatoEmergencia!,
        rua: inscricao.rua!,
        ruaNumero: inscricao.ruaNumero!,
        bairro: inscricao.bairro!,
        cidade: inscricao.cidade!,
        cep: inscricao.cep!,
        evento: {
          id: inscricao.evento.id,
          pista: inscricao.evento.pista,
          dataInicio: inscricao.evento.dataInicio,
          topNumero: inscricao.evento.topNumero,
        },
      });

      if (result.create) {
        toast({
          title: "Termo de responsabilidade criado!",
          description:
            "Está disponível na Autentique e foi enviado para o participante  via whatsapp",
          variant: "success",
        });
        return;
      }

      toast({
        title: "Não foi possível criar termo",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Não foi possível criar termo",
        variant: "destructive",
      });
      console.log({ error });
    } finally {
      setLoading("initial");
    }
  };

  const isAdminRole = isAdmin(membership);
  const isHakunaRole = isHakuna(membership);

  const isLegendaryEvent =
    (event?.type as ENUM_EVENT_TYPE) === ENUM_EVENT_TYPE.LEGENDARIOS;

  const isCheckInRoute = pathname.includes("/checkin");
  const isHakunaRoute = pathname.includes("/hakuna");
  const isLettersRoute = pathname.includes("/cartas");

  const notAbleToCreateTermDoc =
    checkinStatus !== null &&
    checkinStatus !== ENUM_CHECKIN_STATUS.INVALID_DOCUMENTS;

  return (
    <DropdownMenu>
      <TooltipProvider>
        <div className="flex items-center justify-center">
          {isAdminRole ? (
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={orgsRoutes.event.userDetail}>
                    <User className="h-4 w-4 text-foreground" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver detalhe</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <></>
          )}

          {isAdminRole && isCheckInRoute && isLegendaryEvent ? (
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  loading={loading === "loading"}
                  disabled={notAbleToCreateTermDoc}
                  onClick={createAutentiqueDoc}
                >
                  <FileText className="h-4 w-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enviar termo de responsabilidade</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <></>
          )}

          {isCheckInRoute && (
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className=""
                  onClick={(e) => handleClick(e, "checkIn_obs")}
                >
                  <SquarePen className="h-4 w-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar observação de Check-in</p>
              </TooltipContent>
            </Tooltip>
          )}

          {isHakunaRoute && isHakunaRole && (
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className=""
                  onClick={(e) => handleClick(e, "health_obs")}
                >
                  <ClipboardPlus className="h-4 w-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar observação de Saúde</p>
              </TooltipContent>
            </Tooltip>
          )}

          {isLettersRoute && (
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleClick(e, "letters_obs")}
                >
                  <Mails className="h-4 w-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar observação Cartas</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </DropdownMenu>
  );
};
