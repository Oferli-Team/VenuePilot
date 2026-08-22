import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const eventos = await api.evento.getAllEvento();

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
