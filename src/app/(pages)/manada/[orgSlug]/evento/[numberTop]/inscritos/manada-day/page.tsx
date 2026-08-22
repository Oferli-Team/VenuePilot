"use client";

import { type ManadaPagesParams } from "@/lib/types";
import React from "react";
import { DataTable as DataTableUI } from "@/components/ui/data-table";
import { api } from "@/trpc/react";
import { useFindEvent } from "@/lib/hooks/event";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { columnsRegisterManadaDay } from "@/lib/table/columns-manada-day";

export default function InscritosPage({
  params,
  searchParams,
}: ManadaPagesParams) {
  const { event } = useFindEvent();

  const { data } = api.manadaDay.getAllManadaDayRegisters.useQuery(
    {
      eventoId: event?.id,
    },
    {
      enabled: !!event && event.type === ENUM_EVENT_TYPE.MANADADAY,
      placeholderData: (prevData) => prevData,
    },
  );

  return (
    <DataTableUI
      columns={columnsRegisterManadaDay}
      data={data ?? []}
      search={{ field: "cpf", placeholder: "Busque por Nome ou CPF" }}
    />
  );
}
