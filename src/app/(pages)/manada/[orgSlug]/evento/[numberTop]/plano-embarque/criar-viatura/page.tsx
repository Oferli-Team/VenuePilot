"use client";

import { columns } from "../columns";
import { SetVehicle } from "@/components/boarding-plan/set-vehicle";
import { DataTable } from "@/components/ui/data-table";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { useFindEvent } from "@/lib/hooks/event";
import { api } from "@/trpc/react";

export default function BoardingPlanPage() {
  const { event } = useFindEvent();

  const { data, isPending } = api.vehicle.getAll.useQuery(
    {
      eventId: event?.id,
    },
    { enabled: !!event?.id },
  );

  return (
    <>
      <SetVehicle />

      <div className="rounded-md border border-input bg-card p-4 shadow-md">
        {isPending ? (
          <DataTableSkeleton rowCount={10} columnCount={6} />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            search={{
              placeholder: "Busque pelo nome da viatura",
              field: "name",
            }}
          />
        )}
      </div>
    </>
  );
}
