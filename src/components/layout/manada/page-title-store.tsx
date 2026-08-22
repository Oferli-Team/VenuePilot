import { type useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { create } from "zustand";

export const routeTitleMap = (routes: ReturnType<typeof useEventRoutes>) => {
  return {
    [routes.orgsRoutes.dashboard]: "Manada",
    [routes.orgsRoutes.event.registeredList.participant]:
      "Lista Inscritos | Participantes",
    [routes.orgsRoutes.event.registeredList.legendary]:
      "Lista Inscritos | Legendários",
    [routes.orgsRoutes.event.dashboard]: "Dashboard",
    [routes.orgsRoutes.event.checkIn.participant]: "Check-in | Participantes",
    [routes.orgsRoutes.event.checkIn.legendary]: "Check-in | Legendários",
    [routes.orgsRoutes.event.hakuna]: "Hakuna | Classificação de Saúde",
    [routes.orgsRoutes.event.letters]: "Cartas",
    [routes.orgsRoutes.event.ladies]: "Ladies",
    [routes.orgsRoutes.event.secretLinks.link]: "Links Secretos",
    [routes.orgsRoutes.event.coupons.coupons]: "Cupom de Desconto",
  };
};

interface PageTitleState {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

export const usePageTitleStore = create<PageTitleState>((set) => ({
  pageTitle: "Manada",
  setPageTitle: (title: string) => set({ pageTitle: title }),
}));
