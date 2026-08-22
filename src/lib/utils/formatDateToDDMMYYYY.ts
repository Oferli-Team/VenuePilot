import { format } from "date-fns";
import { parseDate } from "./parseDate";

export const formatDateToDDMMYYYY = (date: null | Date): string => {
  if (date !== null) {
    const parsedDate = parseDate(date);
    return format(parsedDate, "dd/MM/yyyy");
  }
  return "";
};

export const formatDateDMY = (date: Date | undefined): string => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
};
