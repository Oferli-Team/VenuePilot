"use client";

import {
  Home,
  LayoutDashboard,
  Link as LinkIcon,
  Mail,
  Rows3,
  Stethoscope,
  Ticket,
  Users,
} from "lucide-react";
import { isAdmin, isHakuna, isLadie } from "@/lib/utils/hasRole";
import { useEventStore } from "@/lib/store/EventStore";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { getCurrentMembership } from "@/lib/hooks/member";

export const ItemsNavMobile = () => {
  const { event } = useEventStore();
  const { orgsRoutes, publicRoutes } = useEventRoutes({
    topNumber: event?.topNumero.toString(),
  });

  const { membership } = getCurrentMembership();

  const isAdminRole = isAdmin(membership);

  const isLadieRole = isLadie(membership);

  const isHakunaRole = isHakuna(membership);

  const itemsRoleAdmin = [
    {
      icon: Users,
      href: "#",
      label: "Inscritos",
      enable: isAdminRole,
    },
    {
      icon: Ticket,
      href: publicRoutes.ticket,
      label: "Cupons",
      enable: isAdminRole,
    },
    {
      icon: LayoutDashboard,
      href: orgsRoutes.event.dashboard,
      label: "Dashboard",
      enable: isAdminRole,
    },
    {
      icon: LinkIcon,
      href: orgsRoutes.event.secretLinks.link,
      label: "Links",
      enable: isAdminRole,
    },
  ];

  const itemsRoleLadie = [
    {
      icon: Home,
      href: publicRoutes.home,
      label: "Início",
      enable: isLadieRole,
    },
    {
      icon: Mail,
      href: orgsRoutes.event.letters,
      label: "Cartas",
      enable: isLadieRole,
    },
  ];

  const itemsRoleHakuna = [
    {
      icon: Home,
      href: publicRoutes.home,
      label: "Início",
      enable: isHakunaRole,
    },
    {
      icon: Stethoscope,
      href: orgsRoutes.event.hakuna,
      label: "Hakuna",
      enable: isHakunaRole,
    },
  ];

  const itemsDefault = [
    ...itemsRoleAdmin,
    ...itemsRoleLadie,
    ...itemsRoleHakuna,
    {
      icon: Rows3,
      href: `#`,
      label: "Eventos",
      enable: true,
    },
  ];

  const enabledItems = itemsDefault.filter((item) => item.enable);

  return enabledItems;
};
