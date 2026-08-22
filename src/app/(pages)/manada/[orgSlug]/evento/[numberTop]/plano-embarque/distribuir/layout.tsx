"use client";

import { useBoardingPlanStore } from "@/components/boarding-plan/boarding-plan-store";
import {
  type TypeTabsBoarding,
  useTabsBoardingPlan,
} from "@/components/boarding-plan/tabs-store";
import { TabTriggerFlag } from "@/components/boarding-plan/tab-trigger-flag";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { usePathname } from "next/navigation";
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DistributorLayoutPage({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { tab, setTab } = useTabsBoardingPlan();
  const pathname = usePathname();
  const {
    hasUnsavedCarsChanges,
    hasUnsavedBusChanges,
    setHasUnsavedBusChanges,
    setHasUnsavedCarsChanges,
  } = useBoardingPlanStore();

  const handleTabChange = (value: string) => {
    setTab(value as TypeTabsBoarding);
  };

  React.useEffect(() => {
    setHasUnsavedBusChanges(false);
    setHasUnsavedCarsChanges(false);
  }, [pathname]);

  return (
    <SidebarProvider>
      <Tabs
        className="space-y-4"
        defaultValue="participants"
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabTriggerFlag
            hasUnsaved={hasUnsavedBusChanges}
            label="Sentinelas"
            value="participants"
          />
          <TabTriggerFlag
            hasUnsaved={hasUnsavedCarsChanges}
            label="Legendários"
            value="legendary"
          />
        </TabsList>
        <TabsContent
          value={tab}
          className="h-full overflow-x-hidden overflow-y-hidden pb-6"
        >
          {children}
        </TabsContent>
      </Tabs>
    </SidebarProvider>
  );
}
