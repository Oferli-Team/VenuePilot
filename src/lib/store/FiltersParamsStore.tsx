import { create } from "zustand";

type ValueType = string | string[] | undefined;

type FilterState = {
  fieldFilters: Record<string, ValueType>;
  setFieldFilters: (key: string, value: ValueType) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
};

export const useFilterParamsStore = create<FilterState>((set, get) => ({
  fieldFilters: {},
  setFieldFilters: (key, value) => {
    set((state) => {
      const updatedFilters = { ...state.fieldFilters };

      if (value) {
        updatedFilters[key] = value;
      } else {
        delete updatedFilters[key];
      }

      return {
        fieldFilters: updatedFilters,
      };
    });
  },
  clearFilter: (key) => {
    set((state) => {
      const updatedFilters = { ...state.fieldFilters };
      delete updatedFilters[key];

      return {
        fieldFilters: updatedFilters,
      };
    });
  },
  clearAllFilters: () =>
    set(() => {
      return {
        fieldFilters: {},
        filtersActive: [],
      };
    }),
}));
