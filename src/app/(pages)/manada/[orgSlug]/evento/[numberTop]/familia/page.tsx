"use client";

import { ContainerSpace } from "@/components/ui/container";
import { DataTable } from "@/components/data-table-general";
import { ChartFamily } from "@/components/family/chart-family";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Heading } from "@/components/ui/heading";
import { allColumns } from "@/lib/table/columns";
import { api } from "@/trpc/react";

import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { useFindEvent } from "@/lib/hooks/event";
import { type ManadaPagesParams } from "@/lib/types";
import { Flag } from "lucide-react";
import { getCurrentMembership } from "@/lib/hooks/member";
import { Unauthorized } from "@/components/unauthorized";
import { isAdmin } from "@/lib/utils/hasRole";
import type { ENUM_EVENT_TYPE } from "@/lib/enum";
import { getVisibleColumnPage } from "@/lib/utils/getVisibleColumnPage";
import React from "react";

export default function FamilyPage({
  params,
  searchParams,
}: ManadaPagesParams) {
  const { page, search, max, ...filters } = searchParams;

  const { event } = useFindEvent();
  const { membership, isLoading } = getCurrentMembership();

  const { data: result } = api.inscricao.getAllRegistersWithPagination.useQuery(
    {
      eventoId: event?.id ?? "",
      tipoInscricao: "PARTICIPANTE",
      status: "CONFIRMADA",
      page: page ? Number(page) : undefined,
      pageSize: max ? Number(max) : undefined,
      search,
      filters,
      orderBy: [{ familia: "asc" }, { nome: "asc" }],
    },
    {
      enabled: !!event?.id,
      placeholderData: (prevData) => prevData,
    },
  );

  const { data: dataChartFamily, isPending: isPendingChart } =
    api.inscricao.getChartFamily.useQuery(
      {
        eventoId: event?.id ?? "",
      },
      {
        enabled: !!event?.id,
      },
    );

  const visibleColumnPage = React.useMemo(() => {
    return getVisibleColumnPage({
      type: event?.type as ENUM_EVENT_TYPE,
      page: "family",
      fallback: "inscritos",
    });
  }, [event]);

  if (isLoading) {
    return (
      <ContainerSpace className="relative mt-4">
        <Heading
          className="sm:hidden"
          title="Classificação de Família"
          icon={Flag}
          subtitle={"Participantes - Primeira Vez"}
        />

        <ChartSkeleton />
      </ContainerSpace>
    );
  }

  if (!isAdmin(membership)) {
    return <Unauthorized />;
  }

  return (
    <ContainerSpace>
      <Heading
        className="sm:hidden"
        title="Classificação de Família"
        icon={Flag}
        subtitle={"Participantes - Primeira Vez"}
      />

      {isPendingChart ? (
        <ChartSkeleton />
      ) : (
        <ChartFamily data={dataChartFamily} />
      )}

      {!result ? (
        <DataTableSkeleton columnCount={6} rowCount={8} />
      ) : (
        <DataTable
          {...result}
          columns={allColumns}
          filters={filters}
          visibleColumnPage={visibleColumnPage}
          startSortingBy={[{ id: "familia", desc: false }]}
          columnsHiding={["index", "cpf", "spouseCPF"]}
          showDownloadSimplifyBtn={false}
        />
      )}
    </ContainerSpace>
  );
}
