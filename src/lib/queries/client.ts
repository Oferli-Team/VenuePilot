import type { CreateDisclaimersByInngest } from "@/app/api/notification/inngest-caller/autentique-term/create-by-inngest/route";
import type { CreateDisclaimerByUserType } from "@/app/api/notification/inngest-caller/autentique-term/create-by-user/route";
import { type NotificationPayload } from "@/app/api/notification/inngest-caller/register-confirmed/route";
import { type Evento, type Inscricao, type LinkSecreto } from "@prisma/client";

export const getInscricaoByCPF = async (
  cpf: string,
  eventoId: string,
): Promise<(Inscricao & { evento: Evento }) | undefined> => {
  try {
    const response = await fetch(`/api/inscricao/${eventoId}/${cpf}`);
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllInscricaoByCPF = async (
  cpf: string,
): Promise<
  {
    register: Pick<
      Inscricao,
      | "id"
      | "nome"
      | "cpf"
      | "status"
      | "tipoInscricao"
      | "checkinCode"
      | "lgnd_funcao"
      | "spouseName"
      | "spouseCPF"
    >;
    event: Pick<
      Evento,
      | "topNumero"
      | "banner"
      | "periodo"
      | "linkWhatsappGrupoParticipante"
      | "linkWhatsappGrupoServir"
      | "local"
      | "localSaida"
      | "pista"
      | "type"
    >;
  }[]
> => {
  try {
    const response = await fetch(`/api/inscricoes/cpf/${cpf}`);
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getLinkSecreto = async (
  link: string,
  eventoId: string,
): Promise<LinkSecreto | undefined> => {
  try {
    const response = await fetch(`/api/linkSecreto/${eventoId}/${link}`);
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getEventPostedByNumberTop = async (
  topNumero: string,
): Promise<Evento | undefined> => {
  try {
    const response = await fetch(`/api/evento/${topNumero}`);
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllEvents = async (): Promise<Evento[] | undefined> => {
  try {
    const response = await fetch(`/api/evento`);
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getInscricoesToClassificateFamily = async (
  eventoId: string,
  quantityFamily: number,
): Promise<Inscricao[] | undefined> => {
  try {
    const response = await fetch(
      `/api/inscricoes/family-classification/${eventoId}/${quantityFamily.toString()}`,
    );
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const sendInngestEventConfirmedRegisterNotification = async ({
  event,
  register,
}: NotificationPayload): Promise<void> => {
  try {
    const payload = {
      event,
      register,
    };
    const response = await fetch(
      `/api/notification/inngest-caller/register-confirmed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    await response.json();
  } catch (error) {
    console.log(error);
  }
};

export const sendInngestEventCreateBatchesDisclaimer = async (
  registers: CreateDisclaimersByInngest,
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/notification/inngest-caller/autentique-term/create-by-inngest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registers: registers }),
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("Erro na chamada do inngest", error);
  }
};

export const createDisclaimerByUser = async (
  register: CreateDisclaimerByUserType,
): Promise<{ message: string; create: boolean }> => {
  try {
    const response = await fetch(
      `/api/notification/inngest-caller/autentique-term/create-by-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(register),
      },
    );
    const result = (await response.json()) as {
      message: string;
      create: boolean;
    };
    return result;
  } catch (error) {
    console.log("Erro ao criar", error);
    return { message: `${error}`, create: false };
  }
};

export type BoardingParticipantsData = Record<string, { family: string }[]>;

export const createBoardingPlanParticipants = async ({
  eventId,
  boarding,
}: {
  eventId: string;
  boarding: BoardingParticipantsData;
}) => {
  try {
    const payload = {
      eventId,
      boarding,
    };
    const response = await fetch(
      `/api/notification/inngest-caller/boarding-plan/participants`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    await response.json();
  } catch (error) {
    console.log(error);
  }
};

export type BoardingLegendaryData = Record<string, { id: string }[]>;

export const createBoardingPlanLegendary = async ({
  eventId,
  boarding,
}: {
  eventId: string;
  boarding: BoardingParticipantsData;
}) => {
  try {
    const payload = {
      eventId,
      boarding,
    };
    const response = await fetch(
      `/api/notification/inngest-caller/boarding-plan/legendary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    await response.json();
  } catch (error) {
    console.log(error);
  }
};
