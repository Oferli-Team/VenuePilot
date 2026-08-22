'use client'

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type Step = 'personal' | 'health' | 'uniform_terms' | 'payment';

type StepsRegisterContextProps = {
  currentStep: Step
  handleStepChange: (step: Step) => void
};

export const StepsRegisterContext = createContext<StepsRegisterContextProps | undefined>(undefined)

export const StepsRegisterProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<Step>('personal');

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
  };

  return (
    <StepsRegisterContext.Provider value={{ currentStep, handleStepChange }}>
      {children}
    </StepsRegisterContext.Provider>
  )
};

export const useStepsRegister = () => {
  const context = useContext(StepsRegisterContext);
  if (!context) {
    throw new Error("useStepsRegister must be used within a StepsRegisterProvider");
  }
  return context;
};

