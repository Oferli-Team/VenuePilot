import { create } from "zustand";
import { type VISIBLE_COLUMNS } from "../constants";

interface Props {
  page: keyof typeof VISIBLE_COLUMNS;
  handlePage: (page: keyof typeof VISIBLE_COLUMNS) => void;
}

export const useCSVDownloadStore = create<Props>((set) => ({
  page: "inscritos",
  handlePage: (page) => set({ page }),
}));
