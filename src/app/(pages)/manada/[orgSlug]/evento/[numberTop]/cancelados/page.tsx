"use client";

import { api } from "@/trpc/react";
import { useEventStore } from "@/lib/store/EventStore";
import { DataTable } from "@/components/ui/data-table";
import { getCanceladosColumns } from "./columns";
import { Heading } from "@/components/ui/heading";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";

export default function RegistersCanceledPage() {
  const { event } = useEventStore();

  const { data, isPending } = api.dashboard.getAllRegisterCanceled.useQuery(
    {
      eventId: event?.id,
    },
    { enabled: !!event?.id },
  );

  const refundedColumns = data
    ? getCanceladosColumns(data.refunded.registers)
    : [];
  const canceledColumns = data
    ? getCanceladosColumns(data.canceled.registers)
    : [];

  return (
    <div className="space-y-4 pb-6">
      <div className="space-y-4">
        <Heading title="Inscrições Canceladas e Reembolsadas" />
        {isPending && <DataTableSkeleton rowCount={8} columnCount={6} />}

        {data && (
          <DataTable
            columns={refundedColumns}
            data={data.refunded.registers}
            startSortingBy={[{ id: "tipoInscricao", desc: false }]}
            pagination={{ pageSize: 20, pageIndex: 0 }}
            search={{ field: "cpf", placeholder: "Busque inscrição por CPF" }}
          />
        )}
      </div>

      <div className="space-y-4">
        <Heading
          title="Inscrições Canceladas"
          subtitle="Motivos de cancelamento: transferência de titularidade, transferência para outro evento ou outros. São inscrições que não foram reembolsadas"
        />

        {isPending && <DataTableSkeleton rowCount={8} columnCount={6} />}

        {data && (
          <DataTable
            columns={canceledColumns}
            data={data.canceled.registers}
            startSortingBy={[{ id: "tipoInscricao", desc: false }]}
            pagination={{ pageSize: 20, pageIndex: 0 }}
            search={{ field: "cpf", placeholder: "Busque inscrição por CPF" }}
          />
        )}
      </div>
    </div>
  );
}
