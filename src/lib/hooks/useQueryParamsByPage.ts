import { useInscricaoDetail } from "@/components/inscricao-detail/useInscricaoDetailStore";
import { type VISIBLE_COLUMNS } from "../constants";
import { useFilterParamsStore } from "../store/FiltersParamsStore";
import { useSearchParams } from "next/navigation";
import { useEventStore } from "../store/EventStore";

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

type useQueryParamsByPageReturn = {
  params: ParamsQuery;
};

export const useQueryParamsByPage = (): useQueryParamsByPageReturn => {
  const searchParams = useSearchParams();
  const { event } = useEventStore();
  const { page } = useInscricaoDetail();
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
    inscritosRem: participants,
    familia: participantsConfirmed,
    familiaRem: participantsConfirmed,
    cartas: participantsConfirmed,
    bone: participantsConfirmedAndChecked,
    boneRem: participantsConfirmedAndChecked,
    ladies: participantsConfirmed,
    checkinParticipantes: participantsConfirmed,
    checkinParticipantesRem: participantsConfirmed,
    hakuna: participantsConfirmed,
    lgndServir: legends,
    lgndServirRem: legends,
    checkinLgnd: legendsConfirmed,
    checkinLgndRem: legendsConfirmed,
  };

  const { search, page: _page, max, ...filters } = fieldFilters;

  const commonParamsQuery = {
    eventoId: event?.id ?? "",
    search: searchParams.get("search") ?? undefined,
    filters,
  };

  const paramsQuery: ParamsQuery = {
    ...commonParamsQuery,
    ...paramsQueryByPage[page], // add the specific params of the page
  };

  return { params: paramsQuery };
};
