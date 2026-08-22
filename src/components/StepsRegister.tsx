"use client";

import * as Tabs from "@radix-ui/react-tabs";
import DadosPessoais from "./participante/dadosPessoaisForm";
import DadosSaude from "./participante/dadosSaudeForm";
import Fardamento from "./participante/fardamentoForm";
import { DollarSign, Handshake, HeartPulse, User } from "lucide-react";
import { StepTrigger } from "./ui/step-trigger";
import { useEffect } from "react";
import PaymentFormParticipanteAsaas from "./participante/paymentFormParticipanteAsaas";
import { useStepsRegister } from "@/app/hook/useStepsRegister";

export const StepsRegister = () => {
  const { currentStep, handleStepChange } = useStepsRegister();

  const renderStepContent = () => {
    switch (currentStep) {
      case "personal":
        return <DadosPessoais />;
      case "health":
        return <DadosSaude />;
      case "uniform_terms":
        return <Fardamento />;
      case "payment":
        return <PaymentFormParticipanteAsaas />;
      default:
        return null;
    }
  };

  const steps = [
    {
      step: "personal",
      label: "Dados Pessoais",
      icon: <User size={22} />,
    },
    {
      step: "health",
      label: "Dados Saúde",
      icon: <HeartPulse size={22} />,
    },
    {
      step: "uniform_terms",
      label: "Farda e Termo",
      icon: <Handshake size={22} />,
    },
    {
      step: "payment",
      label: "Pagamento",
      icon: <DollarSign size={22} />,
    },
  ];

  useEffect(() => {
    window.scrollTo({
      top: currentStep === "personal" ? 0 : 100, // scroll até componente dos steps
      behavior: "smooth",
    });
  }, [currentStep]);

  return (
    <Tabs.Root value={currentStep} className="flex flex-col items-center">
      <Tabs.List className="flex max-w-fit items-center justify-center rounded-md bg-card px-2 py-2 shadow-md sm:px-6">
        {steps.map((step, index) => (
          <StepTrigger
            key={step.step}
            {...step}
            currentStep={currentStep}
            handleStepChange={handleStepChange}
            index={index}
            totalSteps={steps.length}
          />
        ))}
      </Tabs.List>

      <Tabs.Content
        value={currentStep}
        className="mt-6 w-full rounded-lg border border-input bg-card px-3 py-4 shadow-md sm:px-4"
      >
        {renderStepContent()}
      </Tabs.Content>
    </Tabs.Root>
  );
};
