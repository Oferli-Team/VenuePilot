import { useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Axe,
  Bus,
  CircleDollarSign,
  ClipboardList,
  Flag,
  Flower2,
  LayoutDashboard,
  Link,
  MailOpen,
  PanelTop,
  Plus,
  Settings,
  Split,
  SquareCheckBig,
  Stethoscope,
  TentTree,
  Ticket,
  TicketPercent,
  User2,
  UsersRound,
} from "lucide-react";
import { GiBilledCap } from "react-icons/gi";
import { type Items as ItemsProps } from "./nav-item";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { useTopNumber } from "@/app/hook/useTopNumber";
import { ENUM_USER } from "@/lib/enum";
import { hasRole } from "@/lib/utils/hasRole";

export const Items = () => {
  const { data: session } = useSession();
  const { topNumber } = useTopNumber();

  const isMobile = useIsMobile();

  const isAdmin = useCallback(() => {
    return hasRole(session, [ENUM_USER.SUPER_ADMIN, ENUM_USER.ADMIN]);
  }, [session]);

  const isSuperAdmin = useCallback(() => {
    return hasRole(session, [ENUM_USER.SUPER_ADMIN]);
  }, [session]);

  const isLadie = useCallback(() => {
    return hasRole(session, [
      ENUM_USER.SUPER_ADMIN,
      ENUM_USER.ADMIN,
      ENUM_USER.LADIES,
    ]);
  }, [session]);

  const isHakuna = useCallback(() => {
    return hasRole(session, [
      ENUM_USER.SUPER_ADMIN,
      ENUM_USER.ADMIN,
      ENUM_USER.HAKUNA,
    ]);
  }, [session]);

  const isAdminsAndCheckIn = useCallback(() => {
    return hasRole(session, [
      ENUM_USER.SUPER_ADMIN,
      ENUM_USER.ADMIN,
      ENUM_USER.CHECKIN,
    ]);
  }, [session]);

  const items: ItemsProps[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      href: `/manada/${topNumber}/dashboard`,
      isChildren: false,
      enabled: !!topNumber && isAdmin(),
    },
    {
      title: "Página do Evento",
      icon: <PanelTop size={18} />,
      href: `/top/${topNumber}`,
      isChildren: false,
      enabled: true,
    },
    {
      title: "Lista Inscritos",
      icon: <UsersRound size={18} />,
      href: "",
      isChildren: true,
      enabled: !!topNumber && isAdminsAndCheckIn(),
      children: [
        {
          title: "Participante",
          icon: <User2 size={18} />,
          href: `/manada/${topNumber}/inscritos/participantes`,
          enabled: true,
        },
        {
          title: "Servir",
          icon: <User2 size={18} />,
          href: `/manada/${topNumber}/inscritos/legendarios`,
          enabled: true,
        },
      ],
    },
    {
      title: "Inscrição",
      icon: <ClipboardList size={18} />,
      href: "",
      isChildren: true,
      enabled: !!topNumber,
      children: [
        {
          title: "Participar Primeira vez",
          icon: <TentTree size={18} />,
          href: `/${topNumber}/participar`,
          enabled: true,
        },
        {
          title: "Legendário Servir",
          icon: <Axe size={18} />,
          href: `/${topNumber}/servir`,
          enabled: true,
        },
      ],
    },
    {
      title: "Hakuna",
      icon: <Stethoscope size={18} />,
      href: `/manada/${topNumber}/hakuna`,
      isChildren: false,
      enabled: !!topNumber && isHakuna(),
    },
    {
      title: "Classificação de Família",
      icon: <Flag size={18} />,
      href: `/manada/${topNumber}/familia`,
      isChildren: false,
      enabled: !!topNumber && isAdmin(),
    },
    {
      title: "Plano de Embarque",
      icon: <Bus size={18} />,
      href: "",
      isChildren: true,
      enabled: !!topNumber && isAdmin(),
      children: [
        {
          title: "Cadastrar viatura",
          icon: <Plus size={18} />,
          href: `/manada/${topNumber}/plano-embarque`,
          enabled: true,
        },
        {
          title: "Distribuir",
          icon: <Split size={18} />,
          href: `/manada/${topNumber}/plano-embarque/distribuir`,
          enabled: true,
        },
      ],
    },
    {
      title: "Check-in",
      icon: <SquareCheckBig size={18} />,
      href: "",
      isChildren: true,
      enabled: !!topNumber && isAdminsAndCheckIn(),
      children: [
        {
          title: "Participante",
          icon: <TentTree size={18} />,
          href: `/manada/${topNumber}/checkin/participante`,
          enabled: true,
        },
        {
          title: "Legendário",
          icon: <Axe size={18} />,
          href: `/manada/${topNumber}/checkin/lgnd`,
          enabled: true,
        },
      ],
    },
    {
      title: "Entrega boné",
      icon: <GiBilledCap size={18} />,
      href: `/manada/${topNumber}/bone`,
      isChildren: false,
      enabled: !!topNumber && isAdminsAndCheckIn(),
    },
    {
      title: "Cupom",
      icon: <TicketPercent size={18} />,
      href: `/manada/${topNumber}/cupom`,
      isChildren: false,
      enabled: !!topNumber && isAdmin(),
    },
    {
      title: "Links Secretos",
      icon: <Link size={18} />,
      href: `/manada/${topNumber}/link-secreto`,
      isChildren: false,
      enabled: !!topNumber && isAdmin(),
    },
    {
      title: "Ver Ticket",
      icon: <Ticket size={18} />,
      href: "/ticket",
      isChildren: false,
      enabled: true,
    },
    {
      title: "Cartas",
      icon: <MailOpen size={18} />,
      href: `/manada/${topNumber}/cartas`,
      isChildren: false,
      enabled: !!topNumber && isAdminsAndCheckIn(),
    },
    {
      title: "Ladies",
      icon: <Flower2 size={18} />,
      href: `/manada/${topNumber}/ladies`,
      isChildren: false,
      enabled: !!topNumber && isLadie(),
    },
    {
      title: "Pagamentos",
      icon: <CircleDollarSign size={18} />,
      href: `/manada/${topNumber}/pagamentos`,
      isChildren: false,
      enabled: !!topNumber && isAdmin(),
    },
    {
      title: "Permissão",
      icon: <Settings size={16} />,
      href: `/manada/permissao`,
      enabled: isSuperAdmin() && isMobile,
    },
  ];
  return items;
};
