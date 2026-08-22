import { ContainerSpace } from "@/components/ui/container";
import { Unauthorized } from "@/components/unauthorized";
import { getCurrentMembership } from "@/lib/auth/ability";
import { isAdmin } from "@/lib/utils/hasRole";
import { type ReactNode } from "react";

export default async function CupomDescontoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const membership = await getCurrentMembership();

  if (!isAdmin(membership)) {
    return <Unauthorized />;
  }

  return <ContainerSpace>{children}</ContainerSpace>;
}
