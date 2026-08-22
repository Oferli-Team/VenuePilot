"use client";

import { CardsStats } from "@/components/cards-stats";
import { DataTable } from "@/components/data-table-general";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Heading } from "@/components/ui/heading";
import { useFindEvent } from "@/lib/hooks/event";
import { allColumns } from "@/lib/table/columns";
import { type ManadaPagesParams } from "@/lib/types";
import { api } from "@/trpc/react";
import { Heart, HeartPulse, Stethoscope } from "lucide-react";
import { DataSidebar } from "./data-sidebar";
import { ContainerSpace } from "@/components/ui/container";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isHakuna } from "@/lib/utils/hasRole";
import { Unauthorized } from "@/components/unauthorized";

export default function HakunaPage({
  params,
  searchParams,
}: ManadaPagesParams) {
  const { search, page, max, ...filters } = searchParams;
  const { event } = useFindEvent();
  const { membership } = getCurrentMembership();

  const { data: healthStatsData } = api.inscricao.getHealthStats.useQuery(
    {
      eventoId: event?.id ?? "",
    },
    { enabled: !!event?.id },
  );

  const { data, isPending } =
    api.inscricao.getAllRegistersWithPagination.useQuery(
      {
        eventoId: event?.id ?? "",
        tipoInscricao: "PARTICIPANTE",
        status: "CONFIRMADA",
        search,
        filters,
        page: page ? Number(page) : 1,
        pageSize: max ? Number(max) : undefined,
      },
      { enabled: !!event?.id, placeholderData: (prevData) => prevData },
    );

  const cardsStats = {
    ...healthStatsData,
    primaryLabel: "Classificação Saúde realizado",
    primaryIcon: <HeartPulse />,
    secondLabel: "Classificação Saúde pendente",
    secondIcon: <Heart />,
  };

  if (!isHakuna(membership)) {
    return <Unauthorized />;
  }

  return (
    <ContainerSpace>
      <Heading
        className="sm:hidden"
        title="Hakuna"
        icon={Stethoscope}
        subtitle="Classificação de saúde dos participantes"
      />

      <CardsStats {...cardsStats} />

      {isPending ? (
        <DataTableSkeleton columnCount={6} rowCount={10} />
      ) : (
        <DataTable
          {...data}
          filters={filters}
          columns={allColumns}
          visibleColumnPage="hakuna"
          sidebar={<DataSidebar />}
          showDownloadSimplifyBtn
          startSortingBy={[
            {
              id: "familia",
              desc: false,
            },
          ]}
        />
      )}
    </ContainerSpace>
  );
}
