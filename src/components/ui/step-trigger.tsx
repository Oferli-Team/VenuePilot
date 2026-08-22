import * as Tabs from "@radix-ui/react-tabs";

import React from "react";
import { Separator } from "./separator";
import { env } from "@/env";
import { type Step } from "@/app/hook/useStepsRegister";
import { Progress } from "./progress";

type StepTriggerProps = {
  step: string;
  label: string;
  // icon: React.ReactNode;
  currentStep: string;
  handleStepChange: (step: Step) => void;
  index: number;
  totalSteps: number;
};

export const StepTrigger = ({
  step,
  label,
  currentStep,
  handleStepChange,
  index,
  totalSteps,
}: StepTriggerProps) => (
  <div className="flex items-center">
    <Tabs.Trigger
      key={step}
      value={step}
      className={`relative cursor-pointer justify-between px-2 py-2 text-center sm:px-4`}
      onClick={() => {
        if (env.NEXT_PUBLIC_STEP_CHANGE === "false") return;
        handleStepChange(step as Step);
      }}
    >
      <div
        className={`flex flex-col items-center justify-center gap-1 ${currentStep === step ? "opacity-100" : "opacity-65"}`}
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform ${currentStep === step ? "scale-100 bg-primary" : "scale-90 bg-input"}`}
        >
          <p className=" text-sm font-semibold md:block">{index + 1}</p>
          {/* <p className="block md:hidden">{icon}</p> */}
        </div>
        <p className="hidden text-sm md:block">{label}</p>
      </div>
    </Tabs.Trigger>
    {index < totalSteps - 1 && <Separator className="w-8 bg-primary sm:w-8" />}
  </div>
);
