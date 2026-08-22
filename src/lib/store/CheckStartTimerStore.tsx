"use client";

import { create } from "zustand";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";

interface CheckTimerState {
  isStarted: boolean;
  startedByRoute: "/participar" | "/servir" | undefined;
  participanteStarted: () => void;
  servirStarted: () => void;
  reset: () => void;
}

const useCheckTimerStore = create<CheckTimerState>((set) => ({
  isStarted: false,
  startedByRoute: undefined,
  participanteStarted: () =>
    set({ isStarted: true, startedByRoute: "/participar" }),
  servirStarted: () => set({ isStarted: true, startedByRoute: "/servir" }),
  reset: () => set({ isStarted: false, startedByRoute: undefined }),
}));

const CheckTimerProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { isStarted, startedByRoute, reset } = useCheckTimerStore();

  useEffect(() => {
    if (isStarted && startedByRoute && pathname !== startedByRoute) {
      reset();
    }
  }, [isStarted, pathname, startedByRoute, reset]);

  return <>{children}</>;
};

export const useCheckTimer = useCheckTimerStore;
export default CheckTimerProvider;
