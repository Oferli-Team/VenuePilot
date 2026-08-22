"use client";

import { type ManadaPagesParams } from "@/lib/types";
import React from "react";
import { CardDashboardSkeleton } from "@/components/card-dashboard-skeleton";
import { useFindEvent } from "@/lib/hooks/event";
import { DataTable as DataTableUI } from "@/components/ui/data-table";
import { columnsCheckInManadaDay } from "./column";
import { api } from "@/trpc/react";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { ParticipantsExpandedTable } from "@/components/checkin/participants-expanded-table";
import { GridTwoColumns } from "@/components/grid-two-columns";
import { Square, SquareCheck } from "lucide-react";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Heading } from "@/components/ui/heading";
import { CardsStats } from "@/components/cards-stats";

export default function CheckInRegisterPage() {
  const { event } = useFindEvent();

  const { data: statsData, isPending: isCheckInStatusPending } =
    api.manadaDay.getCheckinStateByCategory.useQuery(
      {
        eventoId: event?.id,
      },
      {
        enabled:
          !!event &&
          (event.type as ENUM_EVENT_TYPE) === ENUM_EVENT_TYPE.MANADADAY,
      },
    );

  const { data, isPending: isDatTablePending } =
    api.manadaDay.getAllManadaDayRegisters.useQuery(
      {
        eventoId: event?.id,
        status: "CONFIRMADA",
        orderBy: [{ name: "asc" }, { cpf: "asc" }],
      },
      {
        enabled:
          !!event &&
          (event.type as ENUM_EVENT_TYPE) === ENUM_EVENT_TYPE.MANADADAY,
      },
    );

  return (
    <>
      <GridTwoColumns className="md:grid-cols-1">
        {isCheckInStatusPending ? (
          <CardDashboardSkeleton />
        ) : (
          statsData && (
            <CardsStats
              {...statsData.stats}
              primaryLabel="Check-in realizado"
              primaryIcon={<SquareCheck />}
              secondLabel="Check-in pendente"
              secondIcon={<Square />}
            />
          )
        )}
      </GridTwoColumns>

      <div className="space-y-4">
        <Heading
          lineLeft
          title="Ingressos Comprados"
          subtitle="Busque os ingressos por nome, CPF ou número do identificador"
        />

        {isDatTablePending ? (
          <DataTableSkeleton rowCount={6} columnCount={8} />
        ) : (
          <DataTableUI
            columns={columnsCheckInManadaDay}
            data={data ?? []}
            search={{ field: "cpf", placeholder: "Busque por Nome ou CPF" }}
            renderExpandedRow={(row, table, searchValue) => (
              <div>ParticipantsExpandedTable</div>
              // <ParticipantsExpandedTable row={row} searchValue={searchValue} />
            )}
            showFooterTable
          />
        )}
      </div>
    </>
  );
}
