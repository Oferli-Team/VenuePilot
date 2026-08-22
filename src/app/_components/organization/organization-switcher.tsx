"use client";

import { useFindManyOrganizations } from "@/lib/hooks/organization";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { Check, ChevronDownIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function OrganizationSwitcher() {
  const { organizations, isLoading } = useFindManyOrganizations();

  const [currentOrgSlug, setCurrentOrgSlug] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const orgSlugFromPath = pathname.startsWith("/manada/")
      ? pathname.split("/")[2]
      : null;

    if (orgSlugFromPath) {
      // Update cookie directly when path changes
      document.cookie = `orgSlug=${orgSlugFromPath}; path=/`;
      setCurrentOrgSlug(orgSlugFromPath);
    } else {
      setCurrentOrgSlug(getCurrentOrgFromCookie());
    }
  }, [pathname]);

  const currentOrganization = organizations?.find(
    (org) => org.slug === currentOrgSlug,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden space-y-1 sm:block">
        <p className="text-start text-xs">Pista</p>
        <div className="flex items-center gap-6">
          <span className="font-semibold">
            {isLoading
              ? "Carregando..."
              : (currentOrganization?.name ?? "Selecione uma organização")}
          </span>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>Pistas</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {organizations?.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => {
              router.push(`/manada/${org.slug}`);
            }}
            className="cursor-pointer justify-between py-3 font-semibold"
          >
            {org.name}
            {currentOrganization?.id === org.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem
          onSelect={() => {
            router.push(orgsRoutes.createOrg);
          }}
          className="justify-between"
        >
          Criar organização
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
