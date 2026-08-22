import { format, parse } from "date-fns";

export const formatDateToYYYYMMDD = (bornDate: string): string => {
  if (typeof bornDate !== "string") {
    console.error('data_nascimento deve ser uma string')
    return ''
  }
  const date = parse(bornDate, "dd/MM/yyyy", new Date());
  const formattedDate = format(date, "yyyy-MM-dd");
  return formattedDate;
}