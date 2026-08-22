import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { checkinStatusMap } from "@/lib/constants";
import { ENUM_CHECKIN_STATUS } from "@/lib/enum";
import { addColorByCheckInStatus } from "@/lib/utils/getStatusClass";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import React from "react";

export const CheckInStatusInfoCardHover = () => {
  const options = [
    {
      value: ENUM_CHECKIN_STATUS.WAITING_FOR_DOCUMENTS,
      label: checkinStatusMap[ENUM_CHECKIN_STATUS.WAITING_FOR_DOCUMENTS],
      description:
        "Documento foi criado e está aguardando ser assinado pelo inscrito.",
    },
    {
      value: ENUM_CHECKIN_STATUS.DOCUMENTS_SENT,
      label: checkinStatusMap[ENUM_CHECKIN_STATUS.DOCUMENTS_SENT],
      description:
        "Inscrito assinou o documento e está aguardando a verificação da Administração do evento.",
    },
    {
      value: ENUM_CHECKIN_STATUS.VALID_DOCUMENTS,
      label: checkinStatusMap[ENUM_CHECKIN_STATUS.VALID_DOCUMENTS],
      description:
        "Documento analisado e aprovado pela Administração do evento.",
    },
    {
      value: ENUM_CHECKIN_STATUS.INVALID_DOCUMENTS,
      label: checkinStatusMap[ENUM_CHECKIN_STATUS.INVALID_DOCUMENTS],
      description: "Documento não aprovado pela Administração do evento.",
    },
  ];
  return (
    <HoverCard>
      <HoverCardTrigger className="cursor-pointer">
        <Info className="size-4" />
      </HoverCardTrigger>

      <HoverCardContent className="w-96 space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">
          Status do Documento
        </p>
        {options.map((option) => (
          <React.Fragment key={option.value}>
            <div key={option.label}>
              <p
                className={cn(
                  addColorByCheckInStatus(option.value, "text"),
                  "font-semibold",
                )}
              >
                {option.label}
              </p>
              <p className="font-normal">{option.description}</p>
            </div>
            <Separator />
          </React.Fragment>
        ))}
      </HoverCardContent>
    </HoverCard>
  );
};
