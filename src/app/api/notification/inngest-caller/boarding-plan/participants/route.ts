import { inngest } from "@/inngest/client";
import { EVENTS_NAME } from "@/inngest/events";
import { type BoardingParticipantsData } from "@/lib/queries/client";
import { type NextRequest, NextResponse } from "next/server";

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

export type BoardingPlanPayload = {
  eventId: string;
  boarding: BoardingParticipantsData;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BoardingPlanPayload;
    const { eventId, boarding } = body;

    if (!eventId || !boarding) {
      return NextResponse.json({
        status: 400,
        message: "Event or Register is missing",
      });
    }

    const result = await inngest.send({
      name: EVENTS_NAME.CREATE_BOARDING_PLAN_PARTICIPANTS,
      data: { eventId, boarding },
    });

    console.log("inngest result", result);

    return NextResponse.json({ message: "Event sent!" });
  } catch (error) {
    console.log({ error });
    return NextResponse.json({ message: error });
  }
}
