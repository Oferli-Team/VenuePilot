import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { cpf: string } },
) {
  try {
    const { cpf } = params;

    if (!cpf) {
      return NextResponse.json({
        status: 400,
        message: "CPF é obrigatório",
      });
    }

    const data = await api.inscricao.getAllInscricaoByCPF({
      cpf,
    });

    const registers = data.map((register) => ({
      register: {
        nome: register.nome,
        cpf: register.cpf,
        status: register.status,
        tipoInscricao: register.tipoInscricao,
        checkinCode: register.checkinCode,
        lgnd_funcao: register.lgnd_funcao,
        spouseName: register.spouseName,
        spouseCPF: register.spouseCPF,
      },
      event: { ...register.evento },
    }));

    return NextResponse.json({
      status: 200,
      data: registers,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
}
