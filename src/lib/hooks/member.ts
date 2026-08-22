import { getCurrentOrgFromCookie } from "../utils/getCurrentOrgFromCookie";
import { api } from "@/trpc/react";

export const useFindManyMembers = () => {
  const orgSlug = getCurrentOrgFromCookie();
  const { data, isLoading, refetch } =
    api.member.getOrganizationMembers.useQuery({
      slug: orgSlug ?? "",
    });

  const members = data?.map((member) => ({
    id: member.id,
    role: member.role,
    name: member.user.name,
    email: member.user.email,
    isOwner: member.user.id === member.organization.ownerId,
  }));
  return { members, isLoading, refetch };
};

export const getCurrentMembership = () => {
  const orgSlug = getCurrentOrgFromCookie();
  const { data, isLoading } = api.member.getUserMembership.useQuery({
    slug: orgSlug ?? "",
  });

  return {
    membership: data?.membership,
    organization: data?.organization,
    isLoading,
  };
};
