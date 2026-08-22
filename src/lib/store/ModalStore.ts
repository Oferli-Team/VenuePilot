import type { Evento, Inscricao } from "@prisma/client";
import { create } from "zustand";

export type ModalId = "letters_obs" | "health_obs" | "checkIn_obs";

type RegisterWithEvent = Inscricao & {
  evento: Pick<Evento, "id" | "topNumero" | "pista" | "dataInicio" | "dataFim">;
};

interface ModalInfo {
  isOpen: boolean;
  inscricao: RegisterWithEvent | null;
}

type OpenModalsProps = Record<ModalId, ModalInfo>;

interface ModalState {
  openModals: OpenModalsProps;
  openModal: (modalId: ModalId, inscricao: RegisterWithEvent) => void;
  closeModal: (modalId: ModalId) => void;
  toggleModal: (modalId: ModalId, inscricao: RegisterWithEvent) => void;
  isModalOpen: (modalId: ModalId, inscricao: RegisterWithEvent) => boolean;
  getModalInscricao: (modalId: ModalId) => RegisterWithEvent | null;

  inscricao: RegisterWithEvent | null;
  setInscricao: (inscricao: RegisterWithEvent | null) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  openModals: {
    letters_obs: { isOpen: false, inscricao: null },
    health_obs: { isOpen: false, inscricao: null },
    checkIn_obs: { isOpen: false, inscricao: null },
  },

  openModal: (modalId, inscricao) =>
    set((state) => ({
      openModals: {
        ...state.openModals,
        [modalId]: { isOpen: true, inscricao },
      },
    })),

  closeModal: (modalId) =>
    set((state) => ({
      openModals: {
        ...state.openModals,
        [modalId]: { ...state.openModals[modalId], isOpen: false },
      },
    })),

  toggleModal: (modalId, inscricao) =>
    set((state) => ({
      openModals: {
        ...state.openModals,
        [modalId]: {
          isOpen: !state.openModals[modalId].isOpen,
          inscricao: state.openModals[modalId].isOpen ? null : inscricao,
        },
      },
    })),

  isModalOpen: (modalId, inscricao) =>
    get().openModals[modalId].isOpen &&
    get().openModals[modalId].inscricao?.id === inscricao.id,

  getModalInscricao: (modalId) => get().openModals[modalId].inscricao,

  inscricao: null,
  setInscricao: (inscricao) => set({ inscricao }),
}));
