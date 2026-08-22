import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { type Evento } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { eventTypeMap } from "@/lib/constants";
import type { ENUM_EVENT_TYPE } from "@/lib/enum";

type EventType = Pick<Evento, "banner" | "pista" | "topNumero" | "type">;
type CardEventSelectDesktopProps = {
  className?: string;
  iconEnd?: React.ReactNode;
} & EventType;

export const CardEventSelectDesktop = ({
  banner,
  pista,
  type,
  topNumero,
  className,
  iconEnd,
}: CardEventSelectDesktopProps) => {
  return (
    <Card
      className={cn(`flex items-center justify-between gap-2 p-2`, className)}
    >
      <div className="flex items-center gap-2">
        <CardHeader className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-muted sm:p-0">
          {banner && (
            <Image
              src={banner}
              alt="Event image"
              width={60}
              height={60}
              className="h-full w-full bg-muted object-cover"
            />
          )}
          <Skeleton className="absolute z-10 bg-red-400" />
        </CardHeader>
        <CardContent className="sm:p-0">
          <CardTitle className="text-start text-base">
            {eventTypeMap[type as ENUM_EVENT_TYPE]} #{topNumero}
          </CardTitle>
          <CardDescription>{pista}</CardDescription>
        </CardContent>
      </div>

      {iconEnd && iconEnd}
    </Card>
  );
};
