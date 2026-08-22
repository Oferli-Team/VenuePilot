import * as Tabs from "@radix-ui/react-tabs";
import { DollarSign, FileMinus, User } from "lucide-react";
import ServirForm from "./servir/servir-form";
import { StepTrigger } from "./ui/step-trigger";
import RegistrationTypeForm from "./servir/registration-type-form";
// import PaymentFormServir from "./servir/paymentFormServir";
import { useEffect } from "react";
import PaymentFormServirAsaas from "./servir/paymentFormServirAsaas";
import { useStepsServir } from "@/app/hook/useStepsServir";

export const StepsServir = () => {
  const { currentStep, handleStepChange } = useStepsServir();

  const renderStepContent = () => {
    switch (currentStep) {
      case "registrationType":
        return <RegistrationTypeForm />;
      case "personal":
        return <ServirForm />;
      case "payment":
        // return <PaymentFormServir />;
        return <PaymentFormServirAsaas />;
      default:
        return null;
    }
  };

  const steps = [
    {
      step: "registrationType",
      label: "Tipo de Inscrição",
      icon: <FileMinus size={22} />,
    },
    {
      step: "personal",
      label: "Dados Pessoais",
      icon: <User size={22} />,
    },
    {
      step: "payment",
      label: "Pagamento",
      icon: <DollarSign size={22} />,
    },
  ];

  useEffect(() => {
    window.scrollTo({
      top: currentStep === "registrationType" ? 0 : 100, // scroll até componente dos steps
      behavior: "smooth",
    });
  }, [currentStep]);

  return (
    <Tabs.Root value={currentStep} className="flex flex-col items-center">
      <Tabs.List className="flex max-w-fit items-center justify-center rounded-md bg-card px-6 py-2 shadow-md">
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
        className="mt-6 w-full rounded-lg border border-input bg-card px-2 py-4 shadow-md sm:px-4"
      >
        {renderStepContent()}
      </Tabs.Content>
    </Tabs.Root>
  );
};
