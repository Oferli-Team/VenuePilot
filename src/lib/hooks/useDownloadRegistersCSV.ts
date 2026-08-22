import * as XLSX from "xlsx";

import { useInscricaoDetail } from "@/components/inscricao-detail/useInscricaoDetailStore";
import { usePageTitleStore } from "@/components/layout/manada/page-title-store";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { formatDate } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { eventTypeMap, type VISIBLE_COLUMNS } from "../constants";
import { useEventStore } from "../store/EventStore";
import { useFilterParamsStore } from "../store/FiltersParamsStore";
import { type ENUM_EVENT_TYPE } from "../enum";

type ParamsQuery = {
  eventoId: string;
  tipoInscricao: "PARTICIPANTE" | "SERVIR";
  status?: string;
  checkin?: boolean;
  filters?: Record<string, any>;
  fields?: string[];
};

type ParamsQueryOptional = Omit<ParamsQuery, "eventoId">;
type ParamsQueryByPage = Record<
  keyof typeof VISIBLE_COLUMNS,
  ParamsQueryOptional
>;

type downloadRegisterCSVReturn = {
  handleExport: (fields: string[]) => Promise<void>;
  loading: boolean;
};

export const useDownloadRegisterCSV = (): downloadRegisterCSVReturn => {
  const searchParams = useSearchParams();
  const { event } = useEventStore();
  const { page } = useInscricaoDetail();
  const { pageTitle } = usePageTitleStore();
  const { fieldFilters } = useFilterParamsStore();

  const participants = {
    tipoInscricao: "PARTICIPANTE" as ParamsQuery["tipoInscricao"],
  };

  const legends = {
    tipoInscricao: "SERVIR" as ParamsQuery["tipoInscricao"],
  };

  const status = "CONFIRMADA";

  const participantsConfirmed = {
    ...participants,
    status,
  };

  const participantsConfirmedAndChecked = {
    ...participants,
    status,
    checkin: true,
  };

  const legendsConfirmed = {
    ...legends,
    status: "CONFIRMADA",
  };

  const paramsQueryByPage: ParamsQueryByPage = {
    inscritos: participants,
    familia: participantsConfirmed,
    cartas: participantsConfirmed,
    bone: participantsConfirmedAndChecked,
    ladies: participantsConfirmed,
    checkinParticipantes: participantsConfirmed,
    hakuna: participantsConfirmed,
    lgndServir: legends,
    checkinLgnd: legendsConfirmed,
    inscritosRem: participants,
    lgndServirRem: legends,
    checkinParticipantesRem: participantsConfirmed,
    checkinLgndRem: legendsConfirmed,
    familiaRem: participantsConfirmed,
    boneRem: participantsConfirmedAndChecked,
  };

  const { search, page: _page, max, ...filters } = fieldFilters;

  const { mutateAsync: downloadRegisters, isPending: isLoading } =
    api.inscricao.downloadRegistersCSV.useMutation();

  const handleExport = async (fields: string[]) => {
    const commonParamsQuery = {
      eventoId: event?.id ?? "",
      search: searchParams.get("search") ?? undefined,
      filters,
      fields,
    };

    const paramsQuery: ParamsQuery = {
      ...commonParamsQuery,
      ...paramsQueryByPage[page], // add the specific params of the page
    };

    try {
      const data = await downloadRegisters(paramsQuery);

      if (!data.headers) {
        toast({
          title: "Nenhum dado encontrado",
          description: "Não há registros para ser exportado.",
        });
        return;
      }

      const pageName = pageTitle.replace(" | ", "_").replaceAll(" ", "_");
      const timestamp = new Date();
      const formatDataTime = formatDate(timestamp, "dd/MM/yyyy - HH:mm");
      const filename = `${eventTypeMap[event?.type as ENUM_EVENT_TYPE]}#${event?.topNumero} - ${pageName} | ${formatDataTime}`;

      // Criar os dados formatados com base nas chaves dos headers
      const formattedData = data.data.map((item) => {
        if (!data.headers) return {};

        return data.headers.reduce(
          (acc, header) => {
            const value = item[header.key] ?? "";
            acc[header.label] = value;
            return acc;
          },
          {} as Record<string, any>,
        );
      });

      const exportToExcel = (data: any[], fileName: string) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dados");

        XLSX.writeFile(wb, `${fileName}.xlsx`);
      };

      exportToExcel(formattedData, filename);
    } catch (error) {
      toast({
        title: "Ops, deu erro",
        description: "Algo deu errado na exportação dos dados, tente novamente",
        variant: "destructive",
      });
    }
  };

  return { handleExport, loading: isLoading };
};
