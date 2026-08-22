import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { input: string[] } },
) {
  try {
    const { input } = params;

    const [eventoId, cpf] = input;

    if (!cpf || !eventoId) {
      return NextResponse.json({
        status: 400,
        message: "CPF e eventoId são obrigatório",
      });
    }

    const inscricao = await api.inscricao.getInscricaoByCPF({
      cpf,
      eventoId,
    });

    return NextResponse.json({
      status: 200,
      data: inscricao,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
}
