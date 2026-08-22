"use client";

import { ContainerSpace } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Unauthorized } from "@/components/unauthorized";
import { useAbility } from "@/lib/auth/hooks/useAbility";
import { Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

export default function InscritosLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const ability = useAbility();

  if (!ability.can("read", "Event")) {
    return <Unauthorized />;
  }

  // should not applied layout.tsx if is [id] route
  if (
    pathname.includes("/participantes/") ||
    pathname.includes("/legendarios/")
  ) {
    return <>{children}</>;
  }

  return (
    <ContainerSpace className="relative">
      <Heading
        className="sm:hidden"
        title="Inscritos"
        icon={Users}
        subtitle={
          pathname.includes("legendarios")
            ? "Legendários - Servir"
            : "Participantes - Primeira Vez"
        }
      />

      {children}
    </ContainerSpace>
  );
}
