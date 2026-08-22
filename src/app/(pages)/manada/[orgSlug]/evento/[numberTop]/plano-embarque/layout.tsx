"use client";

import { Unauthorized } from "@/components/unauthorized";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isCheckIn } from "@/lib/utils/hasRole";
import React from "react";

export default function BoardingPlanLayoutPage({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { membership, isLoading } = getCurrentMembership();

  if (isLoading) {
    return <>{children}</>;
  }

  if (!isCheckIn(membership)) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}
