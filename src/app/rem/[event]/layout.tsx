"use client";

import { ContainerFormHeader } from "@/components/container-form-header";
import { InitialModalRegister } from "@/components/initial-modal-register";
import { useFormStore } from "@/components/participante/useFormStore";
import { ContainerSpace } from "@/components/ui/container";
import { Countdown } from "@/components/ui/countdown-time";
import { Section } from "@/components/ui/section";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function RegisterRemLayout({
  params,
  children,
}: {
  params: { event: string };
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { setEventRegister } = useFormStore();

  React.useEffect(() => {
    void setEventRegister(params.event, router);
  }, [params.event, setEventRegister]);

  const registerType = React.useMemo(() => {
    const lastPathname = pathname.split("/").pop();
    return lastPathname === "servir" ? "SERVIR" : "PARTICIPANTE";
  }, [pathname]);

  return (
    <Section className="px-2">
      <ContainerSpace className="relative h-full w-full gap-6 py-24 sm:gap-8">
        <ContainerFormHeader />

        {children}
        <InitialModalRegister registerType={registerType} />
      </ContainerSpace>
      <Countdown />
    </Section>
  );
}
