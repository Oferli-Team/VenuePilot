"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { setEventInCookie } from "@/lib/utils/getCurrentEventFromCookie";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { type Evento } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "./ui/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { eventTypeMap } from "@/lib/constants";
import { ENUM_EVENT_TYPE } from "@/lib/enum";

export const CardAdmEvent = ({
  event,
  className,
}: {
  event: Evento;
  className?: string;
}) => {
  const router = useRouter();
  const orgSlug = getCurrentOrgFromCookie();

  const handleCardClick = () => {
    if (event.slug) {
      setEventInCookie(event.slug);
    }

    toast({
      title: `Evento selecionado, aguarde`,
      description: "Estamos preparando o ambiente para seu evento",
      variant: "success",
    });

    // Ao alternar entre eventos usando orgsRoutes, o cookie ainda não está setado e o evento anterior é carregado
    // router.push(orgsRoutes.event.dashboard);
    router.push(`/manada/${orgSlug}/evento/${event.slug}/dashboard`);
  };

  return (
    <Card
      className={cn(
        "group flex cursor-pointer items-center justify-between gap-2 overflow-hidden p-2 duration-200 hover:border-muted-foreground/70",
        className,
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-2">
        <CardHeader className="relative h-14 w-14 overflow-hidden rounded-md sm:p-0">
          {event.banner && (
            <Image
              src={event.banner}
              alt="TOP image"
              width={60}
              height={60}
              className="h-full w-full bg-muted object-cover"
            />
          )}
          <Skeleton className="absolute z-10 bg-red-400" />
        </CardHeader>
        <CardContent className="sm:p-0">
          <CardTitle className="text-start sm:text-base">
            {eventTypeMap[event.type as ENUM_EVENT_TYPE]} #{event.topNumero}
          </CardTitle>
          <CardDescription className="text-sm">{event.pista}</CardDescription>
        </CardContent>
      </div>

      {event.posted ? (
        <Badge className="bg-success">Ativo</Badge>
      ) : (
        <Badge className="bg-muted">Inativo</Badge>
      )}

      <ExternalLink className="h-4 w-4 duration-150 group-hover:text-primary" />
    </Card>
  );
};
