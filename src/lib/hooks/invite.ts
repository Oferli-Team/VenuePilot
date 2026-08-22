import { api } from "@/trpc/react";
import { getCurrentOrgFromCookie } from "../utils/getCurrentOrgFromCookie";

export const useFindManyInvites = () => {
  const orgSlug = getCurrentOrgFromCookie();
  const { data: invites, isLoading, refetch } = api.invite.getInvites.useQuery({
    orgSlug: orgSlug ?? "",
  });
  return { invites, isLoading, refetch };
};