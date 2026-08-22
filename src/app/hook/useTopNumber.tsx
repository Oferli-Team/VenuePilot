"use client";

import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { type Evento } from "@prisma/client";
import { create } from "zustand";

interface EventoLocalStorage {
  topNumber: string;
  eventoId: string | undefined;
}

interface topNumberProps {
  topNumber: string;
  eventoId: string | undefined;
  setTopNumber: (topNumber: string) => void;
  event: Evento | null;
  fetchEvento: (topNumber: string) => Promise<void>;
  loadFromLocalStorage: () => void;
}

export const useTopNumber = create<topNumberProps>((set) => ({
  topNumber: "",
  eventoId: undefined,
  loadFromLocalStorage: () => {
    if (typeof window !== "undefined") {
      const storedEvento = localStorage.getItem("evento");
      if (storedEvento) {
        const eventoObj: EventoLocalStorage = JSON.parse(storedEvento);
        set({
          topNumber: eventoObj.topNumber ?? "",
          eventoId: eventoObj.eventoId ?? undefined,
        });
      }
    }
  },
  setTopNumber: (topNumber: string) => {
    set(() => ({ topNumber }));
    if (typeof window !== "undefined") {
      const storedEvento = localStorage.getItem("evento");
      const eventoObj: EventoLocalStorage = storedEvento
        ? JSON.parse(storedEvento)
        : {};
      eventoObj.topNumber = topNumber;
      localStorage.setItem("evento", JSON.stringify(eventoObj));
    }
  },
  fetchEvento: async (topNumber: string) => {
    try {
      const orgSlug = getCurrentOrgFromCookie() ?? "";
      const data = await fetch(
        `/api/org/${orgSlug}/evento/${topNumber.toString()}`,
      );
      const result = await data.json();

      console.log({ result });

      if (result.data) {
        set({ event: result.data });

        if (typeof window !== "undefined") {
          const storedEvento = localStorage.getItem("evento");
          const eventoObj: EventoLocalStorage = storedEvento
            ? JSON.parse(storedEvento)
            : {};
          eventoObj.eventoId = result.data.id;
          localStorage.setItem("evento", JSON.stringify(eventoObj));
          set({ eventoId: result.data.id });
        }
      } else {
        set({ event: null, eventoId: undefined });
      }
    } catch (error) {
      console.error("Erro ao buscar evento:", error);
      set({ event: null, eventoId: undefined });
    }
  },
  event: null,
}));
