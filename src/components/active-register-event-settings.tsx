"use client";

import { Ticket } from "lucide-react";
import { ActionTicketCard } from "./event/settings/action-ticket-card";
import { api } from "@/trpc/react";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { toast } from "./ui/use-toast";
import { GridTwoColumns } from "./grid-two-columns";
import { ENUM_EVENT_TYPE, ENUM_REGISTER_TYPE } from "@/lib/enum";

type ActiveRegisterEventSettingsProps = {
  event:
    | {
        type: string | undefined;
        offeredSpotsParticipants: number | undefined;
        offeredSpotsLegendary: number | undefined;
        registrationIsOpenParticipants: boolean | undefined;
        registrationIsOpenLegendary: boolean | undefined;
        eventIsOpen: boolean | undefined;
        occupiedSpotsParticipant: number | undefined;
        occupiedSpotsLegendary: number | undefined;
      }
    | undefined
    | null;
  eventSlug: string;
  orgSlug: string;
};

export const ActiveRegisterEventSettings = ({
  event,
  eventSlug,
  orgSlug,
}: ActiveRegisterEventSettingsProps) => {
  const { invalidateEventSettings } = useInvalidateQueries();

  const {
    mutateAsync: updateRegisterStatus,
    isPending: isUpdatingRegisterStatus,
  } = api.evento.updateRegisterStatus.useMutation({
    onSuccess: async () => {
      await invalidateEventSettings();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar status",
        variant: "destructive",
      });
    },
  });

  const handleUpdateRegisterParticipantsStatus = async (value: boolean) => {
    await updateRegisterStatus({
      orgSlug,
      eventSlug,
      openParticipar: value,
    });
  };

  const handleUpdateRegisterLegendaryStatus = async (value: boolean) => {
    await updateRegisterStatus({
      orgSlug,
      eventSlug,
      openServir: value,
    });
  };

  const mappingEventType: Record<
    ENUM_EVENT_TYPE,
    Record<ENUM_REGISTER_TYPE, { title: string; description: string }>
  > = {
    [ENUM_EVENT_TYPE.LEGENDARIOS]: {
      [ENUM_REGISTER_TYPE.PARTICIPANTE]: {
        title: "Senderista",
        description: "Opção de inscrição para Senderistas",
      },
      [ENUM_REGISTER_TYPE.SERVIR]: {
        title: "Legendários",
        description:
          "Opção de inscrição para legendários certificados e não certificados",
      },
    },
    [ENUM_EVENT_TYPE.REM]: {
      [ENUM_REGISTER_TYPE.PARTICIPANTE]: {
        title: "Casal Participante",
        description:
          "Opção de inscrição para casais que irão participar pela primeira vez no evento REM",
      },
      [ENUM_REGISTER_TYPE.SERVIR]: {
        title: "Casal Servir",
        description:
          "Opção de inscrição para casais que irão servir no evento REM",
      },
    },
    [ENUM_EVENT_TYPE.LEGADO_FILHA]: {
      [ENUM_REGISTER_TYPE.PARTICIPANTE]: {
        title: "Pai e Filha",
        description:
          "Opção de inscrição para pais e filhas que irão participar pela primeira vez",
      },
      [ENUM_REGISTER_TYPE.SERVIR]: {
        title: "Servir",
        description:
          "Opção de inscrição para quem irá servir no evento Legado Filha",
      },
    },
    [ENUM_EVENT_TYPE.LEGADO_FILHO]: {
      [ENUM_REGISTER_TYPE.PARTICIPANTE]: {
        title: "Pai e Filho",
        description:
          "Opção de inscrição para pais e filhos que irão participar pela primeira vez",
      },
      [ENUM_REGISTER_TYPE.SERVIR]: {
        title: "Servir",
        description:
          "Opção de inscrição para quem irá servir no evento Legado Filho",
      },
    },
  };

  return (
    event && (
      <GridTwoColumns>
        <ActionTicketCard
          title={
            mappingEventType[event.type as ENUM_EVENT_TYPE][
              ENUM_REGISTER_TYPE.PARTICIPANTE
            ].title
          }
          description={
            mappingEventType[event?.type as ENUM_EVENT_TYPE][
              ENUM_REGISTER_TYPE.PARTICIPANTE
            ].description
          }
          icon={Ticket}
          actions={{
            label: event?.registrationIsOpenParticipants ? "Ativo" : "Inativo",
            checked: event?.registrationIsOpenParticipants ?? false,
            disabled: isUpdatingRegisterStatus,
            onCheckedChange: (value) => {
              void handleUpdateRegisterParticipantsStatus(value);
            },
          }}
          progress={{
            label: "Vagas preenchidas",
            current: event?.occupiedSpotsParticipant ?? 0,
            total: event?.offeredSpotsParticipants ?? 0,
          }}
          obs="Atenção! Mesmo que as vagas estejam preenchidas e as inscrições desativadas, poderá se inscrever no evento àqueles que tiverem com link secreto com vagas disponíveis e link ativo."
        />

        <ActionTicketCard
          title={
            mappingEventType[event?.type as ENUM_EVENT_TYPE][
              ENUM_REGISTER_TYPE.SERVIR
            ].title
          }
          description={
            mappingEventType[event?.type as ENUM_EVENT_TYPE][
              ENUM_REGISTER_TYPE.SERVIR
            ].description
          }
          icon={Ticket}
          actions={{
            label: event?.registrationIsOpenLegendary ? "Ativo" : "Inativo",
            checked: event?.registrationIsOpenLegendary ?? false,
            disabled: isUpdatingRegisterStatus,
            onCheckedChange: (value) => {
              void handleUpdateRegisterLegendaryStatus(value);
            },
          }}
          progress={{
            label: "Vagas preenchidas",
            current: event?.occupiedSpotsLegendary ?? 0,
            total: event?.offeredSpotsLegendary ?? 0,
          }}
          obs="Atenção! Mesmo que as vagas estejam preenchidas e as inscrições desativadas, poderá se inscrever no evento àqueles que tiverem com link secreto com vagas disponíveis e link ativo."
        />
      </GridTwoColumns>
    )
  );
};
