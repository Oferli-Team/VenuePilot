'use client'

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type StepServir = 'registrationType' | 'personal' | 'payment';

type StepsServirContextProps = {
  currentStep: StepServir
  handleStepChange: (step: StepServir) => void
};

export const StepsServirContext = createContext<StepsServirContextProps | undefined>(undefined)

export const StepsServirProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<StepServir>('registrationType');

  const handleStepChange = (step: StepServir) => {
    setCurrentStep(step);
  };

  return (
    <StepsServirContext.Provider value={{ currentStep, handleStepChange }}>
      {children}
    </StepsServirContext.Provider>
  )
};

export const useStepsServir = () => {
  const context = useContext(StepsServirContext);
  if (!context) {
    throw new Error("useStepsServir must be used within a StepsServirProvider");
  }
  return context;
};