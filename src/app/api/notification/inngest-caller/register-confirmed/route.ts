import { inngest } from "@/inngest/client";
import { EVENTS_NAME } from "@/inngest/events";
import type { Evento, Inscricao } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

export type NotificationPayload = {
  event: Pick<
    Evento,
    | "id"
    | "type"
    | "pista"
    | "topNumero"
    | "linkWhatsappGrupoParticipante"
    | "linkWhatsappGrupoServir"
    | "dataInicio"
  >;
  register: Pick<
    Inscricao,
    "id" | "tipoInscricao" | "celular" | "nome" | "flags"
  >;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NotificationPayload;
    const { event, register } = body;

    if (!event || !register) {
      return NextResponse.json({
        status: 400,
        message: "Event or Register is missing",
      });
    }

    const response = await inngest.send({
      name: EVENTS_NAME.NOTIFICATION_USER_REGISTER_CONFIRMED,
      data: {
        inscricao: {
          id: register?.id,
          nome: register?.nome,
          celular: register?.celular,
          tipoInscricao: register?.tipoInscricao,
          flags: register?.flags,
        },
        evento: {
          type: event.type,
          id: event?.id,
          topNumero: event?.topNumero,
          pista: event?.pista,
          linkWhatsappGrupoParticipante: event?.linkWhatsappGrupoParticipante,
          linkWhatsappGrupoServir: event?.linkWhatsappGrupoServir,
          dataInicio: event.dataInicio,
        },
      },
    });

    return NextResponse.json({ message: "Event sent!", data: response.ids });
  } catch (error) {
    console.log({ error });
    return NextResponse.json({ message: error });
  }
}
