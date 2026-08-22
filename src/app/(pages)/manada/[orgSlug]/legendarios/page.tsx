"use client";

import { ContainerSpace } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Unauthorized } from "@/components/unauthorized";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { api } from "@/trpc/react";
import { Users2 } from "lucide-react";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isCheckIn } from "@/lib/utils/hasRole";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";

export default function AllLegendaryPage() {
  const orgSlug = getCurrentOrgFromCookie();
  const { membership, isLoading } = getCurrentMembership();

  const { data } = api.organization.getAllEventsOrg.useQuery(
    { orgSlug },
    { enabled: !!orgSlug },
  );

  if (isLoading) {
    return (
      <ContainerSpace className="relative mt-4">
        <Heading
          title="Legendários Formados"
          subtitle={"Todos legendários formados"}
          icon={Users2}
        />
        <DataTableSkeleton rowCount={6} columnCount={6} />
      </ContainerSpace>
    );
  }

  if (!isCheckIn(membership)) {
    return <Unauthorized />;
  }

  return (
    <ContainerSpace>
      <Heading
        title="Legendários Formados"
        subtitle={"Todos legendários formados"}
        icon={Users2}
      />

      {data && data.length > 0 ? (
        <DataTable
          search={{
            field: "",
            placeholder: "Busque por nome, número do LGND, cidade ou estado",
          }}
          columns={columns}
          data={data}
        />
      ) : (
        <DataTableSkeleton rowCount={6} columnCount={6} />
      )}
    </ContainerSpace>
  );
}
