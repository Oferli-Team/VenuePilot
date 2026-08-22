import { type CupomDesconto } from "@prisma/client";
import { create } from "zustand";

interface CupomDescontoType {
  showCupomInput: boolean;
  setShowInput: (showCupomInput: boolean) => void;
  cupom: CupomDesconto | null;
  cupomValue: string;
  cupomError: string;
  setCupom: (cupom: CupomDesconto | null) => void;
  setCupomValue: (cupomValue: string) => void;
  setCupomError: (cupomError: string) => void;
  resetCupom: () => void;
}

const initialState = {
  showCupomInput: false,
  cupomError: "",
  cupom: null,
  cupomValue: "none",
};

export const useCupomDesconto = create<CupomDescontoType>((set) => ({
  ...initialState,
  setCupom: (cupom) => set(() => ({ cupom })),
  setCupomValue: (cupomValue) => set(() => ({ cupomValue })),
  setCupomError: (cupomError) => set(() => ({ cupomError })),
  setShowInput: (showCupomInput) => set(() => ({ showCupomInput })),
  resetCupom: () => set(initialState),
}));
