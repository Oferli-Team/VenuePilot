"use client";

import { ContainerSpace } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Unauthorized } from "@/components/unauthorized";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isAdmin } from "@/lib/utils/hasRole";
import React from "react";
import { FaMoneyCheckDollar } from "react-icons/fa6";

export default function CheckinLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const { membership, isLoading } = getCurrentMembership();

  if (isLoading) {
    return (
      <ContainerSpace>
        <Heading
          className="sm:hidden"
          title="Situação de Pagamento"
          icon={FaMoneyCheckDollar}
        />
        {children}
      </ContainerSpace>
    );
  }

  if (!isAdmin(membership)) {
    return <Unauthorized />;
  }

  return (
    <ContainerSpace className="relative">
      <Heading
        className="sm:hidden"
        title="Situação de Pagamento"
        icon={FaMoneyCheckDollar}
      />

      {children}
    </ContainerSpace>
  );
}
