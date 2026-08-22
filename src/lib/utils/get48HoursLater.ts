
import { addDays, format } from "date-fns";

export function get48HoursLater() {
  const now = new Date();
  const later = addDays(now, 2); // Adiciona 2 dias
  return format(later, "yyyy-MM-dd");
}