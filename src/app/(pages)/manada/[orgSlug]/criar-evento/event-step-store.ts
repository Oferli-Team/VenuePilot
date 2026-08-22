import { type Evento } from "@prisma/client";
import { create } from "zustand";

export type EventSteps = "general" | "tickets" | "terms" | "list" | "success";

type formData = Partial<
  Omit<
    Evento,
    | "banner"
    | "ownerId"
    | "organizationId"
    | "pista"
    | "id"
    | "posted"
    | "openServir"
    | "openParticipar"
    | "hero"
    | "credit_card_fees"
    | "itopFee"
  >
>;

export type formGeneralEventData = Pick<
  Evento,
  | "titulo"
  | "subtitulo"
  | "topNumero"
  | "description"
  | "dataInicio"
  | "dataFim"
  | "periodo"
  | "local"
  | "localSaida"
  | "localUrl"
>;
export type formTicketEventData = Pick<
  Evento,
  | "vagasParticipar"
  | "vagasServir"
  | "valorParticipante"
  | "valorParaLgndCertificados"
  | "valorParaObterCertificacao"
>;
export type formTermsEventData = Pick<Evento, "terms">;
export type formListEventData = Pick<Evento, "list">;

const initialFormData = {
  slug: "",
  topNumero: 0,
  periodo: "",
  titulo: "",
  description: "",
  subtitulo: "",
  dataInicio: "",
  dataFim: "",
  local: "",
  localSaida: "",
  localUrl: "",
  valorParticipante: 0,
  valorParaObterCertificacao: 0,
  valorParaLgndCertificados: 0,
  linkWhatsappGrupoParticipante: "",
  linkWhatsappGrupoServir: "",
  vagasParticipar: 0,
  vagasServir: 0,
  terms: "",
  list: "",
};

type EventStepsProps = {
  step: EventSteps;
  setStep: (step: EventSteps) => void;
  formData: formData | null;
  setFormGeneralData: (formData: formGeneralEventData) => void;
  setFormTicketData: (formData: formTicketEventData) => void;
  setFormTermData: (formData: formTermsEventData) => void;
  setFormListData: (formData: formListEventData) => void;
  resetFormData: () => void;
  dirtySteps: Record<EventSteps, boolean>;
  setDirtyStep: (step: EventSteps, isDirty: boolean) => void;
};

export const useEventStepsStore = create<EventStepsProps>((set) => ({
  step: "general",
  setStep: (step) => set(() => ({ step })),
  formData: initialFormData ?? null,
  setFormGeneralData: (data) => {
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    }));
  },
  setFormTicketData: (data) => {
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    }));
  },
  setFormTermData: (data) => {
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    }));
  },
  setFormListData: (data) => {
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    }));
  },
  resetFormData: () => set(() => ({ formData: initialFormData })),
  dirtySteps: {
    general: false,
    tickets: false,
    terms: false,
    list: false,
    success: false,
  },
  setDirtyStep: (step, isDirty) =>
    set((state) => ({
      dirtySteps: { ...state.dirtySteps, [step]: isDirty },
    })),
}));
