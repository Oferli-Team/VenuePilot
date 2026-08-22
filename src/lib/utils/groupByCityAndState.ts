import { type Inscricao } from "@prisma/client";
import { normalizeCityState } from "./normalizeCityState";

export const groupByCityAndState = (participants: Inscricao[]) => {
  const grouped: Record<string, number> = participants.reduce(
    (acc, participant) => {
      const cidade = participant.cidade || "Não informado";
      const estado = participant.estado || "Não informado";
      const key = `${normalizeCityState(cidade)} - ${normalizeCityState(estado)}`;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key]++;
      return acc;
    },
    {},
  );

  const groupedArray = Object.keys(grouped).map((key) => {
    const cidades = {
      cidade: key.split(" - ")[0],
      estado: key.split(" - ")[1],
      quantidade: grouped[key],
    };
    return cidades;
  });

  return groupedArray;
};
