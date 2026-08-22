import { create } from "zustand";

type TabsProps = "geral" | "financeiro" | "administrativo" | "relatorio";

interface TabsDashboard {
  tab: TabsProps;
  setTab: (tab: TabsProps) => void;
}

export const useTabsDashboard = create<TabsDashboard>((set) => ({
  tab: "geral",
  setTab: (tab) => set(() => ({ tab })),
}));
