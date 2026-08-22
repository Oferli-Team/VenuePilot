import { parseISO } from "date-fns";

export const parseDate = (date: null | Date): Date => {
  if (typeof date === 'string') {
    return parseISO(date);
  } else if (date instanceof Date) {
    return date;
  } else {
    throw new Error('Formato de data inválido');
  }
};