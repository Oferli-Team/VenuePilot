"use client";

import { ArrowLeft, ThumbsDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "nextjs-toploader/app";
import { cn } from "@/lib/utils";

type NotFound = {
  className?: string;
  title?: string;
  description?: string;
};

export const NotFound = ({
  className,
  title = "Ops, Evento não localizado!",
  description = "O evento que você procura não existe ou não está disponível no momento.",
}: NotFound) => {
  const router = useRouter();
  return (
    <Card className={cn("w-full p-4 sm:w-[480px]", className)}>
      <CardHeader className="items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 flex-col items-center justify-center rounded-full border border-primary-foreground/10 bg-input">
          <ThumbsDown className="size-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-4 flex items-center justify-end">
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Voltar
        </Button>
      </CardContent>
    </Card>
  );
};
