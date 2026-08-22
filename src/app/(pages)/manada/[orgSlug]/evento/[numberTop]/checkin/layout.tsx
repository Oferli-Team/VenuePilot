"use client";

import { ContainerSpace } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Unauthorized } from "@/components/unauthorized";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { getCurrentMembership } from "@/lib/hooks/member";
import { useEventStore } from "@/lib/store/EventStore";
import { isCheckIn } from "@/lib/utils/hasRole";
import { SquareCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export default function CheckinLayoutPage({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { membership, isLoading } = getCurrentMembership();
  const { event } = useEventStore();
  const pathname = usePathname();

  const subtitle = React.useMemo(() => {
    const eventType = event?.type as ENUM_EVENT_TYPE;
    if (eventType === ENUM_EVENT_TYPE.MANADADAY) {
      return "Ingressos";
    }
    if (pathname.includes("checkin/lgnd")) {
      return "Legendários - Servir";
    }
    return "Participantes - Primeira Vez";
  }, []);

  if (isLoading) {
    return (
      <ContainerSpace className="relative mt-4">{children}</ContainerSpace>
    );
  }

  if (!isCheckIn(membership)) {
    return <Unauthorized />;
  }

  return (
    <ContainerSpace>
      <Heading
        className="sm:hidden"
        title="Check-in"
        icon={SquareCheck}
        subtitle={subtitle}
      />
      {children}
    </ContainerSpace>
  );
}
