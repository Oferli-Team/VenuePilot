import { create } from "zustand";

interface EventStore {
  expandedRowId: string | null;
  setExpandedRowId: (id: string | null) => void;
}

export const useExpandedRowId = create<EventStore>((set) => ({
  expandedRowId: null,
  setExpandedRowId: (rowId: string | null) => set({ expandedRowId: rowId }),
}));
