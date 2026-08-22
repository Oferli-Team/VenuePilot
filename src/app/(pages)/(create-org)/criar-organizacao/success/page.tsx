"use client";

import { SuccessCard } from "@/components/success-card";
import { Button } from "@/components/ui/button";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";

export default function OrganizationCreatedSuccessPage() {
  const { orgsRoutes } = useEventRoutes({});

  return (
    <SuccessCard
      title="Pista criada com sucesso"
      description="Comece agora a organizar seus eventos, clique abaixo para visualizar o dashboard da sua Pista e criar novos eventos"
      content={
        <Button onClick={() => (window.location.href = orgsRoutes.dashboard)}>
          Começar!
        </Button>
      }
    />
  );
}
