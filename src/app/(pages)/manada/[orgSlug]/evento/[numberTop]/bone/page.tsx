"use client";

import { Heading } from "@/components/ui/heading";
import { allColumns } from "@/lib/table/columns";
import { type ManadaPagesParams } from "@/lib/types";
import { api } from "@/trpc/react";
import { GiBilledCap } from "react-icons/gi";
import { CardsStats } from "@/components/cards-stats";
import { DataTable } from "@/components/data-table-general";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { useFindEvent } from "@/lib/hooks/event";
import { Square, SquareCheck } from "lucide-react";
import { ContainerSpace } from "@/components/ui/container";
import { useVisibleColumnPage } from "@/lib/hooks/visibleColumnPage";

export default function BonePage({ params, searchParams }: ManadaPagesParams) {
  const { search, page, max, ...filters } = searchParams;

  const { event } = useFindEvent();
  const { visibleColumnPage } = useVisibleColumnPage({
    page: "bone",
    fallback: "inscritos",
  });

  const { data: legendNumberEdited } =
    api.inscricao.getLegendaryNumberEditedStats.useQuery(
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
        checkin: event?.type === "REM" ? undefined : true,
        page: page ? Number(page) : 1,
        pageSize: max ? Number(max) : undefined,
        search,
        filters,
      },
      { enabled: !!event?.id, placeholderData: (prevData) => prevData },
    );

  const cardsStats = {
    ...legendNumberEdited,
    primaryLabel: "Número LGND Atualizado",
    primaryIcon: <SquareCheck />,
    secondLabel: "Número LGND Pendente",
    secondIcon: <Square />,
  };

  return (
    <ContainerSpace>
      <Heading className="sm:hidden" title="Boné" icon={GiBilledCap} />
      <CardsStats {...cardsStats} />

      {isPending ? (
        <DataTableSkeleton columnCount={6} rowCount={10} />
      ) : (
        <DataTable
          {...data}
          filters={filters}
          columns={allColumns}
          visibleColumnPage={visibleColumnPage}
          showDownloadSimplifyBtn={false}
          startSortingBy={[
            {
              id: "familia",
              desc: false,
            },
          ]}
          columnsHiding={["cpf", "spouseCPF"]}
        />
      )}
    </ContainerSpace>
  );
}
