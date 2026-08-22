import { create } from "zustand";

export type TypeTabsBoarding = "participants" | "legendary";

type TabsBoardingPlan = {
  tab: TypeTabsBoarding;
  setTab: (tab: TypeTabsBoarding) => void;
};

export const useTabsBoardingPlan = create<TabsBoardingPlan>((set) => ({
  tab: "participants",
  setTab: (tab) => set(() => ({ tab })),
}));
