import { inngest } from "@/inngest/client";
import { EVENTS_NAME } from "@/inngest/events";
import { NextResponse } from "next/server";
import { ENUM_EVENT_TYPE } from "../enum";

type DataNotification = {
  register: {
    id: string;
    nome: string;
    cpf: string;
    spouseName?: string;
    spousePhoneNumber?: string;
    celular: string;
    tipoInscricao: string;
    flags: string[];
    participants?: { name: string; cpf?: string | null; type: string }[];
    identifier?: string;
  };
  event: {
    type: ENUM_EVENT_TYPE;
    titulo?: string;
    id: string;
    topNumero: number;
    pista: string;
    linkWhatsappGrupoParticipante: string | null;
    linkWhatsappGrupoServir: string | null;
    dataInicio: Date;
    dataFim: Date;
  };
};

type EventNotificationHandlerByType = {
  [key in ENUM_EVENT_TYPE]: EVENTS_NAME | string;
};

export const eventNotificationHandlerByType: EventNotificationHandlerByType = {
  [ENUM_EVENT_TYPE.LEGENDARIOS]:
    EVENTS_NAME.NOTIFICATION_USER_REGISTER_CONFIRMED,
  [ENUM_EVENT_TYPE.REM]: EVENTS_NAME.NOTIFICATION_USER_REGISTER_CONFIRMED,
  [ENUM_EVENT_TYPE.LEGADO_FILHO]: "",
  [ENUM_EVENT_TYPE.LEGADO_FILHA]: "",
  [ENUM_EVENT_TYPE.MANADADAY]:
    EVENTS_NAME.NOTIFICATION_USER_REGISTER_CONFIRMED_MANADADAY,
};

export const sendNotificationWhenRegisterConfirmedByInngest = async ({
  register,
  event,
}: DataNotification) => {
  const dateNow = new Date();
  const eventDate = event?.dataFim ? new Date(event.dataFim) : new Date();

  if (dateNow > eventDate) {
    console.log("Event already happened, not sending notification");
    return NextResponse.json(
      {
        message: "Event already happened, not sending notification",
      },
      { status: 200 },
    );
  }

  const data = {
    inscricao: {
      id: register?.id,
      nome: register?.nome,
      cpf: register.cpf,
      spouseName: register?.spouseName,
      spousePhoneNumber: register?.spousePhoneNumber,
      celular: register?.celular,
      tipoInscricao: register?.tipoInscricao,
      flags: register?.flags,
      identifier: register.identifier,
      participants: register.participants,
    },
    evento: {
      id: event?.id,
      type: event.type,
      titulo: event?.titulo,
      topNumero: event?.topNumero,
      pista: event?.pista,
      linkWhatsappGrupoParticipante: event?.linkWhatsappGrupoParticipante,
      linkWhatsappGrupoServir: event?.linkWhatsappGrupoServir,
      dataInicio: event?.dataInicio,
    },
  };

  await inngest.send({
    name: eventNotificationHandlerByType[event.type],
    data,
  });

  console.log("notification sent to Inngest");
};
