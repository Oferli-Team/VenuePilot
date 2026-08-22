import { useEventStore } from "../store/EventStore";
import { getCurrentEventFromCookie } from "../utils/getCurrentEventFromCookie";
import { getCurrentOrgFromCookie } from "../utils/getCurrentOrgFromCookie";

type routesProps = {
  userType?: "participantes" | "servir";
  userId?: string;
  couponId?: string;
  linkId?: string;
  secretLink?: string;
  topNumber?: string;
};

export const useEventRoutes = ({
  userType,
  userId,
  couponId,
  linkId,
  secretLink,
  topNumber,
}: routesProps) => {
  const orgSlug = getCurrentOrgFromCookie() ?? "";
  const eventSlug = getCurrentEventFromCookie() ?? "";
  const { event } = useEventStore();

  const baseOrgRoute = `/manada/${orgSlug}`;
  const baseEventRoute = eventSlug
    ? `${baseOrgRoute}/evento/${eventSlug}`
    : baseOrgRoute;

  return {
    publicRoutes: {
      home: "/",
      sign: "/auth/signin",
      verifyRequest: "/auth/verify-request",
      onboard: "/identificacao",
      eventPage: `/evento/${topNumber ?? ""}`,
      ticket: "/ticket",
      landingPage: "/itop",
      faq: "/perguntas-frequentes",
      cancelPolicy: "/politica-de-cancelamento",
      privacyPolicy: "/politica-de-privacidade",
      register: {
        legendary: {
          participate: `/${topNumber ?? ""}/participar`,
          serve: `/${topNumber ?? ""}/servir`,
        },
        rem: {
          participate: `/rem/${topNumber ?? ""}/participar`,
          serve: `/rem/${topNumber ?? ""}/servir`,
        },
        legacyDaughter: {
          participate: `/legacy-filha/${topNumber ?? ""}/participar`,
          serve: `/legado-filha/${topNumber ?? ""}/servir`,
        },
        legacySon: {
          participate: `/legado-filho/${topNumber ?? ""}/participar`,
          serve: `/legado-filho/${topNumber ?? ""}/servir`,
        },
      },
      event: {
        // TODO: por hora é link fix pro manada day
        manadaDay: `/manadaday/participar`,
        public: `/evento/${topNumber ?? ""}`,
        secretLink: `/evento/${topNumber ?? ""}/${secretLink ?? ""}`,
      },
    },
    orgsRoutes: {
      createOrg: `/criar-organizacao`,
      orgCreatedSuccessfully: `/criar-organizacao/success`,
      editOrg: `${baseOrgRoute}/editar-org`,
      dashboard: baseOrgRoute,
      permission: `${baseOrgRoute}/permissao`,
      createEvent: `${baseOrgRoute}/criar-evento`,
      settings: `${baseOrgRoute}/settings`,
      members: `${baseOrgRoute}/membros`,
      allLegendary: `${baseOrgRoute}/legendarios`,
      event: {
        dashboard: eventSlug ? `${baseEventRoute}/dashboard` : baseOrgRoute,
        edit: eventSlug ? `${baseEventRoute}/editar-evento` : baseOrgRoute,
        settings: eventSlug ? `${baseEventRoute}/configuracoes` : baseOrgRoute,
        userDetail: eventSlug
          ? `${baseEventRoute}/inscritos/${userType ?? ""}/${userId ?? ""}/${event?.id}`
          : baseOrgRoute,
        registeredList: {
          participant: eventSlug
            ? `${baseEventRoute}/inscritos/participantes`
            : baseOrgRoute,
          legendary: eventSlug
            ? `${baseEventRoute}/inscritos/servir`
            : baseOrgRoute,
          manadaDay: eventSlug
            ? `${baseEventRoute}/inscritos/manada-day`
            : baseOrgRoute,
        },
        boardingPlan: {
          createVehicle: `${baseEventRoute}/plano-embarque/criar-viatura`,
          deliver: `${baseEventRoute}/plano-embarque/distribuir`,
        },
        hakuna: eventSlug ? `${baseEventRoute}/hakuna` : baseOrgRoute,
        familyClassification: eventSlug
          ? `${baseEventRoute}/familia`
          : baseOrgRoute,
        checkIn: {
          participant: eventSlug
            ? `${baseEventRoute}/checkin/participante`
            : baseOrgRoute,
          legendary: eventSlug
            ? `${baseEventRoute}/checkin/servir`
            : baseOrgRoute,
          manadaDay: eventSlug
            ? `${baseEventRoute}/checkin/manada-day`
            : baseOrgRoute,
        },
        cap: eventSlug ? `${baseEventRoute}/bone` : baseOrgRoute,
        coupons: {
          coupons: eventSlug ? `${baseEventRoute}/cupom` : baseOrgRoute,
          byId: eventSlug
            ? `${baseEventRoute}/cupom/${couponId ?? ""}`
            : baseOrgRoute,
        },
        secretLinks: {
          link: eventSlug ? `${baseEventRoute}/link-secreto` : baseOrgRoute,
          byId: eventSlug
            ? `${baseEventRoute}/link-secreto/${linkId ?? ""}`
            : baseOrgRoute,
        },
        letters: eventSlug ? `${baseEventRoute}/cartas` : baseOrgRoute,
        ladies: eventSlug ? `${baseEventRoute}/ladies` : baseOrgRoute,
        payments: eventSlug ? `${baseEventRoute}/pagamentos` : baseOrgRoute,
        canceled: eventSlug ? `${baseEventRoute}/cancelados` : baseOrgRoute,
      },
    },
  };
};
