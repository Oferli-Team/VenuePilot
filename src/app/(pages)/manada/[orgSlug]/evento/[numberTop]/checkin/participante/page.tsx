"use client";

import React from "react";
import { CardsStats } from "@/components/cards-stats";
import { CheckinDropdownActions } from "@/components/checkin/checkin-dropdown-actions";
import { DataTable } from "@/components/data-table-general";
import { GridTwoColumns } from "@/components/grid-two-columns";
import { ContainerQRcode } from "@/components/qr-code/container-qrcode";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { useFindEvent } from "@/lib/hooks/event";
import { allColumns } from "@/lib/table/columns";
import { type ManadaPagesParams } from "@/lib/types";
import { getVisibleColumnPage } from "@/lib/utils/getVisibleColumnPage";
import { api } from "@/trpc/react";
import { Square, SquareCheck } from "lucide-react";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";

export default function CheckinParticipantesPage({
  params,
  searchParams,
}: ManadaPagesParams) {
  const { page, max, search, ...filters } = searchParams;

  const { event } = useFindEvent();

  const { data: checkInStats } = api.inscricao.getCheckInStats.useQuery(
    {
      eventoId: event?.id ?? "",
      tipoInscricao: "PARTICIPANTE",
    },
    { enabled: !!event?.id },
  );

  const { data: result, isLoading } =
    api.inscricao.getAllRegistersWithPagination.useQuery(
      {
        eventoId: event?.id ?? "",
        status: "CONFIRMADA",
        tipoInscricao: "PARTICIPANTE",
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
      page: "checkinParticipate",
      fallback: "checkinParticipantes",
    });
  }, [event]);

  return (
    <>
      <GridTwoColumns className="md:grid-cols-4">
        <CardsStats className="md:col-span-3" {...cardsStats} />
        <CheckinDropdownActions registerType="PARTICIPANTE" />
      </GridTwoColumns>
      <ContainerQRcode registerType="PARTICIPANTE" />

      {isLoading && <DataTableSkeleton rowCount={6} columnCount={6} />}

      {!isLoading && result?.data && (
        <DataTable
          {...result}
          filters={filters}
          columns={allColumns}
          columnsHiding={[
            "cpf",
            "spouseCPF",
            "dataNascimento",
            "spouseBirthDate",
          ]}
          showDownloadSimplifyBtn
          visibleColumnPage={visibleColumnPage}
        />
      )}
    </>
  );
}
