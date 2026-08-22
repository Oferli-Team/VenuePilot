"use client";

import React, { Suspense } from "react";
import { allColumns } from "@/lib/table/columns";
import { type ManadaPagesParams } from "@/lib/types";
import { useFindEvent } from "@/lib/hooks/event";
import { getVisibleColumnPage } from "@/lib/utils/getVisibleColumnPage";
import { type ENUM_EVENT_TYPE } from "@/lib/enum";
import { CardDashboardSkeleton } from "@/components/card-dashboard-skeleton";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { InscritosStats } from "@/components/inscritos-stats";
import { DataTable } from "@/components/data-table-general";
import { DataSidebar } from "../data-sidebar";
import { api } from "@/trpc/react";
import { type VISIBLE_FIELDS_SIDE_TABLE } from "@/lib/constants";

export default function InscritosServirPage({
  params,
  searchParams,
}: ManadaPagesParams) {
  const { max, page, search, ...filters } = searchParams;

  const { event } = useFindEvent();

  const { data: inscritosStatus } =
    api.inscricao.getAllInscritosParticipantes.useQuery(
      {
        eventoId: event?.id,
        tipoInscricao: "SERVIR",
      },
      {
        enabled: !!event?.id,
      },
    );

  const { data: legendary } =
    api.inscricao.getAllRegistersWithPagination.useQuery(
      {
        eventoId: event?.id,
        tipoInscricao: "SERVIR",
        search,
        filters,
        page: page ? Number(page) : 1,
        pageSize: max ? Number(max) : undefined,
      },
      {
        enabled: !!event?.id,
        placeholderData: (prevData) => prevData,
      },
    );

  const visibleColumnPage = React.useMemo(() => {
    return getVisibleColumnPage({
      type: event?.type as ENUM_EVENT_TYPE,
      page: "serve",
      fallback: "lgndServir",
    });
  }, [event]);

  return (
    <>
      <Suspense
        fallback={Array.from({ length: 4 }).map((_, i) => (
          <CardDashboardSkeleton key={i + 1} />
        ))}
      >
        <InscritosStats {...inscritosStatus} />
      </Suspense>

      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={8} />}>
        <DataTable
          columns={allColumns}
          data={legendary?.data || []}
          totalPages={legendary?.totalPages}
          totalItems={legendary?.totalItems}
          filters={filters}
          showDownloadSimplifyBtn
          visibleColumnPage={visibleColumnPage}
          sidebar={
            <DataSidebar
              visibleFieldsPage={
                visibleColumnPage as keyof typeof VISIBLE_FIELDS_SIDE_TABLE
              }
            />
          }
          startSortingBy={[{ id: "nome", desc: false }]}
          columnsHiding={[
            "index",
            "cpf",
            "spouseCPF",
            "nrLgnd",
            "dataNascimento",
          ]}
        />
      </Suspense>
    </>
  );
}
