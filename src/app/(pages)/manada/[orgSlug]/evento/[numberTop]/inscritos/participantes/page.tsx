"use client";

import { allColumns } from "@/lib/table/columns";
import { type ManadaPagesParams } from "@/lib/types";
import React, { Suspense } from "react";
import { CardDashboardSkeleton } from "@/components/card-dashboard-skeleton";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { InscritosStats } from "@/components/inscritos-stats";
import { DataTable } from "@/components/data-table-general";
import { DataSidebar } from "../data-sidebar";
import { api } from "@/trpc/react";
import { useFindEvent } from "@/lib/hooks/event";
import { getVisibleColumnPage } from "@/lib/utils/getVisibleColumnPage";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { type VISIBLE_FIELDS_SIDE_TABLE } from "@/lib/constants";

export default function InscritosPage({
  params,
  searchParams,
}: ManadaPagesParams) {
  const { page, max, search, ...filters } = searchParams;

  const { event } = useFindEvent();

  const { data: inscritosStatus } =
    api.inscricao.getAllInscritosParticipantes.useQuery(
      {
        eventoId: event?.id,
        tipoInscricao: "PARTICIPANTE",
      },
      {
        enabled: !!event && event.type !== ENUM_EVENT_TYPE.MANADADAY,
      },
    );

  const { data: participants } =
    api.inscricao.getAllRegistersWithPagination.useQuery(
      {
        eventoId: event?.id,
        tipoInscricao: "PARTICIPANTE",
        search,
        filters,
        page: page ? Number(page) : 1,
        pageSize: max ? Number(max) : undefined,
      },
      {
        enabled: !!event && event.type !== ENUM_EVENT_TYPE.MANADADAY,
        placeholderData: (prevData) => prevData,
      },
    );

  const visibleColumnPage = React.useMemo(() => {
    return getVisibleColumnPage({
      type: event?.type as ENUM_EVENT_TYPE,
      page: "participate",
      fallback: "inscritos",
    });
  }, [event]);

  return (
    <>
      <Suspense
        fallback={Array.from({ length: 4 }).map((_, i) => (
          <CardDashboardSkeleton key={i} />
        ))}
      >
        <InscritosStats {...inscritosStatus} />
      </Suspense>

      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={8} />}>
        <DataTable
          columns={allColumns}
          data={participants?.data || []}
          totalPages={participants?.totalPages}
          totalItems={participants?.totalItems}
          filters={filters}
          visibleColumnPage={visibleColumnPage}
          sidebar={
            <DataSidebar
              visibleFieldsPage={
                visibleColumnPage as keyof typeof VISIBLE_FIELDS_SIDE_TABLE
              }
            />
          }
          startSortingBy={[{ id: "nome", desc: false }]}
          showDownloadSimplifyBtn={true}
          columnsHiding={[
            "index",
            "cpf",
            "spouseCPF",
            "dataNascimento",
            "spouseBirthDate",
            "womanTshirtSize",
            "manTshirtSize",
          ]}
        />
      </Suspense>
    </>
  );
}
