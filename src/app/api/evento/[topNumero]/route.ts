import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { topNumero: string } },
) {
  try {
    const { topNumero } = params;

    if (!topNumero) {
      return NextResponse.json({
        status: 400,
        message: "Número do TOP é obrigatório",
      });
    }

    const evento = await api.evento.getEventPostedByNumberTop({
      topNumber: Number(topNumero),
    });

    return NextResponse.json({
      status: 200,
      data: evento,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
}
