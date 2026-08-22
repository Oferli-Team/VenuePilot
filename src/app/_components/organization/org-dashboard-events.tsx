"use client";

import { Button } from "@/components/ui/button";
import { CardWithTitle } from "@/components/ui/card-with-title";
import { Plus } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { CardAdmEvent } from "@/components/card-adm-event";
import { type Evento } from "@prisma/client";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { useRouter } from "nextjs-toploader/app";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isSuperAdmin } from "@/lib/utils/hasRole";
import { GridTwoColumns } from "../grid-two-columns";

export const OrgDashboardEvents = ({ events }: { events: Evento[] | null }) => {
  const router = useRouter();
  const { orgsRoutes } = useEventRoutes({});
  const { membership } = getCurrentMembership();
  return (
    <CardWithTitle
      className="w-full"
      title="Eventos"
      description="Clique no evento que deseja administrar"
      subtitle="Administrar"
    >
      <CardContent>
        {events?.length === 0 && (
          <div className="col-span-full flex flex-col gap-3 text-center">
            <p className="text-muted-foreground">Sua pista não possui evento</p>
            <span className="font-bold">
              Comece agora e crie seu primeiro evento!
            </span>
          </div>
        )}

        <GridTwoColumns className="gap-2">
          {events &&
            events.length > 0 &&
            events.map((event) => (
              <CardAdmEvent
                key={event.id}
                className="cursor-pointer border-none bg-background duration-150 hover:bg-background/90"
                event={event}
              />
            ))}
        </GridTwoColumns>
      </CardContent>

      {isSuperAdmin(membership) && (
        <CardFooter>
          <Button
            size="lg"
            className="mt-3 w-full"
            onClick={() => router.push(orgsRoutes.createEvent)}
          >
            <Plus className="mr-1 h-4 w-4" /> Criar Evento
          </Button>
        </CardFooter>
      )}
    </CardWithTitle>
  );
};
