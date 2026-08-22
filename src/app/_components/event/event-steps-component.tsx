"use client";

import {
  type EventSteps,
  useEventStepsStore,
} from "@/app/(pages)/manada/[orgSlug]/criar-evento/event-step-store";
import { FormCreateEvent } from "./form-create-event";
import { FormEventTicket } from "./form-event-ticket";
import { FormEventTerms } from "./form-event-terms";
import { FormEventList } from "./form-event-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Heading } from "../ui/heading";
import React, { useEffect } from "react";
import { SuccessCard } from "../success-card";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useRouter } from "nextjs-toploader/app";
import { setEventInCookie } from "@/lib/utils/getCurrentEventFromCookie";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { useEventStore } from "@/lib/store/EventStore";
import { ENUM_EVENT_TYPE } from "@/lib/enum";

export const EventStepsComponent = ({ isEdit }: { isEdit: boolean }) => {
  const orgSlug = getCurrentOrgFromCookie();
  const { event } = useEventStore();

  const {
    step: currentStep,
    setStep,
    formData,
    dirtySteps,
    setDirtyStep,
  } = useEventStepsStore();
  const [pendingStep, setPendingStep] = React.useState<string | null>(null);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const router = useRouter();

  const handleOpenEventCreated = () => {
    if (formData?.slug) {
      setEventInCookie(formData?.slug);
      router.push(`/manada/${orgSlug}/evento/${formData.slug}/dashboard`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "general":
        return <FormCreateEvent isEdit={isEdit} />;
      case "tickets":
        return <FormEventTicket isEdit={isEdit} />;
      case "terms":
        return <FormEventTerms isEdit={isEdit} />;
      case "list":
        return <FormEventList />;
      case "success":
        if (!isEdit) {
          return (
            <SuccessCard
              title="Evento criado com sucesso"
              description="Agora você pode configurar os detalhes do seu evento: publique para torná-lo visível, ative as inscrições e personalize conforme necessário."
              content={
                <Button onClick={handleOpenEventCreated} variant="secondary">
                  Ver Evento
                </Button>
              }
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  const eventType = event?.type as ENUM_EVENT_TYPE;
  const isManadaDayEvent = eventType === ENUM_EVENT_TYPE.MANADADAY;
  const steps = [
    {
      step: "general",
      label: "Dados Gerais",
      disable: false,
      visible: true,
    },
    {
      step: "tickets",
      label: "Ingressos",
      disable: !(isEdit || formData?.slug),
      visible: !isManadaDayEvent,
    },
    {
      step: "terms",
      label: "Termos",
      disable: !(isEdit || formData?.slug),
      visible: !isManadaDayEvent,
    },
    {
      step: "list",
      label: "Lista para o inscrito",
      disable: !(isEdit || formData?.slug),
      visible: !isManadaDayEvent,
    },
    {
      step: "success",
      label: "",
      disable: !(isEdit || formData?.slug),
      visible: false,
    },
  ];

  const handleStepChange = (value: string) => {
    if (dirtySteps[currentStep]) {
      setShowConfirm(true);
      setPendingStep(value);
    } else {
      setStep(value as EventSteps);
    }
  };

  const handleConfirmChange = () => {
    setDirtyStep(currentStep, false); // descarta alterações
    setStep(pendingStep as EventSteps);
    setShowConfirm(false);
    setPendingStep(null);
  };

  const handleCancelChange = () => {
    setShowConfirm(false);
    setPendingStep(null);
  };

  useEffect(() => {
    setStep("general");
  }, [isEdit, setStep]);

  return (
    <>
      <Tabs
        defaultValue="general"
        value={currentStep}
        onValueChange={handleStepChange}
        className="space-y-6"
      >
        <div className="space-y-4">
          <Heading title={`${isEdit ? "Editar" : "Criar"} evento`} />

          <TabsList>
            {steps.map(
              (step) =>
                step.visible && (
                  <TabsTrigger
                    disabled={step.disable}
                    key={step.step}
                    value={step.step}
                    className="relative"
                  >
                    {dirtySteps[step.step as EventSteps] && (
                      <Tooltip open={dirtySteps[step.step as EventSteps]}>
                        <TooltipTrigger asChild>
                          <div className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary"></div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">
                          Existem alterações não salvas
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <p>{step.label}</p>
                  </TabsTrigger>
                ),
            )}
          </TabsList>
        </div>

        <TabsContent value={currentStep}>
          {steps.map((step) => (
            <TabsContent
              key={step.step}
              className="rounded-sm bg-card p-4"
              value={step.step}
            >
              {currentStep === step.step && renderStepContent()}
            </TabsContent>
          ))}
        </TabsContent>
      </Tabs>

      <AlertDialog open={showConfirm}>
        <AlertDialogTrigger />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atenção!</AlertDialogTitle>
            <AlertDialogDescription>
              O evento possui alterações que não ainda foram salvas, deseja
              realmente continuar? Suas alterações serão perdidas caso continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={handleCancelChange}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction type="button" onClick={handleConfirmChange}>
              Continuar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
