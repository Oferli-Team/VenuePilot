import { ENUM_EVENT_TYPE, ENUM_REGISTER_TYPE } from "@/lib/enum";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { useEventStore } from "@/lib/store/EventStore";
import {
  isAdmin,
  isCheckIn,
  isHakuna,
  isLadie,
  isSuperAdmin,
} from "@/lib/utils/hasRole";
import { Role } from "@prisma/client";
import {
  Bus,
  FlagTriangleRight,
  Flower,
  Link as LinkIcon,
  LucideLayoutDashboard,
  Mail,
  PanelTop,
  Pencil,
  Plus,
  Settings,
  SquareCheckBigIcon,
  Stethoscope,
  TicketPercent,
  Users2,
} from "lucide-react";
import { useMemo } from "react";
import { GiBilledCap } from "react-icons/gi";

type Membership =
  | {
      id: string;
      role: Role;
      organizationId: string;
      userId: string;
    }
  | undefined;

type RegisterTypeTitle = { title: string };
type RegisterTypeTitleMap = Record<ENUM_REGISTER_TYPE, RegisterTypeTitle>;
type MemberRoleMap = Record<Role, (membership: Membership) => boolean>;

export const SidebarItems = (membership: Membership) => {
  const { event } = useEventStore();
  const { orgsRoutes } = useEventRoutes({});

  const eventType = useMemo(() => {
    return (event?.type as ENUM_EVENT_TYPE) ?? ENUM_EVENT_TYPE.LEGENDARIOS;
  }, [event]);

  const mappingMemberRole: MemberRoleMap = {
    [Role.SUPER_ADMIN]: isSuperAdmin,
    [Role.ADMIN]: isAdmin,
    [Role.CHECKIN]: isCheckIn,
    [Role.HAKUNA]: isHakuna,
    [Role.LADIES]: isLadie,
    [Role.BILLING]: (_) => true,
    [Role.USER]: (_) => true,
    [Role.MEMBER]: (_) => true,
  };

  const defaultTitles: RegisterTypeTitleMap = {
    [ENUM_REGISTER_TYPE.PARTICIPANTE]: { title: "Participar" },
    [ENUM_REGISTER_TYPE.SERVIR]: { title: "Servir" },
  };

  const title: Record<ENUM_EVENT_TYPE, RegisterTypeTitleMap> = {
    [ENUM_EVENT_TYPE.LEGENDARIOS]: {
      [ENUM_REGISTER_TYPE.PARTICIPANTE]: { title: "Participantes" },
      [ENUM_REGISTER_TYPE.SERVIR]: { title: "Legendário" },
    },
    [ENUM_EVENT_TYPE.REM]: defaultTitles,
    [ENUM_EVENT_TYPE.LEGADO_FILHA]: defaultTitles,
    [ENUM_EVENT_TYPE.LEGADO_FILHO]: defaultTitles,
    [ENUM_EVENT_TYPE.MANADADAY]: defaultTitles,
  };

  const enableRoute = (
    requiredRole?: Role,
    requiredEventType?: ENUM_EVENT_TYPE | ENUM_EVENT_TYPE[],
    ignoreEventCheck?: boolean, // permite ignorar validação de evento
  ) => {
    const _ignoreEventCheck = ignoreEventCheck ?? false;
    const checkMembershipMap = requiredRole && mappingMemberRole[requiredRole];

    if (!_ignoreEventCheck && !event?.topNumero) return false;

    if (requiredEventType && event?.type) {
      const types = Array.isArray(requiredEventType)
        ? requiredEventType
        : [requiredEventType];
      if (!types.includes(event.type as ENUM_EVENT_TYPE)) return false;
    }

    if (requiredRole)
      return checkMembershipMap ? checkMembershipMap(membership) : false;

    return true;
  };

  const getUrlByEventType = (
    eventType: ENUM_EVENT_TYPE,
    urlDefault: string,
    urlToRedirect?: string,
  ): string => {
    if (eventType === ENUM_EVENT_TYPE.MANADADAY && urlToRedirect)
      return urlToRedirect;
    return urlDefault;
  };

  const data = {
    events: [
      {
        title: "Dashboard",
        url: orgsRoutes.event.dashboard,
        icon: LucideLayoutDashboard,
        enable: enableRoute("CHECKIN"),
      },
      {
        title: "Visualizar página",
        url: getUrlByEventType(
          eventType,
          `/evento/${event?.topNumero}`,
          `/manadaday/participar`,
        ),
        icon: PanelTop,
        enable: enableRoute(undefined, [
          ENUM_EVENT_TYPE.LEGENDARIOS,
          ENUM_EVENT_TYPE.REM,
          ENUM_EVENT_TYPE.MANADADAY,
        ]),
      },
      {
        title: "Editar evento",
        url: orgsRoutes.event.edit,
        icon: Pencil,
        enable: enableRoute("SUPER_ADMIN", [
          ENUM_EVENT_TYPE.LEGENDARIOS,
          ENUM_EVENT_TYPE.REM,
          ENUM_EVENT_TYPE.MANADADAY,
        ]),
      },
      {
        title: "Configurações",
        url: orgsRoutes.event.settings,
        icon: Settings,
        enable: enableRoute("SUPER_ADMIN", [
          ENUM_EVENT_TYPE.LEGENDARIOS,
          ENUM_EVENT_TYPE.REM,
        ]),
      },
      {
        title: "Criar novo",
        url: orgsRoutes.createEvent,
        icon: Plus,
        enable: enableRoute("SUPER_ADMIN", [
          ENUM_EVENT_TYPE.LEGENDARIOS,
          ENUM_EVENT_TYPE.REM,
        ]),
      },
    ],
    administration: [
      {
        title: "Lista inscritos",
        url: getUrlByEventType(
          eventType,
          "#",
          orgsRoutes.event.registeredList.manadaDay,
        ),
        icon: Users2,
        enable: enableRoute("CHECKIN"),
        ...(eventType !== ENUM_EVENT_TYPE.MANADADAY && {
          items: [
            {
              title: title[eventType][ENUM_REGISTER_TYPE.PARTICIPANTE].title,
              url: orgsRoutes.event.registeredList.participant,
              enable: true,
            },
            {
              title: title[eventType][ENUM_REGISTER_TYPE.SERVIR].title,
              url: orgsRoutes.event.registeredList.legendary,
              enable: true,
            },
          ],
        }),
      },
      {
        title: "Check-in",
        url: getUrlByEventType(
          eventType,
          "#",
          orgsRoutes.event.checkIn.manadaDay,
        ),
        icon: SquareCheckBigIcon,
        enable: !!event?.topNumero && isCheckIn(membership),
        ...(eventType !== ENUM_EVENT_TYPE.MANADADAY && {
          items: [
            {
              title: title[eventType][ENUM_REGISTER_TYPE.PARTICIPANTE].title,
              url: orgsRoutes.event.checkIn.participant,
              enable: true,
            },
            {
              title: title[eventType][ENUM_REGISTER_TYPE.SERVIR].title,
              url: orgsRoutes.event.checkIn.legendary,
              enable: true,
            },
          ],
        }),
      },
      {
        title: "Hakuna",
        url: orgsRoutes.event.hakuna,
        icon: Stethoscope,
        enable: enableRoute(Role.HAKUNA, ENUM_EVENT_TYPE.LEGENDARIOS),
      },
      {
        title: "Famílias",
        url: orgsRoutes.event.familyClassification,
        icon: FlagTriangleRight,
        enable: enableRoute(Role.ADMIN, [
          ENUM_EVENT_TYPE.LEGENDARIOS,
          ENUM_EVENT_TYPE.REM,
        ]),
      },
      {
        title: "Plano de Embarque",
        url: "#",
        icon: Bus,
        enable: enableRoute(Role.CHECKIN, ENUM_EVENT_TYPE.LEGENDARIOS),
        items: [
          {
            title: "Viaturas",
            url: orgsRoutes.event.boardingPlan.createVehicle,
            enable: true,
          },
          {
            title: "Distribuir",
            url: orgsRoutes.event.boardingPlan.deliver,
            enable: true,
          },
        ],
      },
      {
        title: "Entrega boné",
        url: orgsRoutes.event.cap,
        icon: GiBilledCap,
        enable: enableRoute(Role.CHECKIN, [
          ENUM_EVENT_TYPE.REM,
          ENUM_EVENT_TYPE.LEGENDARIOS,
        ]),
      },
      {
        title: "Cartas",
        url: orgsRoutes.event.letters,
        icon: Mail,
        enable: enableRoute(Role.CHECKIN, ENUM_EVENT_TYPE.LEGENDARIOS),
      },
      {
        title: "Ladies",
        url: orgsRoutes.event.ladies,
        icon: Flower,
        enable: enableRoute(Role.LADIES, ENUM_EVENT_TYPE.LEGENDARIOS),
      },
    ],
    settings: [
      {
        title: "Cupom",
        url: orgsRoutes.event.coupons.coupons,
        icon: TicketPercent,
        enable: enableRoute(Role.ADMIN, [
          ENUM_EVENT_TYPE.REM,
          ENUM_EVENT_TYPE.LEGENDARIOS,
          ENUM_EVENT_TYPE.MANADADAY,
        ]),
      },
      {
        title: "Link secreto",
        url: orgsRoutes.event.secretLinks.link,
        icon: LinkIcon,
        enable: enableRoute(Role.ADMIN, [
          ENUM_EVENT_TYPE.REM,
          ENUM_EVENT_TYPE.LEGENDARIOS,
        ]),
      },
    ],
    organization: [
      // {
      //   title: "Meus dados",
      //   url: orgsRoutes.editOrg,
      // },
      // {
      //   title: "Criar nova pista",
      //   url: orgsRoutes.createOrg,
      // },
      {
        title: "Membros",
        url: orgsRoutes.members,
        enable: enableRoute(Role.ADMIN, undefined, true),
      },
      {
        title: "Todos Legendários",
        url: orgsRoutes.allLegendary,
        enable: enableRoute(Role.ADMIN, ENUM_EVENT_TYPE.LEGENDARIOS, true),
      },
      // {
      //   title: "Meus eventos",
      //   url: "#",
      // },
      // {
      //   title: "Mais",
      //   url: "#",
      //   subItems: [
      //     {
      //       title: "Repasses financeiros",
      //       url: "#",
      //     },
      //     {
      //       title: "Taxas",
      //       url: "#",
      //     },
      //   ],
      // },
    ],
  };

  return data;
};
