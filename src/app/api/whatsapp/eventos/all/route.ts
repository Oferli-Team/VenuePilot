import { api } from "@/trpc/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data = await api.evento.getAllEvento();

    const isEventStartedAndValid = data.filter((evento) => {
      const now = new Date();
      const eventStartDate = new Date(evento.dataInicio);

      return (
        eventStartDate >= now && evento.openParticipar && evento.openServir
      );
    });

    const eventos = isEventStartedAndValid.map((evento) => ({
      title: `${evento.titulo} - ${evento.topNumero}`,
      description: evento.subtitulo,
      periodo: evento.periodo,
      valorParticipante: evento.valorParticipante,
      valorServirLegendarioNaoCertificado: evento.valorParaObterCertificacao,
      valorServirLegendarioCertificado: evento.valorParaLgndCertificados,
      inscricaoURL: `https://www.inscricoestop.com.br/evento/${evento.topNumero}`,
    }));

    return NextResponse.json({
      status: 200,
      data: eventos,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
}
