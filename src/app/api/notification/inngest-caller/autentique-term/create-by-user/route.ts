import { inngest } from "@/inngest/client";
import { EVENTS_NAME } from "@/inngest/events";
import type { Evento, Inscricao } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

type Event = Pick<Evento, "id" | "pista" | "topNumero" | "dataInicio">;
type Register = Pick<
  Inscricao,
  | "id"
  | "nome"
  | "cpf"
  | "tipoInscricao"
  | "estadoCivil"
  | "celular"
  | "email"
  | "dataNascimento"
  | "nomeContatoEmergencia"
  | "celularContatoEmergencia"
  | "rua"
  | "ruaNumero"
  | "bairro"
  | "cidade"
  | "cep"
>;

export type CreateDisclaimerByUserType = Register & { evento: Event };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateDisclaimerByUserType;
    const register = body;

    if (!register) {
      return NextResponse.json({
        status: 400,
        message: "Registers is missing",
      });
    }

    const { ids } = await inngest.send({
      name: EVENTS_NAME.CREATE_DISCLAIMER_BY_USER,
      data: body,
    });
    console.log({ ids });
    if (ids.length > 0) {
      return NextResponse.json({ message: "Event sent!", create: true });
    }

    return NextResponse.json({
      message: "Event not sent",
      create: false,
    });
  } catch (error) {
    console.log({ error });
    return NextResponse.json({ message: error, create: false });
  }
}
