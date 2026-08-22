"use client";

import { Button } from "@/components/ui/button";
import { ContainerSpace } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Bus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";

export default function BoardingPlanLayout({
  children,
  params,
}: {
  readonly children: ReactNode;
  readonly params: { numberTop: string };
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    router.back();
  };

  const isBoardingPlanRoot = pathname.endsWith("criar-viatura");

  const heading = isBoardingPlanRoot ? "Crie uma viatura" : "Atualizar viatura";

  return (
    <ContainerSpace>
      <div className="ml-4 flex flex-col items-start gap-2">
        {!isBoardingPlanRoot && (
          <Button variant="link" onClick={handleBack} className="px-0">
            Voltar
          </Button>
        )}
        <Heading title="Plano de Embarque" subtitle={heading} icon={Bus} />
      </div>

      {children}
    </ContainerSpace>
  );
}
