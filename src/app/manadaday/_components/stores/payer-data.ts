import { create } from "zustand";

type FormData = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  isLegendary: boolean;
};

type ManadaDayFormData = {
  formData: FormData | null;
  setFormData: (data: FormData) => void;
};

export const useManadaDayFormData = create<ManadaDayFormData>((set) => ({
  formData: null,
  setFormData: (data) => set(() => ({ formData: data })),
}));
