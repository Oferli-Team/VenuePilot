"use client";

import { AdmTab } from "@/components/dashboard/adm-tab";
import { FinanceiroTab } from "@/components/dashboard/financeiro-tab";
import { GeralTab } from "@/components/dashboard/geral-tab";
import { FinancialTab } from "@/components/dashboard/manada-day/financial-tab";
import { GeneralTab } from "@/components/dashboard/manada-day/general-tab";
import { RelatorioTab } from "@/components/dashboard/relatorio-tab";
import { AdminRemTab } from "@/components/dashboard/rem/admin-tab";
import { GeneralRemTab } from "@/components/dashboard/rem/general-tab";
import { useTabsDashboard } from "@/components/dashboard/tabs-store";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { useFindEvent } from "@/lib/hooks/event";
import { type ManadaPagesParams } from "@/lib/types";
import React from "react";

export default function DashboardPage({ params }: ManadaPagesParams) {
  const { tab } = useTabsDashboard();
  const { event } = useFindEvent();

  const renderTabsContent = React.useMemo(() => {
    switch (event?.type as ENUM_EVENT_TYPE) {
      case ENUM_EVENT_TYPE.LEGENDARIOS:
        switch (tab) {
          case "geral":
            return <GeralTab eventoId={event?.id} />;
          case "financeiro":
            return <FinanceiroTab eventoId={event?.id} />;
          case "administrativo":
            return <AdmTab eventoId={event?.id} />;
          case "relatorio":
            return <RelatorioTab />;
          default:
            return null;
        }

      case ENUM_EVENT_TYPE.REM:
        switch (tab) {
          case "geral":
            return <GeneralRemTab />;
          case "financeiro":
            return <FinanceiroTab eventoId={event?.id} />;
          case "administrativo":
            return <AdminRemTab />;
          case "relatorio":
            return <RelatorioTab />;
          default:
            return null;
        }

      case ENUM_EVENT_TYPE.MANADADAY:
        switch (tab) {
          case "geral":
            return <GeneralTab />;
          case "financeiro":
            return <FinancialTab />;

          default:
            return null;
        }

      default:
        return null;
    }
  }, [tab, event]);

  return <>{renderTabsContent}</>;
}
