"use client";

import { StepsServir } from "@/components/StepsServir";
import { ContainerFormHeader } from "@/components/container-form-header";
import { useFormStore } from "@/components/participante/useFormStore";
import { ContainerSpace } from "@/components/ui/container";
import { Countdown } from "@/components/ui/countdown-time";
import { Section } from "@/components/ui/section";
import { Spinner } from "@/components/ui/spinner";
import { type ManadaPagesParams } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function RegisterFormSignIn({ params }: ManadaPagesParams) {
  const router = useRouter();
  const { setEventRegister } = useFormStore();

  useEffect(() => {
    void setEventRegister(params.numberTop, router);
  }, [params.numberTop, setEventRegister, router]);

  return (
    <Section>
      <ContainerSpace className="relative h-full w-full pt-24">
        <ContainerFormHeader />
        <Suspense fallback={<Spinner />}>
          <StepsServir />
        </Suspense>
      </ContainerSpace>
    </Section>
  );
}
