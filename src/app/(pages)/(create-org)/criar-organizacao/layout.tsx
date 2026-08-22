"use client";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { DetailBlur } from "@/components/DetailBlur";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "next-auth";

const SectionLayout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Section
      className={cn(
        "relative mt-6 flex h-full min-h-screen flex-col items-center justify-center pb-6",
        className,
      )}
    >
      <DetailBlur />

      {children}
    </Section>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  function getSessionStatus(
    session: Session | null | undefined,
  ): "authenticated" | "no-user" | "loading" {
    if (!session) return "loading";
    if (!session.user) return "no-user";
    return "authenticated";
  }

  const sessionStatus = getSessionStatus(session);

  return (
    <SectionLayout className="mt-24 items-start justify-normal gap-12">
      <Heading
        title={"Criar Pista"}
        subtitle="Deixe o trabalho pesado com o Inscrições TOP e crie experiências inesquecíveis!"
      />

      {sessionStatus === "loading" && (
        <div className="z-10 h-screen w-full rounded-md">
          <Skeleton className="h-full bg-card" />
        </div>
      )}

      {sessionStatus === "no-user" && (
        <div className="z-10 flex h-full w-full flex-col items-center">
          <Card className="absolute flex flex-col items-center justify-center py-8">
            <CardHeader className="text-center sm:max-w-[70%]">
              <CardTitle>É necessário fazer login</CardTitle>
              <CardDescription>
                Para criar uma pista na plataforma é necessário estar logado.
                Faça login ou crie uma conta para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent className="justify-center">
              <Button asChild>
                <Link href="/auth/signin">
                  <LogIn className="mr-2 size-4" /> Login!
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {sessionStatus === "authenticated" && (
        <div className="z-10 h-full w-full overflow-hidden rounded-md">
          {children}
        </div>
      )}
    </SectionLayout>
  );
}
