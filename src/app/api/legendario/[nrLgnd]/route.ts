import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

interface LegendarioResponse {
  nome: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { nrLgnd: string } },
) {
  try {
    const { nrLgnd } = params;

    if (!nrLgnd) {
      return NextResponse.json({
        status: 400,
        message: "Número Legendário é obrigatório",
      });
    }

    const legendarioName: string | null =
      await api.inscricao.getLegendarioByNumber({
        nrLgnd,
      });

    if (legendarioName) {
      const legendarioData: LegendarioResponse = { nome: legendarioName };

      return NextResponse.json({
        status: 200,
        data: legendarioData,
      });
    }

    return NextResponse.json({
      status: 200,
      data: null,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
}
