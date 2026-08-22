"use client";

import { useIsMobile } from "@/lib/hooks/ismobile";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

import { ENUM_USER } from "@/lib/enum";
import { useEventStore } from "@/lib/store/EventStore";
import { Check, type LucideProps } from "lucide-react";
import Image from "next/image";
import {
  useState,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import { useScrollPosition } from "../hook/useScrollPosition";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { useFindManyEvent } from "@/lib/hooks/event";

const registersPageOptions = [
  {
    title: "Participantes",
    description: "Lista de inscritos para Participar",
    url: `participantes`,
  },
  {
    title: "Legendários",
    description: "Lista de inscritos para Servir",
    url: `legendarios`,
  },
];

type ItemsProps = {
  items: {
    href: string;
    label: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    enable: boolean;
  }[];
};

export const MenuActionMobile = ({ items }: ItemsProps) => {
  const pathname = usePathname();

  const { event } = useEventStore();
  const { events } = useFindManyEvent();
  const { orgsRoutes } = useEventRoutes({});
  const router = useRouter();
  const { data: session } = useSession();

  const isMobile = useIsMobile();
  const { isNearBottom } = useScrollPosition({});

  const [open, setOpen] = useState({
    events: false,
    registers: false,
  });

  function handleOpenDrawer(menuItem: string) {
    if (menuItem === "Eventos" || !event?.topNumero) {
      setOpen({ ...open, events: true });
    } else if (menuItem === "Inscritos") {
      setOpen({ ...open, registers: true }); // Abrir drawer de inscritos
    }
  }

  const isTopPage = pathname.includes("/top"); // esconder componente se estiver na página do TOP para não ficar acima do botão de "inscrever"

  return (
    <>
      {session &&
        session?.user.role !== ENUM_USER.USER &&
        isMobile &&
        !isTopPage && (
          <nav
            className={`fixed bottom-0 left-0 right-0 border-t-[1px] border-muted/50 transition-all duration-500 ${isNearBottom ? "pointer-events-none translate-y-10 bg-none opacity-0" : "translate-y-0 bg-card opacity-100"}`}
          >
            <ul
              className={`flex items-center justify-between  pb-4 pt-3 ${items.length > 3 ? "px-4" : "px-12"}`}
            >
              {items.map((item, i) => {
                const middleIndex = Math.floor(items.length / 2);
                const isMiddleItem = i === middleIndex;
                const isCurrentPath = pathname === item.href;

                return (
                  item.enable && (
                    <li
                      key={i}
                      className="flex flex-col items-center justify-center gap-2"
                    >
                      {item.href && item.href !== "#" ? (
                        <Link
                          href={item.href}
                          className={`flex items-center justify-center rounded-full border border-muted bg-background ${
                            isCurrentPath ? "border-primary/40" : ""
                          } ${isMiddleItem ? "h-14 w-14" : "h-12 w-12"}`}
                        >
                          <item.icon
                            className={`h-4 w-4 ${isCurrentPath ? "text-primary" : ""}`}
                          />
                        </Link>
                      ) : (
                        <div
                          className={`flex items-center justify-center rounded-full border border-muted bg-background ${
                            isCurrentPath ? "border-primary/40" : ""
                          } ${isMiddleItem ? "h-14 w-14" : "h-12 w-12"}`}
                          onClick={() => handleOpenDrawer(item.label)}
                        >
                          <item.icon
                            className={`h-4 w-4 ${isCurrentPath ? "text-primary" : ""}`}
                          />
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>
                    </li>
                  )
                );
              })}
            </ul>
          </nav>
        )}

      <Drawer
        open={open.events && isMobile}
        onOpenChange={() => setOpen((state) => ({ ...state, events: false }))}
      >
        <DrawerTrigger></DrawerTrigger>
        <DrawerContent className="pb-6">
          <DrawerHeader className="mt-4">
            <DrawerTitle>Selecione um Evento para Administrar</DrawerTitle>
          </DrawerHeader>
          {events &&
            events?.length > 0 &&
            events?.map((eventItem) => (
              <Card
                key={eventItem.id}
                className={`relative mx-3 mt-3 flex items-center gap-2 p-2 duration-200`}
                onClick={() => {
                  router.push(orgsRoutes.event.dashboard);
                  setOpen((state) => ({ ...state, events: false }));
                }}
              >
                <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-muted sm:p-0">
                  <Image
                    src={eventItem?.banner ?? "/emptyImg.png"}
                    alt="TOP image"
                    width={150}
                    height={150}
                    className="h-full w-full bg-muted object-cover"
                  />
                </div>
                <CardContent className="sm:p-0">
                  <CardTitle className="text-base">
                    TOP #{eventItem.topNumero}
                  </CardTitle>
                  <CardDescription>{eventItem?.pista}</CardDescription>
                </CardContent>

                <span className="absolute right-0 top-0 m-2 h-6 w-6 text-success">
                  {eventItem.topNumero === event?.topNumero && <Check />}
                </span>
              </Card>
            ))}
        </DrawerContent>
      </Drawer>

      <Drawer
        open={open.registers && isMobile}
        onOpenChange={() =>
          setOpen((state) => ({ ...state, registers: false }))
        }
      >
        <DrawerTrigger></DrawerTrigger>
        <DrawerContent className="pb-10">
          <DrawerHeader className="mt-4">
            <DrawerTitle>Lista de Inscritos</DrawerTitle>
            <DrawerDescription>Clique para visualizar</DrawerDescription>
          </DrawerHeader>
          {registersPageOptions.map((item) => {
            const userType =
              item.url === "participantes" ? "participant" : "legendary";
            return (
              <Card
                key={item.url}
                className={`relative mx-3 mt-3 flex items-center gap-2 p-2 duration-200`}
              >
                <Link
                  className="flex-1"
                  href={orgsRoutes.event.registeredList[userType]}
                >
                  <CardContent className="sm:p-0">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </DrawerContent>
      </Drawer>
    </>
  );
};
