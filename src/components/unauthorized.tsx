"use client";

import { KeyRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Section } from "./ui/section";
import { Button } from "./ui/button";
import { useRouter } from "nextjs-toploader/app";

type UnauthorizedProps = {
  description?: string;
};

export const Unauthorized = ({ description }: UnauthorizedProps) => {
  const router = useRouter();

  const handleBackButton = () => {
    if (document.referrer === window.location.href) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <Section className="flex items-center justify-center">
      <Card className="w-full p-4 sm:w-[480px]">
        <CardHeader className="items-center justify-center text-center">
          <div className=" flex h-10 w-10 flex-col items-center justify-center gap-4 rounded-full border border-primary-foreground/10 bg-input">
            <KeyRound className="text-primary" size={20} />
          </div>
          <CardTitle>Acesso Negado</CardTitle>
          <CardDescription>
            {!description ? (
              <>
                Você não tem permissão para acessar esta página.
                <br /> Por favor, entre em contato com o administrador se achar
                que isso é um erro.
              </>
            ) : (
              description
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-end gap-4">
          <Button onClick={handleBackButton} variant="outline">
            Voltar
          </Button>
          <Button onClick={() => router.push("/")} variant="secondary">
            Página Inicial
          </Button>
        </CardContent>
      </Card>
    </Section>
  );
};
