import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { input: string[] } },
) {
  try {
    const { input } = params;
    const [eventoId, quantityFamily] = input;

    if (!eventoId || !quantityFamily) {
      return NextResponse.json({
        status: 400,
        message: "Evento ID e a quantidade de família",
      });
    }

    const inscricoesToUpdateWithFamily =
      await api.inscricao.getInscricoesToClassificateFamily({
        eventoId,
        quantityFamily: Number(quantityFamily),
      });

    return NextResponse.json({
      status: 200,
      data: inscricoesToUpdateWithFamily,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
}
