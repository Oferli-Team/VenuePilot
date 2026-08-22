import { type Evento } from "@prisma/client";
import { create } from "zustand";

interface EventStore {
  event: Evento | null;
  setEvent: (event: Evento | null) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  event: null,
  setEvent: (event) => set({ event }),
}));
