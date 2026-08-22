"use client";

import { type VISIBLE_FIELDS_SIDE_TABLE } from "@/lib/constants";
import { type Inscricao } from "@prisma/client";
import { type Row } from "@tanstack/react-table";
import { create } from "zustand";

interface inscricaoDetailProps {
  isOpenSheet: boolean;
  setIsOpenSheet: (isOpenSheet: boolean) => void;
  isOpenDrawer: boolean;
  setIsOpenDrawer: (isOpenDrawer: boolean) => void;
  selectedInscricao: Inscricao | null;
  setSelectedInscricao: (selectedInscricao: Inscricao | null) => void;
  page: keyof typeof VISIBLE_FIELDS_SIDE_TABLE | string;
  setPage: (page: string) => void;
  handleClickModals: (row: Row<Inscricao>) => void;
}

export const useInscricaoDetail = create<inscricaoDetailProps>((set, get) => ({
  page: "",
  isOpenDrawer: false,
  isOpenSheet: false,
  selectedInscricao: null,
  setIsOpenDrawer: (isOpenDrawer: boolean) => set(() => ({ isOpenDrawer })),
  setIsOpenSheet: (isOpenSheet: boolean) => set(() => ({ isOpenSheet })),
  setSelectedInscricao: (selectedInscricao: Inscricao | null) =>
    set(() => ({ selectedInscricao })),
  setPage: (page: string) => set(() => ({ page })),

  handleClickModals: (row: Row<Inscricao>) => {
    set(() => ({ selectedInscricao: row.original }));
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      set(() => ({ isOpenDrawer: true, isOpenSheet: false }));
    } else {
      set(() => ({ isOpenDrawer: false, isOpenSheet: true }));
    }
  },
}));
