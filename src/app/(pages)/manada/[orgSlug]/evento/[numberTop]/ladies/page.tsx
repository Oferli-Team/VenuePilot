import { allColumns } from "@/lib/table/columns";
import { api } from "@/trpc/server";
import { DataTable } from "@/components/data-table-general";
import { redirect } from "next/navigation";
import { getEvent } from "@/lib/utils/getEvent";
import { type ManadaPagesParams } from "@/lib/types";
import { Heading } from "@/components/ui/heading";
import { Flower } from "lucide-react";
import { ContainerSpace } from "@/components/ui/container";

export default async function LadiesPage({
  params,
  searchParams,
}: ManadaPagesParams) {
  const { page, search, max, ...filters } = searchParams;
  const event = await getEvent({ params });

  if (!event) {
    redirect("/manada");
  }

  const data = await api.inscricao.getAllRegistersWithPagination({
    eventoId: event.id,
    tipoInscricao: "PARTICIPANTE",
    status: "CONFIRMADA",
    page: page ? Number(page) : 1,
    pageSize: max ? Number(max) : undefined,
    search,
    filters,
  });

  return (
    <ContainerSpace>
      <Heading
        title="Ladies"
        icon={Flower}
        subtitle={"Inscritos e seus contatos de emergência"}
      />
      <DataTable
        {...data}
        columns={allColumns}
        filters={filters}
        visibleColumnPage="ladies"
        startSortingBy={[{ id: "familia", desc: false }]}
        showDownloadSimplifyBtn={false}
      />
    </ContainerSpace>
  );
}
