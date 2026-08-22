import { type Inscricao } from "@prisma/client";

export const checkVagasParticipante = (
  allParticipantes: Inscricao[],
  vagasOfertadas: number,
) => {
  if (allParticipantes.length >= vagasOfertadas) {
    return true;
  }
  return false;
};
