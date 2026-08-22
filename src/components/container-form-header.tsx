import { usePathname } from "next/navigation";
import { useFormStore } from "./participante/useFormStore";
import { eventTypeMap } from "@/lib/constants";
import type { ENUM_EVENT_TYPE } from "@/lib/enum";
import { Skeleton } from "./ui/skeleton";
import { Minus } from "lucide-react";

export const ContainerFormHeader = () => {
  const pathname = usePathname();
  const { eventRegister } = useFormStore();

  const label = eventRegister?.type
    ? eventTypeMap[eventRegister.type as ENUM_EVENT_TYPE]
    : "";

  return (
    <>
      {!eventRegister ? (
        <Skeleton className="h-32 w-full bg-card" />
      ) : (
        <div className="flex flex-col gap-1 rounded-md border border-input bg-card p-4">
          <div className="flex flex-col items-center text-xs font-medium text-muted-foreground sm:flex-row sm:gap-2 sm:text-sm">
            <p>Inscrição Evento: </p>
            <p className="text-base font-bold text-primary">
              {label}#{eventRegister?.topNumero} - {eventRegister?.pista}
            </p>
          </div>

          <p className="w-fit text-sm font-bold uppercase sm:text-xl">
            Inscrição para{" "}
            {pathname.includes("participar")
              ? "Participar pela primeira vez"
              : `Servir no ${label}`}
          </p>

          <p className="flex items-start gap-1 text-xs sm:text-sm">
            <Minus className="size-4 text-primary" /> Atenção! Realize a
            inscrição no tempo de 20 minutos.
          </p>
        </div>
      )}
    </>
  );
};
