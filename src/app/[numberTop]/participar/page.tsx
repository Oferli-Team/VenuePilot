"use client";

import { type ManadaPagesParams } from "@/lib/types";
import { StepsRegister } from "@/components/StepsRegister";
import { ContainerFormHeader } from "@/components/container-form-header";
import { Countdown } from "@/components/ui/countdown-time";
import { Suspense, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useFormStore } from "@/components/participante/useFormStore";
import { useRouter } from "next/navigation";
import { ContainerSpace } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export default function ParticiparPage({ params }: ManadaPagesParams) {
  const router = useRouter();
  const { setEventRegister } = useFormStore();

  useEffect(() => {
    void setEventRegister(params.numberTop, router);
  }, [params.numberTop, setEventRegister]);

  return (
    <Section>
      <ContainerSpace className="relative h-full w-full pt-24">
        <ContainerFormHeader />
        <Suspense fallback={<Spinner />}>
          <StepsRegister />
        </Suspense>
      </ContainerSpace>
      <Countdown />
    </Section>
  );
}
