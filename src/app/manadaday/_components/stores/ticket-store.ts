import { create } from "zustand";

export type TicketProps = {
  ADULT: number;
  PAID_CHILD: number;
  FREE_CHILD: number;
};

type Steps = "data" | "payment";
export type TicketType = "ADULT" | "PAID_CHILD" | "FREE_CHILD";

type Tickets = {
  ticket: TicketProps;
  tickets: {
    type: TicketType;
    index: number;
    value: 0;
  }[];
  step: Steps;
  setStep: (step: Steps) => void;
  setTicket: (ticket: TicketProps) => void;
  startRegister: boolean;
  setStartRegister: (startRegister: boolean) => void;
  setTickets: (
    tickets: {
      type: TicketType;
      index: number;
      value: 0;
    }[],
  ) => void;
};

export const useTickets = create<Tickets>((set) => ({
  ticket: {
    ADULT: 0,
    PAID_CHILD: 0,
    FREE_CHILD: 0,
  },
  tickets: [],
  startRegister: false,
  step: "data",
  setTicket: (ticket) => set(() => ({ ticket })),
  setTickets: (
    tickets: {
      type: TicketType;
      index: number;
      value: 0;
    }[],
  ) => set(() => ({ tickets })),
  setStartRegister: (startRegister: boolean) => set(() => ({ startRegister })),
  setStep: (step: Steps) => set(() => ({ step })),
}));
