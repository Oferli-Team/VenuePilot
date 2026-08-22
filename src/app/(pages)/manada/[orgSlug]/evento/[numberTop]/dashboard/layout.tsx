"use client";

import { useTabsDashboard } from "@/components/dashboard/tabs-store";
import { Heading } from "@/components/ui/heading";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Unauthorized } from "@/components/unauthorized";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { getCurrentMembership } from "@/lib/hooks/member";
import { useEventStore } from "@/lib/store/EventStore";
import { getCurrentEventFromCookie } from "@/lib/utils/getCurrentEventFromCookie";
import { isCheckIn, isSuperAdmin } from "@/lib/utils/hasRole";

import React from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { membership, isLoading } = getCurrentMembership();

  const { setTab, tab } = useTabsDashboard();

  const { event } = useEventStore();
  const eventSlug = getCurrentEventFromCookie();

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  React.useEffect(() => {
    setTab("geral");
  }, [eventSlug]);

  if (isLoading) {
    return <>{children}</>;
  }

  if (!isCheckIn(membership)) {
    return <Unauthorized />;
  }

  return (
    <>
      <Heading className="sm:hidden" title="Dashboard" />

      <Tabs
        value={tab}
        onValueChange={handleTabChange}
        className="mt-4 space-y-4 sm:mt-0"
      >
        <ScrollArea className=" whitespace-nowrap rounded-md sm:max-w-[26rem]">
          <TabsList className="justify-start sm:ml-3">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger
              value="financeiro"
              disabled={!isSuperAdmin(membership)}
              className={`${!isSuperAdmin(membership) && "hidden"}`}
            >
              Financeiro
            </TabsTrigger>

            {(event?.type as ENUM_EVENT_TYPE) !== ENUM_EVENT_TYPE.MANADADAY && (
              <TabsTrigger value="administrativo">Administrativo</TabsTrigger>
            )}

            {(event?.type as ENUM_EVENT_TYPE) !== ENUM_EVENT_TYPE.MANADADAY && (
              <TabsTrigger
                value="relatorio"
                disabled={!isSuperAdmin(membership)}
                className={`${!isSuperAdmin(membership) && "hidden"}`}
              >
                Relatório
              </TabsTrigger>
            )}
          </TabsList>
          <ScrollBar orientation="horizontal" className="md:hidden" />
        </ScrollArea>

        <TabsContent value={tab} className="pb-6 pt-4">
          {children}
        </TabsContent>
      </Tabs>
    </>
  );
}
