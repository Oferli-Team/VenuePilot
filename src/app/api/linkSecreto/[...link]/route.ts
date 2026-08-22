import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { link: string[] } },
) {
  try {
    const { link } = params;

    const [eventoId, linkSecreto] = link;

    if (!linkSecreto || !eventoId) {
      return NextResponse.json({
        status: 400,
        message: "Link e eventoId são obrigatório",
      });
    }

    const data = await api.linkSecreto.getByLink({
      link: linkSecreto,
      eventoId: eventoId,
    });

    return NextResponse.json({
      status: 200,
      data,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
}
