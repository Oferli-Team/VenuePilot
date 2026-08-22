"use client";

import React from "react";
import { allColumns } from "@/lib/table/columns";
import { api } from "@/trpc/react";
import { type ManadaPagesParams } from "@/lib/types";
import { DataTable } from "@/components/data-table-general";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Square, SquareCheck } from "lucide-react";
import { CardsStats } from "@/components/cards-stats";
import { useFindEvent } from "@/lib/hooks/event";
import { type ENUM_EVENT_TYPE } from "@/lib/enum";
import { getVisibleColumnPage } from "@/lib/utils/getVisibleColumnPage";
import { ContainerQRcode } from "@/components/qr-code/container-qrcode";
import { CheckinDropdownActions } from "@/components/checkin/checkin-dropdown-actions";
import { GridTwoColumns } from "@/components/grid-two-columns";

export default function CheckinLgndPage({
  params,
  searchParams,
}: ManadaPagesParams) {
  const { page, max, search, ...filters } = searchParams;

  const { event } = useFindEvent();

  const { data: checkInStats } = api.inscricao.getCheckInStats.useQuery({
    eventoId: event?.id ?? "",
    tipoInscricao: "SERVIR",
  });

  const { data: result } = api.inscricao.getAllRegistersWithPagination.useQuery(
    {
      eventoId: event?.id ?? "",
      status: "CONFIRMADA",
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

  const cardsStats = {
    ...checkInStats,
    primaryLabel: "Check-in realizado",
    primaryIcon: <SquareCheck />,
    secondLabel: "Check-in pendente",
    secondIcon: <Square />,
  };

  const visibleColumnPage = React.useMemo(() => {
    return getVisibleColumnPage({
      type: event?.type as ENUM_EVENT_TYPE,
      page: "checkinServe",
      fallback: "checkinLgnd",
    });
  }, [event]);

  return (
    <>
      <GridTwoColumns className="md:grid-cols-4">
        <CardsStats className="md:col-span-3" {...cardsStats} />
        <CheckinDropdownActions registerType="SERVIR" />
      </GridTwoColumns>

      <ContainerQRcode registerType="SERVIR" />

      {!result ? (
        <DataTableSkeleton columnCount={6} rowCount={10} />
      ) : (
        <DataTable
          {...result}
          filters={filters}
          columns={allColumns}
          columnsHiding={["lgndCertificado", "nrLgnd", "cpf", "spouseCPF"]}
          showDownloadSimplifyBtn
          visibleColumnPage={visibleColumnPage}
        />
      )}
    </>
  );
}
