"use client";

import { StepTrigger } from "@/app/_components/ui/step-trigger";
import * as Tabs from "@radix-ui/react-tabs";
import { PayerForm, PaymentForm } from "./payment-form";
import { TicketByType } from "./ticket-by-type";
import { useTickets } from "./stores/ticket-store";
import { Button } from "@/app/_components/ui/button";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";

const steps = [
  { step: "data", label: "Dados Pessoais" },
  { step: "payment", label: "Pagamento" },
];

export const RegisterTabs = () => {
  const { tickets, step, setStep, setStartRegister, setTickets } = useTickets();

  const { setMethod } = useCalcValueTopStore();

  return (
    <Tabs.Root value={step} className="flex flex-col items-center">
      <Tabs.List className="flex w-full items-center justify-center rounded-md border bg-card px-2 py-2 shadow-lg sm:px-6">
        {steps.map(({ step: _step, label }, index) => (
          <StepTrigger
            key={_step}
            label={label}
            step={_step}
            currentStep={step}
            handleStepChange={() => setStep(_step as "data" | "payment")}
            index={index}
            totalSteps={steps.length}
          />
        ))}
      </Tabs.List>

      <Tabs.Content
        value={"data"}
        className="mt-4 w-full space-y-6 rounded-md border bg-card p-4"
      >
        <PayerForm />

        <div className="space-y-3">
          <p className="text-lg font-bold">
            Preencha com os dados dos titulares dos ingressos
          </p>

          {tickets.map(({ index, type }) => (
            <TicketByType key={index} type={type} index={index} />
          ))}
        </div>

        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => {
            setStartRegister(false);
            setTickets([]);
            setStep("data");
            setMethod("pix");
          }}
        >
          Voltar
        </Button>
      </Tabs.Content>

      <Tabs.Content
        value="payment"
        className="mt-4 w-full space-y-4 rounded-md border bg-card p-4"
      >
        <PaymentForm />
      </Tabs.Content>
    </Tabs.Root>
  );
};
