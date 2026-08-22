import { parse, format } from "date-fns";

export function convertDateToDDMMYYYY(dateStr: string): string {
  // Analisa a data no formato yyyy-MM-dd
  const parsedDate = parse(dateStr, "yyyy-MM-dd", new Date());

  // Formata a data para o formato dd/MM/yyyy
  return format(parsedDate, "dd/MM/yyyy");
}
