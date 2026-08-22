"use client";

import { type Inscricao } from "@prisma/client";
import { Ticket } from "lucide-react";
import { unmask } from "remask";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { registerStatusMap } from "@/lib/constants";
import { sendSubscriptionConfirmation } from "@/lib/actions/mail";
import { type Loading } from "@/lib/types";
import { RequestRefund } from "./request-refund";
import { isSuperAdmin } from "@/lib/utils/hasRole";
import { useEventStore } from "@/lib/store/EventStore";
import { getCurrentMembership } from "@/lib/hooks/member";
import { ENUM_EVENT_TYPE, type ENUM_STATUS } from "@/lib/enum";
import { EditUserFromLegendaryEvent } from "./user-edit/edit-user-from-legendary-event";

import { EditUserFromRemEvent } from "./user-edit/edit-user-from-rem-event";
import { Badge } from "./ui/badge";
import { getStatusClass } from "@/lib/utils/getStatusClass";
import { formatDateToDDMMYYYY } from "@/lib/utils/formatDateToDDMMYYYY";

const Item = ({ label, value }: { label: string; value: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {value}
    </div>
  );
};

type PersonalUserProps = {
  user: Inscricao;
};

const eventTypeSectionMap: Record<
  ENUM_EVENT_TYPE,
  React.FC<{ user: Inscricao }>
> = {
  [ENUM_EVENT_TYPE.LEGENDARIOS]: EditUserFromLegendaryEvent,
  [ENUM_EVENT_TYPE.REM]: EditUserFromRemEvent,
  [ENUM_EVENT_TYPE.LEGADO_FILHA]: () => null,
  [ENUM_EVENT_TYPE.LEGADO_FILHO]: () => null,
};

export const PersonalUser = ({ user }: PersonalUserProps) => {
  const router = useRouter();

  const { membership } = getCurrentMembership();
  const { event } = useEventStore();

  const isSuperAdminRole = isSuperAdmin(membership);

  const [sendingTicket, setSendingTicket] = useState<Loading>("initial");

  const handleRouteBack = () => {
    router.back();
  };

  const handleSendEmailTicket = async () => {
    try {
      setSendingTicket("loading");
      if (!event) {
        toast({
          title: "Não foi possível enviar o Ticket via E-mail",
        });

        return;
      }

      await sendSubscriptionConfirmation(
        user.id,
        event.id,
        event.type as ENUM_EVENT_TYPE,
      );

      toast({
        title: "Ticket enviado com sucesso",
        description: "O ticket do participante foi enviado via E-mail",
        variant: "success",
      });
    } catch (error) {
      console.log({ error });
      if (!event) {
        toast({
          title: "Não foi possível enviar o Ticket via E-mail",
        });
        return;
      }
    } finally {
      setSendingTicket("initial");
    }
  };

  function renderSections(type?: ENUM_EVENT_TYPE) {
    const Component = type ? eventTypeSectionMap[type] : null;
    return Component ? <Component user={user} /> : null;
  }

  return (
    <div className="flex h-full flex-col gap-4 pb-8 md:gap-6">
      <Button
        onClick={handleRouteBack}
        className="w-fit"
        variant="ghost"
        size="sm"
      >
        Voltar
      </Button>

      <div className="flex justify-between rounded-md border border-input bg-card px-4 py-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <Item label="Inscrição" value={user.tipoInscricao} />
          <Item label="Data" value={formatDateToDDMMYYYY(user.createdAt)} />
          <Item
            label="Status"
            value={
              <Badge
                variant="secondary"
                className={getStatusClass(user.status as ENUM_STATUS)}
              >
                {registerStatusMap[user.status as ENUM_STATUS]}
              </Badge>
            }
          />
        </div>

        <Button
          variant="secondary"
          disabled={!user || user.status !== "CONFIRMADA"}
          onClick={() =>
            router.push(`/ticket/${user.eventoId}/${unmask(user?.cpf)}`)
          }
        >
          <Ticket className="mr-2 h-4 w-4 text-primary" />
          Ticket
        </Button>
      </div>

      {renderSections(event?.type as ENUM_EVENT_TYPE)}

      <div className="col-span-full flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="blue"
          loading={sendingTicket === "loading"}
          disabled={user?.status !== "CONFIRMADA"}
          onClick={handleSendEmailTicket}
        >
          Reenviar Ticket
        </Button>
        {isSuperAdminRole && <RequestRefund user={user} />}
      </div>
    </div>
  );
};
