import { type Inscricao } from "@prisma/client";
import { create } from "zustand";

export type RegisterCheckInStore = Pick<
  Inscricao,
  | "id"
  | "eventoId"
  | "nome"
  | "cpf"
  | "celular"
  | "status"
  | "familia"
  | "tipoInscricao"
  | "checkin"
  | "checkinStatus"
  | "checkinCode"
  | "check_obs"
>;

interface Props {
  user: RegisterCheckInStore | null;
  setUser: (user: RegisterCheckInStore | null) => void;
  checkinObs: string | undefined;
  setCheckinObs: (checkinObs: string) => void;
  updateUserCheckIn: (checkin: boolean) => void;
  updateUserCheckInObs: (checkin: string) => void;
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  enableScanner: boolean;
  setEnableScanner: (enableScanner: boolean) => void;
}

export const useUserCheckInStore = create<Props>((set) => ({
  user: null,
  setUser: (user: RegisterCheckInStore | null) => set({ user }),
  checkinObs: undefined,
  setCheckinObs: (checkinObs: string) => set({ checkinObs }),
  updateUserCheckIn: (checkin: boolean) =>
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, checkin };
        return { user: updatedUser };
      }
      return state;
    }),
  updateUserCheckInObs: (check_obs: string) =>
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, check_obs };
        return { user: updatedUser };
      }
      return state;
    }),
  openModal: false,
  setOpenModal: (openModal: boolean) => set({ openModal }),
  enableScanner: false,
  setEnableScanner: (enableScanner: boolean) => set({ enableScanner }),
}));
