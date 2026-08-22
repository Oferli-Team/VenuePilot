"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { ENUM_EVENT_TYPE } from "@/lib/enum";

export type CardEventProps = {
  id: string;
  banner: string;
  titulo: string;
  subtitulo: string;
  topNumero: number;
  local: string;
  periodo: string;
  btnLabel?: string;
  isAdmin?: boolean;
  type: ENUM_EVENT_TYPE;
};

export const CardEvent = (props: CardEventProps) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const {
    banner,
    titulo,
    subtitulo,
    topNumero,
    local,
    periodo,
    btnLabel = "Inscrever",
    isAdmin,
    type,
  } = props;

  const { orgsRoutes, publicRoutes } = useEventRoutes({
    topNumber: topNumero.toString(),
  });

  const handleCardClick = () => {
    if (type === ENUM_EVENT_TYPE.MANADADAY) {
      router.push(publicRoutes.event.manadaDay);
      return;
    }

    // TODO: isAdmin is not working
    if (isAdmin) {
      setLoading(true);
      router.push(orgsRoutes.event.dashboard);
      return;
    }
    router.push(publicRoutes.event.public);
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden shadow-lg duration-200 hover:border-primary/50">
      <Image
        src={banner}
        alt={`imagem - ${titulo}`}
        className="duration-20 max-h-16 min-h-[14rem] w-full object-cover group-hover:scale-105"
        width={250}
        height={250}
      />

      <div className="flex h-full flex-col justify-between">
        <CardHeader className="sm:p-4">
          <CardTitle className="text-lg">{titulo}</CardTitle>
          <CardDescription>{subtitulo}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pb-4 sm:px-4 sm:pt-0">
          {!isAdmin && (
            <>
              <div className="flex items-center gap-1">
                <MapPin size={18} className="text-primary" />
                <p className="text-sm">{local}</p>
              </div>

              <div className="flex items-center gap-1">
                <Calendar size={18} className="text-primary" />
                <p className="text-sm">{periodo}</p>
              </div>
            </>
          )}

          <Button
            variant="outline"
            className="mt-4 uppercase"
            onClick={handleCardClick}
            loading={loading}
          >
            {btnLabel}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};
