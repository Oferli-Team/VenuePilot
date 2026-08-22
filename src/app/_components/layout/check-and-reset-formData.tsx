"use client";

import { usePathname } from "next/navigation";
import { useFormStore } from "../participante/useFormStore";
import { useEffect } from "react";
import { useStepsRegister } from "@/app/hook/useStepsRegister";
import { useStepsServir } from "@/app/hook/useStepsServir";

export const CheckAndResetFormData = () => {
  const pathname = usePathname();
  const { resetFormStore } = useFormStore();
  const { handleStepChange } = useStepsRegister();
  const { handleStepChange: handleStepChangeServir } = useStepsServir();

  useEffect(() => {
    if (pathname !== "/participar" && pathname !== "/servir") {
      resetFormStore();
      handleStepChange("personal");
      handleStepChangeServir("registrationType");
    }
  }, [pathname]);

  return <></>;
};
