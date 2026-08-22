import { type Evento } from "@prisma/client";

export const calcValorTop = (
  isCertificado: boolean,
  eventRegister: Evento | null,
) => {
  if (!eventRegister) {
    throw new Error("O evento não está disponível no contexto.");
  }

  return isCertificado
    ? eventRegister.valorParaLgndCertificados
    : eventRegister.valorParaObterCertificacao;
};
