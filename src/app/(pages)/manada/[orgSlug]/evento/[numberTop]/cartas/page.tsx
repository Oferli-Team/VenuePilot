"use client";

import { LettersStats } from "@/components/cartas/letters-stats";
import { DataTable } from "@/components/data-table-general";
import { ContainerSpace } from "@/components/ui/container";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { useFindEvent } from "@/lib/hooks/event";
import { allColumns } from "@/lib/table/columns";
import { type ManadaPagesParams } from "@/lib/types";
import { api } from "@/trpc/react";
import { Mail } from "lucide-react";

export default function InscritosPage({
  params,
  searchParams,
}: ManadaPagesParams) {
  const { page, max, search, ...filters } = searchParams;
  const { event, isLoading } = useFindEvent();

  const { data: lettersStats } = api.inscricao.getLettersStats.useQuery(
    {
      eventoId: event?.id ?? "",
    },
    { enabled: !!event?.id },
  );

  const { data } = api.inscricao.getAllRegistersWithPagination.useQuery(
    {
      status: "CONFIRMADA",
      tipoInscricao: "PARTICIPANTE",
      eventoId: event?.id ?? "",
      page: page ? Number(page) : 1,
      pageSize: max ? Number(max) : undefined,
      search,
      filters,
    },
    { enabled: !!event?.id, placeholderData: (prevData) => prevData },
  );

  if (isLoading) {
    return <Spinner size={40} className="mt-20 self-center" />;
  }

  return (
    <ContainerSpace className="relative mt-4">
      <Heading className="sm:hidden" title="Cartas" icon={Mail} />
      <LettersStats {...lettersStats} />

      {!data ? (
        <DataTableSkeleton columnCount={6} rowCount={8} />
      ) : (
        <DataTable
          {...data}
          columns={allColumns}
          visibleColumnPage="cartas"
          filters={filters}
          showDownloadSimplifyBtn={false}
          columnsHiding={["cpf"]}
        />
      )}
    </ContainerSpace>
  );
}
