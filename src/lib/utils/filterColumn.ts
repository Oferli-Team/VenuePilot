import { RegisterWithEvent } from "@/app/(pages)/manada/[orgSlug]/evento/[numberTop]/checkin/manada-day/column";
import { type Inscricao } from "@prisma/client";
import { type FilterFn } from "@tanstack/react-table";
import { normalizeValue } from "./normalizeValue";

export const multiColumnFilter: FilterFn<Inscricao> = (
  row,
  columnId,
  filterValue,
) => {
  const value = filterValue as string;
  const search = normalizeValue(value);

  const nome = row.getValue<string>("nome")?.toLowerCase() || "";
  const cpf = row.getValue<string>("cpf")?.toLowerCase() || "";
  const email = row.getValue<string>("email")?.toLowerCase() || "";
  const status = row.getValue<string>("status")?.toLowerCase() || "";
  const nrLgnd = row.getValue<string>("nrLgnd")?.toLowerCase() || "";
  const nrRem = row.getValue<string>("nrRem")?.toLowerCase() || "";

  return (
    nome.includes(search) ||
    cpf.includes(search) ||
    email.includes(search) ||
    status.includes(search) ||
    nrLgnd.includes(search) ||
    nrRem.includes(search)
  );
};

export const filterFn: FilterFn<Inscricao> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
  if (filterValue === "Nenhum") {
    return cellValue === null;
  }
  return cellValue?.toString() === filterValue;
};

export const multiColumnFilterManada: FilterFn<RegisterWithEvent> = (
  row,
  columnId,
  filterValue,
) => {
  const value = filterValue as string;
  const search = normalizeValue(value);
  const name = row.getValue<string>("name")?.toLowerCase() || "";
  const cpf = row.getValue<string>("cpf")?.toLowerCase() || "";
  const status = row.getValue<string>("status")?.toLowerCase() || "";
  const identifier = row.getValue<string>("identifier")?.toLowerCase() || "";

  // Busca participantes
  const participants = row.original.participants || [];
  const hasMatchingParticipant = participants.some(
    (participant) =>
      normalizeValue(participant.name).toLowerCase().includes(search) ||
      (participant.checkinCode &&
        normalizeValue(participant.checkinCode).toLowerCase().includes(search)),
  );

  const filtered =
    name.includes(search) ||
    cpf.includes(search) ||
    status.includes(search) ||
    identifier.includes(search) ||
    hasMatchingParticipant;

  return filtered;
};
