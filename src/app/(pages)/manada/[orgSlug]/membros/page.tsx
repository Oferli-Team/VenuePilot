"use client";

import { InviteMember } from "@/components/membros/invite-member";
import { Invites } from "@/components/membros/invites";
import { MemberList } from "@/components/membros/member-list";
import { ContainerSpace } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Unauthorized } from "@/components/unauthorized";
import { useAbility } from "@/lib/auth/hooks/useAbility";
import { Users2 } from "lucide-react";

export default function MembrosPage() {
  const ability = useAbility();

  if (!ability.can("manage", "User")) {
    return <Unauthorized />;
  }

  return (
    <ContainerSpace>
      <Heading
        title="Membros"
        subtitle="Gerencie os membros da sua manada."
        icon={Users2}
        className="flex sm:hidden"
      />

      <div className="w-full">
        <InviteMember />
        <Invites />
        <MemberList />
      </div>
    </ContainerSpace>
  );
}
