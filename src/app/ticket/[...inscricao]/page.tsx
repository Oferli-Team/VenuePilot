import { TicketSkeleton } from "@/components/ticket/skeleton";
import { Ticket } from "@/components/ticket/ticket";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { api } from "@/trpc/server";
import { TicketCheck } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type TicketPage = {
  params: { inscricao: string[] };
};

export const generateMetadata = async ({
  params,
}: TicketPage): Promise<Metadata> => {
  const [eventoId, cpf] = params.inscricao;

  if (!cpf || !eventoId) {
    return {
      title: "Ticket",
    };
  }

  const data = await api.inscricao.getInscricaoByCPFToTicketRoute({
    cpf,
    eventoId,
  });
  const username = data?.register?.nome;
  const firstAndSecondName = username
    ? username.split(" ").slice(0, 2).join(" ")
    : "";

  return {
    title: `Ticket - ${firstAndSecondName}`,
  };
};

export default async function TicketPage({ params }: TicketPage) {
  const [eventoId, cpf] = params.inscricao;

  if (!cpf || !eventoId) {
    return redirect("/404");
  }

  if (cpf.length !== 11) {
    return redirect("/404");
  }

  const data = await api.inscricao.getInscricaoByCPFToTicketRoute({
    cpf,
    eventoId,
  });

  if (!data) {
    return (
      <Section>
        <Card className="z-10">
          <CardHeader>
            <CardTitle>Ops!</CardTitle>
            <CardDescription>Não encontramos nenhum resultado.</CardDescription>
          </CardHeader>
          <CardContent className="mt-6 flex w-full flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <Button variant="outline" className="w-full">
              <Link href="/">Página inicial</Link>
            </Button>

            <Button variant="default" className="w-full">
              <Link href="/ticket">Buscar por outro CPF</Link>
            </Button>
          </CardContent>
        </Card>
      </Section>
    );
  }

  return (
    <Container className="pb-16">
      <div className="ml-8 mt-24 flex items-center gap-1 sm:ml-16">
        <TicketCheck size={28} />
        <h1 className="ml-2 font-bold">Ticket</h1>
      </div>
      <div className="flex flex-col justify-center pb-8 sm:px-16">
        <Suspense fallback={<TicketSkeleton />}>
          <Ticket {...data} />
        </Suspense>
      </div>
    </Container>
  );
}
