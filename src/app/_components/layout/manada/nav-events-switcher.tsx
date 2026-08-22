"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/lib/hooks/ismobile";
import Image from "next/image";
import { useFindEvent, useFindManyEvent } from "@/lib/hooks/event";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { setEventInCookie } from "@/lib/utils/getCurrentEventFromCookie";
import { Skeleton } from "../../ui/skeleton";
import { Separator } from "../../ui/separator";
import { eventTypeMap } from "@/lib/constants";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { ScrollArea } from "../../ui/scroll-area";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

function isRouteAllowedForEventType(
  pathname: string,
  eventType: ENUM_EVENT_TYPE,
) {
  const commumn = ["/hakuna", "/cartas", "/ladies", "/plano-embarque"];
  const forbiddenForREM = commumn;
  const forbiddenForManadaDay = commumn.concat([
    "/link-secreto",
    "/criar-evento",
    "/familia",
    "/bone",
    "/participantes",
    "/checkin",
    "/configuracoes",
  ]);
  if (eventType === ENUM_EVENT_TYPE.REM) {
    return !forbiddenForREM.some((route) => pathname.includes(route));
  }
  if (eventType === ENUM_EVENT_TYPE.MANADADAY) {
    return !forbiddenForManadaDay.some((route) => pathname.includes(route));
  }
  return true;
}

type NavEventsSwitcherType = {
  title: string;
  banner: string;
  slug: string;
  organization: string;
  orgSlug: string;
  type: string;
};

export function NavEventsSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const isMobile = useIsMobile();
  const orgSlug = getCurrentOrgFromCookie();
  const { events } = useFindManyEvent();
  const { event, isLoading } = useFindEvent();

  const { setOpenMobile } = useSidebar();

  const closeSidebar = () => {
    setOpenMobile(false);
  };

  const _events =
    events?.map((event) => ({
      title: `${eventTypeMap[event.type as ENUM_EVENT_TYPE]}#${event.topNumero}`,
      banner: event.banner,
      slug: event.slug,
      organization: event.pista,
      orgSlug,
      type: event.type as ENUM_EVENT_TYPE,
    })) ?? [];

  const [activeEvent, setActiveEvent] =
    React.useState<NavEventsSwitcherType | null>(null);

  const setDefaultRouteByEventType = (
    eventType: ENUM_EVENT_TYPE,
    slug: string,
  ) => {
    const defaultRoute = `/manada/${orgSlug}/evento/${slug}/dashboard`;
    return defaultRoute;
  };

  const handleCardClick = (event: NavEventsSwitcherType) => {
    const { slug } = event;
    setEventInCookie(event.slug);

    setActiveEvent({
      title: event.title,
      banner: event?.banner,
      organization: event?.organization,
      slug,
      orgSlug: event.orgSlug,
      type: event.type,
    });

    const eventType = event.type as ENUM_EVENT_TYPE;
    const urlDefault = setDefaultRouteByEventType(eventType, slug);

    // Se houver o parâmetro 'id' na URL, faz fallback para o dashboard
    if (params && typeof params === "object" && "id" in params) {
      router.push(urlDefault);
      return;
    }

    if (!isRouteAllowedForEventType(pathname, eventType)) {
      router.push(urlDefault);
      return;
    }

    // Se existir evento na URL troca apenas o slug do evento
    if (pathname.includes("evento")) {
      if (pathname.includes("manada-day")) {
        router.push(urlDefault);
        return;
      }
      const newPath = pathname.replace(/\/evento\/([^/]+)/, `/evento/${slug}`);
      router.push(newPath);
      return;
    }

    router.push(urlDefault);
  };

  React.useEffect(() => {
    // pega o eventSlug da URL
    const match = /\/evento\/([^/]+)/.exec(pathname);
    const eventSlugFromUrl = match?.[1];
    const eventSlugFromCookie = event?.slug;

    if (eventSlugFromUrl && eventSlugFromCookie) {
      if (eventSlugFromUrl === eventSlugFromCookie) {
        setActiveEvent({
          title: `${eventTypeMap[event?.type as ENUM_EVENT_TYPE]}#${event?.slug}`,
          banner: event?.banner ?? "",
          organization: event?.pista ?? "",
          slug: event?.slug ?? "",
          orgSlug: orgSlug ?? "",
          type: event?.type,
        });
      } else {
        // Se diferentes, atualiza o cookie e o evento ativo para o slug da URL
        setEventInCookie(eventSlugFromUrl);
        setActiveEvent((prev) => {
          const found = events?.find((e) => e.slug === eventSlugFromUrl);
          if (found) {
            return {
              title: `${eventTypeMap[found.type as ENUM_EVENT_TYPE]}#${found.slug}`,
              banner: found.banner,
              organization: found.pista,
              slug: found.slug ?? "",
              orgSlug: orgSlug ?? "",
              type: found.type,
            };
          }
          return prev;
        });
      }
      return;
    }
    if (event) {
      setActiveEvent({
        title: `${eventTypeMap[event.type as ENUM_EVENT_TYPE]}#${event.topNumero}`,
        banner: event?.banner,
        organization: event?.pista,
        slug: event.slug ?? "",
        orgSlug: orgSlug ?? "",
        type: event.type,
      });
      return;
    }
    setActiveEvent(null);
  }, [event, orgSlug, pathname, events]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {isLoading ? (
              <Skeleton className="h-16"></Skeleton>
            ) : (
              <SidebarMenuButton
                size="xlg"
                className="border border-muted bg-card data-[state=open]:border-muted-foreground/50 data-[state=open]:text-sidebar-accent-foreground"
              >
                {activeEvent?.banner && (
                  <div className="flex aspect-square size-12 items-center justify-center overflow-hidden rounded-lg bg-muted text-sidebar-primary-foreground">
                    <Image
                      src={activeEvent?.banner ?? "/emptyImg.png"}
                      alt={`Banner do Evento ${activeEvent?.slug}`}
                      width={180}
                      height={180}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                  {!activeEvent ? (
                    <p className="font-semibold">Nenhum evento selecionado</p>
                  ) : (
                    <>
                      <span className="truncate text-lg font-bold">
                        {activeEvent?.title}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {activeEvent?.organization}
                      </span>
                    </>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto group-data-[state=collapsed]:hidden" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Meus Eventos
            </DropdownMenuLabel>
            <Separator className="my-1" />
            <ScrollArea className="h-[40vh] sm:h-full">
              {_events.map((event) => (
                <DropdownMenuItem
                  key={event.slug}
                  className={`w-full cursor-pointer gap-2 p-2 ${activeEvent?.slug === event.slug && "bg-background"}`}
                  onClick={() => {
                    handleCardClick(event);
                    closeSidebar();
                  }}
                >
                  <div className="flex aspect-square size-12 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Image
                      src={event.banner}
                      alt={`Banner do Evento ${event.slug}`}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="">
                    <p className="truncate text-lg font-bold">{event.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {event.organization}
                    </p>
                  </div>

                  <DropdownMenuShortcut>
                    {activeEvent?.slug === event.slug && <Check size={16} />}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
