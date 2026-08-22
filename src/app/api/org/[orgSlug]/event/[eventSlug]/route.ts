import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { orgSlug: string; eventSlug: string } },
) {
  try {
    const { orgSlug, eventSlug } = params;

    if (!orgSlug || !eventSlug) {
      return NextResponse.json({
        status: 400,
        message: "Organization slug and event slug are required",
      });
    }

    const evento = await api.evento.getEventDetails({
      orgSlug,
      eventSlug,
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