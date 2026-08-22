import { api } from "@/trpc/react";

export const useFindManyOrganizations = () => {
  const { data: organizations, isLoading } = api.organization.getOrganizations.useQuery();
  return { organizations, isLoading };
};