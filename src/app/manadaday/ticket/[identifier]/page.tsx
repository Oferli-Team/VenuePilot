import { TicketSkeleton } from "@/app/_components/ticket/skeleton";
import { Ticket } from "@/app/_components/ticket/ticket";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Container } from "@/app/_components/ui/container";
import { Section } from "@/app/_components/ui/section";
import { api } from "@/trpc/server";
import { ThumbsDown, TicketCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type TicketPage = {
  params: { identifier: string };
};

export default async function ManadaDayTicketPage({
  params: { identifier },
}: TicketPage) {
  const data = await api.manadaDay.getRegisterByIdentifier({
    identifier,
  });

  if (!data) {
    return (
      <Section className="flex h-[80vh] items-center justify-center">
        <Card className="z-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsDown className="size-5 text-primary" />
              Ops!
            </CardTitle>
            <CardDescription>Não encontramos nenhum resultado.</CardDescription>
          </CardHeader>
          <CardContent className="flex w-full flex-col items-center">
            <Button variant="outline" className="w-full">
              <Link href="/">Página inicial</Link>
            </Button>
          </CardContent>
        </Card>
      </Section>
    );
  }

  return (
    <Container className="pb-16">
      <Section className="mt-24 space-y-6">
        <div className="flex items-center gap-1">
          <TicketCheck size={28} />
          <h1 className="font-bold">Ticket</h1>
        </div>
        <Suspense fallback={<TicketSkeleton />}>
          <div className="grid gap-4 pb-8 md:grid-cols-2">
            {data?.participants?.map((participant) => {
              return (
                <Ticket
                  key={participant.id}
                  event={data.event}
                  register={participant}
                />
              );
            })}
          </div>
        </Suspense>
      </Section>
    </Container>
  );
}
