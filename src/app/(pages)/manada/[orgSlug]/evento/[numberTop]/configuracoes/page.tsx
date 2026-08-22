"use client";

import { ActiveRegisterEventSettings } from "@/components/active-register-event-settings";
import Fieldset from "@/components/Fiedset";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContainerSpace } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Unauthorized } from "@/components/unauthorized";
import { eventTypeMap } from "@/lib/constants";
import type { ENUM_EVENT_TYPE } from "@/lib/enum";
import { getCurrentMembership } from "@/lib/hooks/member";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { type ManadaPagesParams } from "@/lib/types";
import { isSuperAdmin } from "@/lib/utils/hasRole";
import { api } from "@/trpc/react";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function SettingsPage({ params }: ManadaPagesParams) {
  const { numberTop: eventSlug, orgSlug } = params;

  const { membership } = getCurrentMembership();

  const { invalidateEventSettings } = useInvalidateQueries();
  const { orgsRoutes } = useEventRoutes({});

  const { data: eventData, isPending } = api.evento.getSettingsEvent.useQuery(
    {
      eventSlug,
      orgSlug,
    },
    { enabled: !!eventSlug && !!orgSlug },
  );

  const { mutateAsync: updatePostedEvent, isPending: isUpdatingPostedEvent } =
    api.evento.updatePostedEvent.useMutation({
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

  if (!membership || isPending) {
    return (
      <ContainerSpace>
        <Heading title="Configurações" icon={Settings} />

        <Skeleton className="h-56 w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </ContainerSpace>
    );
  }

  if (!isSuperAdmin(membership)) {
    return <Unauthorized />;
  }

  const handleUpdatePostedEvent = async (value: boolean) => {
    await updatePostedEvent({
      orgSlug,
      eventSlug,
      posted: value,
    });
  };

  return (
    <ContainerSpace className="relative mx-auto max-w-screen-2xl">
      <Heading title="Configurações" icon={Settings} />

      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>{`${eventTypeMap[eventData?.type as ENUM_EVENT_TYPE]}#${eventSlug}`}</CardTitle>
            <CardDescription>
              O evento que estiver publicado, poderá ser acessado por todos os
              usuários. Para ativar as inscrições, veja as opções abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className={`sm:p-2`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">
                {eventData?.eventIsOpen
                  ? "Evento está público"
                  : "Evento não publicado, clique para ativar"}
              </p>
              <Fieldset legend={"Status"}>
                <Switch
                  checked={eventData?.eventIsOpen}
                  disabled={isUpdatingPostedEvent}
                  onCheckedChange={handleUpdatePostedEvent}
                />
              </Fieldset>
            </div>

            <Link
              href={orgsRoutes.event.edit}
              className="text-sm text-blue-600"
            >
              Preciso editar o evento
            </Link>
          </CardContent>
        </Card>

        <ActiveRegisterEventSettings
          event={eventData}
          eventSlug={eventSlug}
          orgSlug={orgSlug}
        />
      </div>
    </ContainerSpace>
  );
}
